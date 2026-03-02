# PostgreSQL 数据库安装和配置指南

## Windows 系统安装 PostgreSQL

### 方法 1: 使用官方安装包（推荐）

#### 1. 下载 PostgreSQL

访问官方网站下载：
- **下载地址**: https://www.postgresql.org/download/windows/
- **推荐版本**: PostgreSQL 14 或更高版本
- **安装包**: postgresql-14.x-windows-x64.exe

#### 2. 安装步骤

1. **运行安装程序**
   - 双击下载的 .exe 文件
   - 点击 "Next" 继续

2. **选择安装目录**
   - 默认: `C:\Program Files\PostgreSQL\14`
   - 点击 "Next"

3. **选择组件**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4（图形化管理工具）
   - ✅ Stack Builder
   - ✅ Command Line Tools
   - 点击 "Next"

4. **选择数据目录**
   - 默认: `C:\Program Files\PostgreSQL\14\data`
   - 点击 "Next"

5. **设置超级用户密码**
   - ⚠️ **重要**: 记住这个密码！
   - 建议密码: `postgres123` （仅用于开发环境）
   - 点击 "Next"

6. **设置端口**
   - 默认端口: `5432`
   - 点击 "Next"

7. **选择区域设置**
   - 选择: `Chinese (Simplified), China` 或 `Default locale`
   - 点击 "Next"

8. **开始安装**
   - 点击 "Next" 开始安装
   - 等待安装完成（约 3-5 分钟）

9. **完成安装**
   - 取消勾选 "Launch Stack Builder at exit"
   - 点击 "Finish"

#### 3. 验证安装

打开命令提示符（CMD）或 PowerShell：

```cmd
# 添加 PostgreSQL 到系统路径（如果还没有）
set PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin

# 验证安装
psql --version
```

应该显示类似：`psql (PostgreSQL) 14.x`

---

## 创建数据库和用户

### 方法 1: 使用 SQL Shell (psql)

1. **打开 SQL Shell**
   - 开始菜单 → PostgreSQL 14 → SQL Shell (psql)

2. **连接到 PostgreSQL**
   ```
   Server [localhost]: 直接按回车
   Database [postgres]: 直接按回车
   Port [5432]: 直接按回车
   Username [postgres]: 直接按回车
   Password for user postgres: 输入你安装时设置的密码
   ```

3. **创建数据库和用户**
   ```sql
   -- 创建数据库
   CREATE DATABASE yanora_db;

   -- 创建用户
   CREATE USER yanora_user WITH PASSWORD 'yanora123456';

   -- 授予权限
   GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;

   -- 连接到新数据库
   \c yanora_db

   -- 授予 schema 权限
   GRANT ALL ON SCHEMA public TO yanora_user;

   -- 授予默认权限
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO yanora_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO yanora_user;

   -- 验证
   \l  -- 列出所有数据库
   \du -- 列出所有用户

   -- 退出
   \q
   ```

### 方法 2: 使用 pgAdmin 4（图形界面）

1. **打开 pgAdmin 4**
   - 开始菜单 → PostgreSQL 14 → pgAdmin 4

2. **连接到服务器**
   - 左侧树形菜单 → Servers → PostgreSQL 14
   - 输入你的超级用户密码

3. **创建数据库**
   - 右键点击 "Databases" → Create → Database
   - Database name: `yanora_db`
   - Owner: `postgres`
   - 点击 "Save"

4. **创建用户**
   - 右键点击 "Login/Group Roles" → Create → Login/Group Role
   - General 标签:
     - Name: `yanora_user`
   - Definition 标签:
     - Password: `yanora123456`
   - Privileges 标签:
     - ✅ Can login?
     - ✅ Create databases?
   - 点击 "Save"

5. **授予权限**
   - 右键点击 `yanora_db` → Properties
   - Security 标签 → 点击 "+"
   - Grantee: `yanora_user`
   - Privileges: 全选
   - 点击 "Save"

