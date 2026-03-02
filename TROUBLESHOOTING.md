# 故障排查指南

## 常见问题及解决方案

### 1. 数据库连接问题

#### 问题：无法连接到 PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案：**

1. 检查 PostgreSQL 是否运行
```bash
# Windows
services.msc  # 查找 postgresql 服务

# Linux
sudo systemctl status postgresql

# Mac
brew services list
```

2. 检查端口是否正确
```bash
# 查看 PostgreSQL 监听端口
netstat -ano | findstr :5432  # Windows
netstat -tlnp | grep 5432     # Linux
```

3. 验证数据库配置
```bash
# 测试连接
psql -h localhost -U yanora_user -d yanora_db
```

4. 检查 `.env` 文件配置
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yanora_db
DB_USER=yanora_user
DB_PASSWORD=your_password
```

---

### 2. 端口占用问题

#### 问题：端口 3001 或 5173 已被占用
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案：**

1. 查找占用端口的进程
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :3001
kill -9 <进程ID>
```

2. 修改端口配置
```bash
# 后端: 编辑 project/server/.env
PORT=3002

# 前端: 编辑 project/vite.config.ts
server: {
  port: 5174
}
```

---

### 3. 管理员登录失败

#### 问题：管理员账户无法登录

**解决方案：**

1. 重新创建管理员账户
```bash
cd project/server
node create-admin.js
```

2. 检查数据库中的管理员记录
```sql
-- 连接数据库
psql -U yanora_user -d yanora_db

-- 查询管理员
SELECT u.email, a.role, a.is_active 
FROM users u 
JOIN admins a ON u.id = a.user_id;

-- 激活管理员
UPDATE admins SET is_active = true WHERE email = 'admin@yanora.com';
```

3. 清除浏览器缓存和 Cookie

---

### 4. 图片上传失败

#### 问题：上传图片时报错

**解决方案：**

1. 确保上传目录存在
```bash
# Windows
cd project/public
mkdir uploads

# Linux/Mac
mkdir -p project/public/uploads
chmod 755 project/public/uploads
```

2. 检查文件大小限制
```javascript
// project/server/routes/upload.js
// 默认限制 10MB
```

3. 检查文件类型
```javascript
// 允许的文件类型
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
```

---

### 5. 前端无法连接后端 API

#### 问题：API 请求失败，CORS 错误

**解决方案：**

1. 检查后端是否运行
```bash
curl http://localhost:3001/health
```

2. 验证前端 API 配置
```bash
# project/.env
VITE_API_URL=http://localhost:3001/api
```

3. 检查 CORS 配置
```javascript
// project/server/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

### 6. 数据库初始化失败

#### 问题：运行 init.js 时报错

**解决方案：**

1. 检查数据库权限
```sql
-- 授予所有权限
GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;
GRANT ALL ON SCHEMA public TO yanora_user;
```

2. 手动执行 SQL
```bash
psql -U yanora_user -d yanora_db -f project/server/database/schema.sql
```

3. 检查 PostgreSQL 版本
```bash
psql --version
# 需要 PostgreSQL 12+
```

---

### 7. JWT 认证失败

#### 问题：Token 验证失败

**解决方案：**

1. 检查 JWT_SECRET 配置
```bash
# project/server/.env
JWT_SECRET=your-secret-key
```

2. 清除旧的 Token
```javascript
// 浏览器控制台
localStorage.clear();
```

3. 检查 Token 过期时间
```javascript
// project/server/routes/auth.js
const token = jwt.sign({ userId: user.id }, JWT_SECRET, { 
  expiresIn: '7d' 
});
```

---

### 8. 构建失败

#### 问题：npm run build 报错

**解决方案：**

1. 清除缓存重新安装
```bash
cd project
rm -rf node_modules package-lock.json
npm install
```

2. 检查 TypeScript 错误
```bash
npm run typecheck
```

3. 检查环境变量
```bash
# 确保 .env 文件存在
cat .env
```

---

### 9. 性能问题

#### 问题：页面加载缓慢

**解决方案：**

1. 优化图片
```bash
# 压缩图片到合适大小
# 使用 WebP 格式
```

2. 启用数据库索引
```sql
-- 检查索引
\di

-- 创建缺失的索引
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
```

3. 启用 Nginx 缓存
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

### 10. 内存泄漏

#### 问题：Node.js 进程内存持续增长

**解决方案：**

1. 使用 PM2 监控
```bash
pm2 monit
```

2. 设置内存限制
```javascript
// ecosystem.config.js
max_memory_restart: '1G'
```

3. 检查数据库连接池
```javascript
// project/server/config/database.js
const pool = new Pool({
  max: 20,  // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 日志查看

### 后端日志
```bash
# PM2 日志
pm2 logs yanora-api

# 直接运行时的日志
cd project/server
npm start
```

### 前端日志
```bash
# 浏览器控制台
F12 -> Console

# Vite 开发服务器日志
cd project
npm run dev
```

### 数据库日志
```bash
# PostgreSQL 日志位置
# Windows: C:\Program Files\PostgreSQL\14\data\log
# Linux: /var/log/postgresql/
# Mac: /usr/local/var/log/postgresql@14/
```

---

## 性能分析

### 数据库查询分析
```sql
-- 查看慢查询
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- 分析查询计划
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = 'xxx';
```

### API 性能测试
```bash
# 使用 Apache Bench
ab -n 1000 -c 10 http://localhost:3001/api/cases/simple

# 使用 curl 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/health
```

---

## 紧急恢复

### 数据库恢复
```bash
# 从备份恢复
cd project/server
node scripts/restore-db.js ../../backups/yanora_backup_2024-01-01.sql
```

### 应用回滚
```bash
# 使用 Git 回滚
git log --oneline
git checkout <commit-hash>
npm install
npm run build
pm2 restart all
```

---

## 联系支持

如果以上方案都无法解决问题，请：

1. 收集错误日志
2. 记录复现步骤
3. 检查系统环境信息
4. 联系技术支持团队

---

**提示：** 定期备份数据库和重要文件，确保可以快速恢复！

