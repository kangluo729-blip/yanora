@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Yanora 数据库安装向导
echo ========================================
echo.

REM 检查 PostgreSQL 是否安装
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 PostgreSQL
    echo.
    echo 请先安装 PostgreSQL:
    echo 1. 访问: https://www.postgresql.org/download/windows/
    echo 2. 下载并安装 PostgreSQL 14 或更高版本
    echo 3. 安装时记住设置的超级用户密码
    echo 4. 安装完成后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL 已安装
psql --version
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 数据库配置信息
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 数据库名称: yanora_db
echo 用户名: yanora_user
echo 密码: yanora123456
echo 端口: 5432
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 步骤 1: 创建数据库和用户
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 请输入 PostgreSQL 超级用户 (postgres) 的密码:
echo （这是你安装 PostgreSQL 时设置的密码）
echo.

REM 创建临时 SQL 文件
echo CREATE DATABASE yanora_db; > %TEMP%\create_db.sql
echo CREATE USER yanora_user WITH PASSWORD 'yanora123456'; >> %TEMP%\create_db.sql
echo GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user; >> %TEMP%\create_db.sql

REM 执行 SQL
psql -U postgres -f %TEMP%\create_db.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  数据库创建失败
    echo.
    echo 可能的原因:
    echo 1. 密码输入错误
    echo 2. 数据库已存在
    echo 3. PostgreSQL 服务未启动
    echo.
    echo 请手动创建数据库，参考 INSTALL_DATABASE.md 文档
    del %TEMP%\create_db.sql
    pause
    exit /b 1
)

del %TEMP%\create_db.sql

echo.
echo ✅ 数据库和用户创建成功
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 步骤 2: 授予权限
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM 创建授权 SQL
echo GRANT ALL ON SCHEMA public TO yanora_user; > %TEMP%\grant_permissions.sql
echo ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO yanora_user; >> %TEMP%\grant_permissions.sql
echo ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO yanora_user; >> %TEMP%\grant_permissions.sql

REM 执行授权
psql -U postgres -d yanora_db -f %TEMP%\grant_permissions.sql

del %TEMP%\grant_permissions.sql

echo ✅ 权限授予成功
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🗄️  步骤 3: 创建数据表
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd project\server

REM 使用 Node.js 初始化数据库
node database\init.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  数据表创建失败，尝试手动创建...
    echo.
    
    REM 手动执行 SQL 文件
    echo 请输入 yanora_user 的密码 (yanora123456):
    psql -U yanora_user -d yanora_db -f database\schema.sql
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ 数据表创建失败
        echo 请查看 INSTALL_DATABASE.md 文档手动创建
        pause
        exit /b 1
    )
)

echo.
echo ✅ 数据表创建成功
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 👤 步骤 4: 创建管理员账户
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node create-admin.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  管理员创建失败
    echo 可以稍后运行: node project\server\create-admin.js
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✨ 数据库配置完成！
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 数据库信息:
echo    主机: localhost
echo    端口: 5432
echo    数据库: yanora_db
echo    用户: yanora_user
echo    密码: yanora123456
echo.
echo 🔐 管理员账户:
echo    邮箱: admin@yanora.com
echo    密码: admin123456
echo.
echo 📝 下一步:
echo    1. 运行 start.bat 启动项目
echo    2. 访问 http://localhost:5173
echo    3. 管理后台: http://localhost:5173/admin/login
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause

