# Yanora 美容诊所管理系统

一个功能完整的美容诊所预约和管理系统，支持多语言（中文、英文、法语、阿拉伯语、西班牙语）。

## 🌟 功能特性

### 用户端
- 🏠 精美的首页展示
- 📅 在线预约系统
- 👤 用户注册/登录
- 🌍 多语言支持（5种语言）
- 📱 响应式设计（移动端/桌面端）
- 🖼️ 案例展示（前后对比）
- ❓ FAQ 常见问题
- 💳 多种支付方式

### 管理端
- 🔐 管理员登录系统
- 📊 预约管理
- 📝 案例管理（简单案例/详细案例）
- ❓ FAQ 管理
- 👥 管理员账户管理
- 📤 图片上传功能

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v7
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Context

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据库**: PostgreSQL
- **认证**: JWT + bcryptjs
- **文件上传**: Multer
- **跨域**: CORS

## 📋 前置要求

- Node.js 18+ 
- PostgreSQL 12+
- npm 或 yarn

## 🚀 快速开始

### 1. 克隆项目

```bash
cd /c:/Users/Administrator/Desktop/project-bolt-github-ymk7v6nm
```

### 2. 安装 PostgreSQL

#### Windows
1. 下载安装: https://www.postgresql.org/download/windows/
2. 安装时记住设置的密码
3. 确保 PostgreSQL 服务已启动

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 3. 创建数据库

打开 PostgreSQL 命令行（Windows: SQL Shell (psql)）:

```sql
-- 创建数据库
CREATE DATABASE yanora_db;

-- 创建用户
CREATE USER yanora_user WITH PASSWORD 'yanora123456';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;

-- 连接到数据库
\c yanora_db

-- 授予 schema 权限
GRANT ALL ON SCHEMA public TO yanora_user;

-- 退出
\q
```

### 4. 配置后端

```bash
cd project/server

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，修改数据库密码等配置
# 使用记事本或其他编辑器打开 .env
```

编辑 `project/server/.env`:
```env
PORT=3001
JWT_SECRET=yanora-secret-key-2024-change-in-production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yanora_db
DB_USER=yanora_user
DB_PASSWORD=yanora123456
```

### 5. 初始化数据库

```bash
# 在 project/server 目录下
node database/init.js
```

### 6. 创建管理员账户

```bash
# 在 project/server 目录下
node quick-create-admin.js
```

默认管理员账户：
- 邮箱: `admin@yanora.com`
- 密码: `admin123456`

### 7. 启动后端服务

```bash
# 在 project/server 目录下
npm start

# 或开发模式（自动重启）
npm run dev
```

后端将运行在: http://localhost:3001

### 8. 配置前端

打开新的终端窗口:

```bash
cd project

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env
```

编辑 `project/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 9. 启动前端

```bash
# 在 project 目录下
npm run dev
```

前端将运行在: http://localhost:5173

### 10. 访问系统

- **用户端**: http://localhost:5173
- **管理端**: http://localhost:5173/admin/login
  - 账号: admin@yanora.com
  - 密码: admin123456

## 📁 项目结构

```
project-bolt-github-ymk7v6nm/
├── project/                          # 主项目目录
│   ├── src/                         # 前端源码
│   │   ├── components/              # React 组件
│   │   │   ├── booking/            # 预约相关组件
│   │   │   ├── AdminDashboard.tsx  # 管理员仪表板
│   │   │   ├── BookingPage.tsx     # 预约页面
│   │   │   ├── CasesPage.tsx       # 案例页面
│   │   │   ├── FAQPage.tsx         # FAQ 页面
│   │   │   └── ...                 # 其他组件
│   │   ├── contexts/               # React Context
│   │   │   ├── LanguageContext.tsx # 多语言上下文
│   │   │   └── translations.ts     # 翻译文件
│   │   ├── lib/                    # 工具库
│   │   │   └── api.ts              # API 客户端
│   │   ├── App.tsx                 # 主应用组件
│   │   ├── main.tsx                # 应用入口
│   │   └── index.css               # 全局样式
│   ├── server/                      # 后端源码
│   │   ├── config/                 # 配置文件
│   │   │   └── database.js         # 数据库配置
│   │   ├── database/               # 数据库脚本
│   │   │   ├── schema.sql          # 数据库结构
│   │   │   └── init.js             # 初始化脚本
│   │   ├── middleware/             # 中间件
│   │   │   └── auth.js             # 认证中间件
│   │   ├── routes/                 # API 路由
│   │   │   ├── auth.js             # 认证路由
│   │   │   ├── admin.js            # 管理员路由
│   │   │   ├── bookings.js         # 预约路由
│   │   │   ├── cases.js            # 案例路由
│   │   │   ├── faq.js              # FAQ 路由
│   │   │   └── upload.js           # 上传路由
│   │   ├── scripts/                # 脚本工具
│   │   ├── server.js               # 服务器入口
│   │   ├── package.json            # 后端依赖
│   │   └── .env.example            # 环境变量模板
│   ├── public/                      # 静态资源
│   │   ├── uploads/                # 上传文件目录
│   │   └── *.png, *.jpg            # 图片资源
│   ├── package.json                # 前端依赖
│   ├── vite.config.ts              # Vite 配置
│   ├── tailwind.config.js          # Tailwind 配置
│   └── tsconfig.json               # TypeScript 配置
├── README.md                        # 项目文档（本文件）
├── .gitignore                       # Git 忽略文件
└── ecosystem.config.js              # PM2 配置（生产环境）
```

## 🔌 API 端点

### 认证 API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 管理员 API
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/admins` - 获取管理员列表
- `POST /api/admin/admins` - 创建新管理员
- `PATCH /api/admin/admins/:id` - 更新管理员
- `DELETE /api/admin/admins/:id` - 删除管理员

