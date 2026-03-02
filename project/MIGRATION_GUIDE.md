# 从 Supabase 迁移到传统架构指南

## 概述

本项目已从 Supabase 架构迁移到传统的 Node.js + Express + PostgreSQL 架构。

## 架构变化

### 之前 (Supabase)
```
前端 → Supabase Client → Supabase 云服务
```

### 现在 (传统架构)
```
前端 → API Client → Express 后端 → PostgreSQL 数据库
```

## 目录结构

```
project/
├── src/                    # 前端代码
│   ├── components/         # React 组件
│   ├── lib/
│   │   └── api.ts         # 新的 API 客户端 (替代 supabase.ts)
│   └── ...
├── server/                 # 后端代码 (新增)
│   ├── config/
│   │   └── database.js    # 数据库连接配置
│   ├── middleware/
│   │   └── auth.js        # JWT 认证中间件
│   ├── routes/
│   │   ├── auth.js        # 认证路由
│   │   ├── admin.js       # 管理员路由
│   │   ├── bookings.js    # 预约路由
│   │   ├── cases.js       # 案例路由
│   │   └── upload.js      # 文件上传路由
│   ├── database/
│   │   ├── schema.sql     # 数据库模式
│   │   └── init.js        # 数据库初始化脚本
│   ├── .env               # 环境变量配置
│   ├── package.json       # 后端依赖
│   └── server.js          # Express 服务器入口
└── ...
```

## 部署步骤

### 1. 安装 PostgreSQL

在服务器上安装 PostgreSQL 数据库:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql

# macOS
brew install postgresql
brew services start postgresql
```

### 2. 创建数据库

```bash
# 登录 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE yanora_db;
CREATE USER yanora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;
\q
```

### 3. 配置后端环境变量

编辑 `server/.env` 文件:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL=postgresql://yanora_user:your_secure_password@localhost:5432/yanora_db

DB_HOST=localhost
DB_PORT=5432
DB_NAME=yanora_db
DB_USER=yanora_user
DB_PASSWORD=your_secure_password
```

### 4. 安装后端依赖

```bash
cd server
npm install
```

### 5. 初始化数据库

```bash
cd server
node database/init.js
```

这将创建所有必要的表、索引和触发器。

### 6. 创建超级管理员

登录 PostgreSQL 并手动创建第一个管理员:

```sql
-- 首先在 users 表中创建用户 (密码需要用 bcrypt 加密)
INSERT INTO users (email, password_hash)
VALUES ('admin@example.com', '$2a$10$...');  -- 使用 bcrypt 加密的密码

-- 获取用户 ID
SELECT id FROM users WHERE email = 'admin@example.com';

-- 在 admins 表中添加管理员权限
INSERT INTO admins (user_id, email, role)
VALUES ('user-id-from-above', 'admin@example.com', 'super_admin');
```

或者使用 bcryptjs 生成密码哈希:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your-password';
bcrypt.hash(password, 10, (err, hash) => {
  console.log(hash);  // 使用这个哈希值
});
```

### 7. 启动后端服务器

```bash
cd server
npm start

# 开发模式 (自动重启)
npm run dev
```

服务器将在 http://localhost:3001 启动。

### 8. 配置前端环境变量

创建或编辑 `.env` 文件:

```env
VITE_API_URL=http://localhost:3001/api
```

生产环境:
```env
VITE_API_URL=https://your-domain.com/api
```

### 9. 构建和部署前端

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 生成的文件在 dist/ 目录
```

### 10. 部署到生产环境

#### 方案 A: 使用 Nginx 作为反向代理

**Nginx 配置示例:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传的文件
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

#### 方案 B: 使用 PM2 管理 Node.js 进程

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd server
pm2 start server.js --name yanora-api

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs yanora-api
```

#### 方案 C: 使用 Docker

**Dockerfile (后端):**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --production

COPY server/ ./

EXPOSE 3001

CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: yanora_db
      POSTGRES_USER: yanora_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: yanora_db
      DB_USER: yanora_user
      DB_PASSWORD: your_secure_password
      JWT_SECRET: your-super-secret-jwt-key
    ports:
      - "3001:3001"

volumes:
  postgres_data:
```

启动:
```bash
docker-compose up -d
```

## 代码迁移示例

### 认证相关

**之前 (Supabase):**
```typescript
import { supabase } from '../lib/supabase';

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// 注册
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// 登出
await supabase.auth.signOut();

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser();
```

**现在 (API Client):**
```typescript
import { api } from '../lib/api';

// 登录
const { user, token } = await api.login(email, password);

// 注册
const { user, token } = await api.register(email, password);

// 登出
await api.logout();

// 获取当前用户
const { user } = await api.getCurrentUser();
```

### 数据库查询