---

## 初始化数据表

### 自动初始化（推荐）

打开命令提示符，进入项目目录：

```cmd
cd C:\Users\Administrator\Desktop\project-bolt-github-ymk7v6nm\project\server

# 初始化数据库表
node database/init.js
```

### 手动初始化

如果自动初始化失败，可以手动执行：

#### 方法 1: 使用 psql

```cmd
# 进入 server 目录
cd C:\Users\Administrator\Desktop\project-bolt-github-ymk7v6nm\project\server

# 执行 SQL 文件
psql -U yanora_user -d yanora_db -f database/schema.sql
# 输入密码: yanora123456
```

#### 方法 2: 使用 pgAdmin 4

1. 打开 pgAdmin 4
2. 连接到 `yanora_db` 数据库
3. 点击工具栏的 "Query Tool"
4. 打开文件: `project/server/database/schema.sql`
5. 点击 "Execute" (F5)

---

## 验证数据表创建

### 使用 psql

```cmd
psql -U yanora_user -d yanora_db

# 列出所有表
\dt

# 应该看到以下表：
# - users
# - admins
# - bookings
# - booking_services
# - simple_cases
# - detailed_cases
# - faq_categories
# - faqs
# - payments

# 查看表结构
\d users

# 退出
\q
```

### 使用 pgAdmin 4

1. 展开 Databases → yanora_db → Schemas → public → Tables
2. 应该看到所有创建的表

---

## 创建管理员账户

数据表创建成功后，创建管理员账户：

```cmd
cd C:\Users\Administrator\Desktop\project-bolt-github-ymk7v6nm\project\server

node create-admin.js
```

应该看到：
```
✅ 管理员账户创建成功！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 邮箱: admin@yanora.com
🔑 密码: admin123456
👤 角色: 超级管理员
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 常见问题

### 1. psql 命令找不到

**解决方案**: 添加 PostgreSQL 到系统环境变量

1. 右键 "此电脑" → 属性 → 高级系统设置
2. 环境变量 → 系统变量 → Path → 编辑
3. 新建 → 添加: `C:\Program Files\PostgreSQL\14\bin`
4. 确定 → 重启命令提示符

### 2. 密码认证失败

**解决方案**: 检查 `pg_hba.conf` 文件

1. 打开文件: `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`
2. 找到这一行:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
3. 改为:
   ```
   host    all             all             127.0.0.1/32            md5
   ```
4. 重启 PostgreSQL 服务

### 3. 连接被拒绝

**解决方案**: 确保 PostgreSQL 服务正在运行

```cmd
# 查看服务状态
services.msc

# 找到 postgresql-x64-14
# 右键 → 启动
```

### 4. 端口被占用

**解决方案**: 修改 PostgreSQL 端口

1. 编辑 `postgresql.conf`: `C:\Program Files\PostgreSQL\14\data\postgresql.conf`
2. 找到: `port = 5432`
3. 改为: `port = 5433`
4. 重启服务
5. 更新 `project/server/.env` 中的 `DB_PORT=5433`

---

## 快速命令参考

```cmd
# 连接数据库
psql -U yanora_user -d yanora_db

# 列出数据库
\l

# 列出表
\dt

# 查看表结构
\d table_name

# 执行 SQL 文件
psql -U yanora_user -d yanora_db -f schema.sql

# 备份数据库
pg_dump -U yanora_user yanora_db > backup.sql

# 恢复数据库
psql -U yanora_user -d yanora_db < backup.sql

# 退出
\q
```

---

## 下一步

数据库配置完成后：

1. ✅ 启动后端服务
   ```cmd
   cd project\server
   npm start
   ```

2. ✅ 启动前端服务
   ```cmd
   cd project
   npm run dev
   ```

3. ✅ 访问系统
   - 用户端: http://localhost:5173
   - 管理端: http://localhost:5173/admin/login

---

**需要帮助？** 查看 `TROUBLESHOOTING.md` 文档