### 预约 API
- `POST /api/bookings` - 创建预约
- `GET /api/bookings` - 获取用户预约列表
- `GET /api/bookings/all` - 获取所有预约（管理员）
- `PATCH /api/bookings/:id` - 更新预约状态
- `DELETE /api/bookings/:id` - 删除预约

### 案例 API
- `GET /api/cases/simple` - 获取简单案例
- `GET /api/cases/simple/all` - 获取所有简单案例（管理员）
- `POST /api/cases/simple` - 创建简单案例
- `GET /api/cases/detailed?category=xxx` - 获取详细案例
- `POST /api/cases/detailed` - 创建详细案例

### FAQ API
- `GET /api/faq/categories` - 获取 FAQ 分类
- `GET /api/faq/questions` - 获取 FAQ 问题
- `POST /api/faq/categories` - 创建分类（管理员）
- `POST /api/faq/questions` - 创建问题（管理员）

### 上传 API
- `POST /api/upload/image` - 上传单个图片
- `POST /api/upload/images` - 上传多个图片

## 🔧 常见问题

### 数据库连接失败
```bash
# 检查 PostgreSQL 是否运行
# Windows: 服务管理器中查看 postgresql 服务
# Linux: sudo systemctl status postgresql

# 检查端口是否被占用
netstat -ano | findstr :5432

# 验证数据库配置
psql -U yanora_user -d yanora_db -h localhost
```

### 端口被占用
```bash
# 检查端口占用
# Windows:
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 修改端口
# 后端: 编辑 server/.env 中的 PORT
# 前端: 编辑 vite.config.ts 中的 server.port
```

### 管理员登录失败
```bash
# 重新创建管理员
cd project/server
node quick-create-admin.js
```

### 图片上传失败
```bash
# 确保上传目录存在
mkdir -p project/public/uploads

# Windows:
cd project/public
mkdir uploads
```

## 🚀 生产部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd project/server
pm2 start ecosystem.config.js

# 构建前端
cd ../
npm run build

# 使用 Nginx 或其他 Web 服务器托管 dist 目录
```

### 使用 Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 📝 开发指南

### 添加新的服务页面
1. 在 `src/components/` 创建新组件
2. 在 `src/main.tsx` 添加路由
3. 在导航菜单中添加链接

### 添加新的 API 端点
1. 在 `server/routes/` 创建或编辑路由文件
2. 在 `server/server.js` 注册路由
3. 在 `src/lib/api.ts` 添加客户端方法

### 修改翻译
编辑 `src/contexts/translations.ts` 文件

## 📄 许可证

MIT License

## 👥 支持

如有问题，请查看：
- `project/README.md` - 详细文档
- `project/server/README.md` - 后端 API 文档
- `MIGRATION_GUIDE.md` - 迁移指南

---

**祝你使用愉快！** 🎉