**之前 (Supabase):**
```typescript
// 查询
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', userId);

// 插入
const { data, error } = await supabase
  .from('bookings')
  .insert([bookingData])
  .select()
  .single();

// 更新
const { data, error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId);

// 删除
const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', bookingId);
```

**现在 (API Client):**
```typescript
// 查询
const bookings = await api.getBookings();

// 插入
const booking = await api.createBooking(bookingData);

// 更新
const updated = await api.updateBooking(bookingId, { status: 'confirmed' });

// 删除
await api.deleteBooking(bookingId);
```

### 文件上传

**之前 (Supabase Storage):**
```typescript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload(`path/${file.name}`, file);

const url = supabase.storage
  .from('bucket-name')
  .getPublicUrl(`path/${file.name}`).data.publicUrl;
```

**现在 (Upload API):**
```typescript
const { url } = await api.uploadImage(file);
// url 格式: /uploads/filename.jpg

// 完整 URL
const fullUrl = `${window.location.origin}${url}`;
```

## API 端点说明

### 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 管理员 API

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/admins` - 获取所有管理员
- `POST /api/admin/admins` - 创建管理员
- `PATCH /api/admin/admins/:userId` - 更新管理员
- `DELETE /api/admin/admins/:userId` - 删除管理员

### 预约 API

- `POST /api/bookings` - 创建预约
- `GET /api/bookings` - 获取用户的预约
- `GET /api/bookings/all` - 获取所有预约 (管理员)
- `PATCH /api/bookings/:id` - 更新预约状态 (管理员)
- `DELETE /api/bookings/:id` - 删除预约 (管理员)

### 案例 API

- `GET /api/cases/simple` - 获取激活的简单案例
- `GET /api/cases/simple/all` - 获取所有简单案例 (管理员)
- `POST /api/cases/simple` - 创建简单案例 (管理员)
- `PATCH /api/cases/simple/:id` - 更新简单案例 (管理员)
- `DELETE /api/cases/simple/:id` - 删除简单案例 (管理员)
- `GET /api/cases/detailed?category=xxx` - 获取详细案例
- `GET /api/cases/detailed/all` - 获取所有详细案例 (管理员)
- `POST /api/cases/detailed` - 创建详细案例 (管理员)
- `PATCH /api/cases/detailed/:id` - 更新详细案例 (管理员)
- `DELETE /api/cases/detailed/:id` - 删除详细案例 (管理员)

### 上传 API

- `POST /api/upload/image` - 上传单个图片
- `POST /api/upload/images` - 上传多个图片

## 数据库备份

### 备份数据库

```bash
pg_dump -U yanora_user -d yanora_db > backup.sql
```

### 恢复数据库

```bash
psql -U yanora_user -d yanora_db < backup.sql
```

### 自动备份脚本

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U yanora_user yanora_db > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## 常见问题

### 1. 数据库连接失败

检查:
- PostgreSQL 是否运行: `sudo systemctl status postgresql`
- 连接配置是否正确: `server/.env`
- 防火墙设置

### 2. 认证失败

检查:
- JWT_SECRET 是否配置
- Token 是否正确存储在 localStorage
- 后端 CORS 配置

### 3. 文件上传失败

检查:
- `public/uploads` 目录是否存在且有写权限
- 文件大小限制 (默认 10MB)
- 文件类型是否允许

### 4. 管理员无法登录

确保在数据库中正确创建了管理员记录,包括 `users` 表和 `admins` 表。

## 性能优化建议

1. **数据库索引**: 已在 `schema.sql` 中创建,确保已执行
2. **连接池**: 使用 `pg.Pool` 管理数据库连接
3. **缓存**: 考虑使用 Redis 缓存频繁查询的数据
4. **CDN**: 将静态文件和上传的图片放到 CDN
5. **负载均衡**: 使用 Nginx 或云服务的负载均衡器

## 安全建议

1. **使用 HTTPS**: 生产环境必须使用 HTTPS
2. **强密码策略**: 实施密码复杂度要求
3. **限流**: 添加 API 请求限流防止滥用
4. **输入验证**: 严格验证所有用户输入
5. **SQL 注入防护**: 使用参数化查询 (已实现)
6. **XSS 防护**: 前端输出时转义 HTML
7. **CSRF 防护**: 添加 CSRF token
8. **定期更新**: 保持依赖包最新

## 监控和日志

建议添加:
- **Winston** 或 **Pino** 用于结构化日志
- **Morgan** 用于 HTTP 请求日志
- **Sentry** 用于错误追踪
- **New Relic** 或 **DataDog** 用于性能监控

## 支持

如有问题,请参考:
- Express 文档: https://expressjs.com/
- PostgreSQL 文档: https://www.postgresql.org/docs/
- Node.js 最佳实践: https://github.com/goldbergyoni/nodebestpractices
