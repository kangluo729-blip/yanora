# 快速启动指南

## Windows 用户

### 方法 1: 使用启动脚本（推荐）

双击运行 `start.bat` 文件，脚本会自动：
1. 安装所有依赖
2. 初始化数据库
3. 创建管理员账户
4. 启动后端和前端服务

### 方法 2: 手动启动

#### 1. 安装后端依赖并启动
```cmd
cd project\server
npm install
node database\init.js
node create-admin.js
npm start
```

#### 2. 打开新的命令行窗口，安装前端依赖并启动
```cmd
cd project
npm install
npm run dev
```

## Linux/Mac 用户

### 方法 1: 使用启动脚本（推荐）

```bash
chmod +x start.sh
./start.sh
```

### 方法 2: 手动启动

#### 1. 启动后端
```bash
cd project/server
npm install
node database/init.js
node create-admin.js
npm start
```

#### 2. 打开新终端，启动前端
```bash
cd project
npm install
npm run dev
```

## 访问系统

- **用户端**: http://localhost:5173
- **管理端**: http://localhost:5173/admin/login

## 默认管理员账户

- **邮箱**: admin@yanora.com
- **密码**: admin123456

## 前置要求

1. **Node.js 18+** - [下载地址](https://nodejs.org/)
2. **PostgreSQL 12+** - [下载地址](https://www.postgresql.org/download/)

## 数据库配置

在启动前，请确保：

1. PostgreSQL 服务已启动
2. 已创建数据库和用户：

```sql
CREATE DATABASE yanora_db;
CREATE USER yanora_user WITH PASSWORD 'yanora123456';
GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;
```

3. 配置文件 `project/server/.env` 中的数据库信息正确

## 常见问题

### 端口被占用
- 后端默认端口: 3001
- 前端默认端口: 5173

如需修改：
- 后端: 编辑 `project/server/.env` 中的 `PORT`
- 前端: 编辑 `project/vite.config.ts`

### 数据库连接失败
1. 检查 PostgreSQL 是否运行
2. 验证 `project/server/.env` 中的数据库配置
3. 确认数据库用户权限

### 管理员登录失败
重新运行创建管理员脚本：
```bash
cd project/server
node create-admin.js
```

## 详细文档

查看 `README.md` 获取完整文档。

