# Yanora 后端服务

Node.js + Express + PostgreSQL 后端 API 服务。

## 安装

```bash
npm install
```

## 配置

复制 `.env.example` 到 `.env` 并配置:

```env
PORT=3001
JWT_SECRET=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/yanora_db

DB_HOST=localhost
DB_PORT=5432
DB_NAME=yanora_db
DB_USER=your_username
DB_PASSWORD=your_password
```

## 初始化数据库

```bash
node database/init.js
```

## 启动服务器

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

## API 端点

服务器运行在 `http://localhost:3001`

### 健康检查
- `GET /health` - 服务器状态检查

### 认证 (`/api/auth`)
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `POST /logout` - 用户登出
- `GET /me` - 获取当前用户信息

### 管理员 (`/api/admin`)
- `POST /login` - 管理员登录
- `GET /admins` - 获取管理员列表 (需要管理员权限)
- `POST /admins` - 创建新管理员 (需要超级管理员权限)
- `PATCH /admins/:userId` - 更新管理员 (需要超级管理员权限)
- `DELETE /admins/:userId` - 删除管理员 (需要超级管理员权限)

### 预约 (`/api/bookings`)
- `POST /` - 创建预约
- `GET /` - 获取用户的预约 (需要认证)
- `GET /all` - 获取所有预约 (需要管理员权限)
- `PATCH /:id` - 更新预约状态 (需要管理员权限)
- `DELETE /:id` - 删除预约 (需要管理员权限)

### 案例 (`/api/cases`)
- `GET /simple` - 获取激活的简单案例
- `GET /simple/all` - 获取所有简单案例 (需要管理员权限)
- `POST /simple` - 创建简单案例 (需要管理员权限)
- `PATCH /simple/:id` - 更新简单案例 (需要管理员权限)
- `DELETE /simple/:id` - 删除简单案例 (需要管理员权限)
- `GET /detailed?category=xxx` - 获取详细案例
- `GET /detailed/all` - 获取所有详细案例 (需要管理员权限)
- `POST /detailed` - 创建详细案例 (需要管理员权限)
- `PATCH /detailed/:id` - 更新详细案例 (需要管理员权限)
- `DELETE /detailed/:id` - 删除详细案例 (需要管理员权限)

### 上传 (`/api/upload`)
- `POST /image` - 上传单个图片
- `POST /images` - 上传多个图片

## 认证

大多数端点需要 JWT 认证。在请求头中包含:

```
Authorization: Bearer <token>
```

## 错误处理

所有错误响应格式:

```json
{
  "error": "错误信息"
}
```

HTTP 状态码:
- 200: 成功
- 201: 创建成功
- 400: 请求错误
- 401: 未认证
- 403: 权限不足
- 404: 资源未找到
- 500: 服务器错误

## 数据库

使用 PostgreSQL 数据库。

### 表结构

- `users` - 用户表
- `admins` - 管理员表
- `bookings` - 预约表
- `booking_services` - 预约服务表
- `simple_cases` - 简单案例表
- `detailed_cases` - 详细案例表
- `payments` - 支付记录表

详细结构见 `database/schema.sql`

## 开发

### 添加新路由

1. 在 `routes/` 目录创建路由文件
2. 在 `server.js` 中注册路由

### 添加中间件

在 `middleware/` 目录创建中间件文件

### 数据库查询

使用 PostgreSQL 连接池:

```javascript
import pool from '../config/database.js';

const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## 部署

### 使用 PM2

```bash
pm2 start server.js --name yanora-api
pm2 startup
pm2 save
```

### 使用 Docker

```bash
docker build -t yanora-api .
docker run -p 3001:3001 yanora-api
```

## 许可证

MIT
