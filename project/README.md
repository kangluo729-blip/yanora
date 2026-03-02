# Yanora 美容诊所管理系统

基于 Node.js + Express + PostgreSQL + React 的美容诊所预约和管理系统。

## 技术栈

### 后端
- Node.js + Express
- PostgreSQL
- JWT 认证
- Multer 文件上传

### 前端
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd project
```

### 2. 安装 PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
下载并安装: https://www.postgresql.org/download/windows/

### 3. 创建数据库

```bash
sudo -u postgres psql
```

在 PostgreSQL 中执行:
```sql
CREATE DATABASE yanora_db;
CREATE USER yanora_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;
\q
```

### 4. 配置后端

```bash
cd server
npm install
```

编辑 `server/.env`:
```env
PORT=3001
JWT_SECRET=your-super-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yanora_db
DB_USER=yanora_user
DB_PASSWORD=your_password
```

### 5. 初始化数据库

```bash
cd server
node database/init.js
```

### 6. 创建管理员账户

使用 bcryptjs 生成密码哈希:

```javascript
// create-admin.js
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10, (err, hash) => {
  console.log('Password hash:', hash);
});
```

运行:
```bash
node create-admin.js
```

然后在 PostgreSQL 中:
```sql
INSERT INTO users (email, password_hash)
VALUES ('admin@example.com', '<生成的哈希>');

INSERT INTO admins (user_id, email, role)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'super_admin'
);
```

### 7. 启动后端服务器

```bash
cd server
npm start

# 或开发模式
npm run dev
```

后端将运行在 http://localhost:3001

### 8. 配置前端

```bash
# 返回项目根目录
cd ..
npm install
```

编辑 `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 9. 启动前端

```bash
npm run dev
```

前端将运行在 http://localhost:5173

## 项目结构

```
project/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── contexts/          # React Context
│   ├── lib/
│   │   └── api.ts         # API 客户端
│   └── ...
├── server/                 # 后端源码
│   ├── config/            # 配置文件
│   ├── database/          # 数据库脚本
│   ├── middleware/        # 中间件
│   ├── routes/            # API 路由
│   └── server.js          # 服务器入口
├── public/                # 静态文件
└── dist/                  # 构建输出
```

## API 文档

### 认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户

### 管理员

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/admins` - 获取管理员列表
- `POST /api/admin/admins` - 创建管理员
- `PATCH /api/admin/admins/:id` - 更新管理员
- `DELETE /api/admin/admins/:id` - 删除管理员

### 预约

- `POST /api/bookings` - 创建预约
- `GET /api/bookings` - 获取用户预约
- `GET /api/bookings/all` - 获取所有预约 (管理员)
- `PATCH /api/bookings/:id` - 更新预约
- `DELETE /api/bookings/:id` - 删除预约

### 案例

- `GET /api/cases/simple` - 获取简单案例
- `GET /api/cases/detailed` - 获取详细案例
- `POST /api/cases/simple` - 创建简单案例 (管理员)
- `POST /api/cases/detailed` - 创建详细案例 (管理员)

### 上传

- `POST /api/upload/image` - 上传单个图片
- `POST /api/upload/images` - 上传多个图片

## 部署

### 生产环境配置

#### 后端 (.env)
```env
PORT=3001
JWT_SECRET=<强密码>
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=yanora_db
DB_USER=yanora_user
DB_PASSWORD=<强密码>
```

#### 前端 (.env)
```env
VITE_API_URL=https://your-domain.com/api
```

### 使用 PM2 部署

```bash
npm install -g pm2

cd server
pm2 start server.js --name yanora-api
pm2 startup
pm2 save
```

### 使用 Docker 部署

```bash
docker-compose up -d
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

## 构建生产版本

```bash
npm run build
```

构建的文件在 `dist/` 目录。

## 数据库备份

```bash
# 备份
pg_dump -U yanora_user yanora_db > backup.sql

# 恢复
psql -U yanora_user yanora_db < backup.sql
```

## 开发指南

### 添加新的 API 端点

1. 在 `server/routes/` 创建或编辑路由文件
2. 在 `server/server.js` 注册路由
3. 在 `src/lib/api.ts` 添加客户端方法
4. 在组件中调用

### 数据库迁移

修改 `server/database/schema.sql` 后:

```bash
cd server
node database/init.js
```

## 故障排除

### 数据库连接失败
- 检查 PostgreSQL 是否运行
- 验证 .env 配置
- 检查防火墙设置

### 认证失败
- 确认 JWT_SECRET 已配置
- 检查 token 存储
- 验证 CORS 设置

### 文件上传失败
- 确保 `public/uploads` 目录存在
- 检查目录权限
- 验证文件大小和类型限制

## 许可证

MIT

## 支持

如有问题,请查看 `MIGRATION_GUIDE.md` 了解详细的迁移和部署说明。
