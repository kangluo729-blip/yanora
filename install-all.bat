@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Yanora 项目完整安装向导
echo ========================================
echo.

echo 此脚本将自动完成以下操作：
echo 1. 安装前端依赖
echo 2. 安装后端依赖
echo 3. 创建数据库（需要 PostgreSQL）
echo 4. 初始化数据表
echo 5. 创建管理员账户
echo.
pause

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 步骤 1/5: 安装前端依赖
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd project
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

echo ✅ 前端依赖安装成功
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 步骤 2/5: 安装后端依赖
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd server
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo ✅ 后端依赖安装成功
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🗄️  步骤 3/5: 创建数据库
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未检测到 PostgreSQL
    echo.
    echo 请先安装 PostgreSQL:
    echo 1. 访问: https://www.postgresql.org/download/windows/
    echo 2. 下载并安装 PostgreSQL 14+
    echo 3. 安装完成后重新运行此脚本
    echo.
    echo 或者手动创建数据库后按任意键继续...
    pause
    goto skip_db_creation
)

echo 检测到 PostgreSQL，开始创建数据库...
echo.
echo 数据库配置:
echo - 数据库名: yanora_db
echo - 用户名: yanora_user
echo - 密码: yanora123456
echo.
echo 请输入 PostgreSQL 超级用户 (postgres) 的密码:
echo.

REM 创建数据库
echo CREATE DATABASE yanora_db; > %TEMP%\create_db.sql
echo CREATE USER yanora_user WITH PASSWORD 'yanora123456'; >> %TEMP%\create_db.sql
echo GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user; >> %TEMP%\create_db.sql

psql -U postgres -f %TEMP%\create_db.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  数据库创建失败（可能已存在）
    echo 继续下一步...
)

del %TEMP%\create_db.sql

REM 授予权限
echo GRANT ALL ON SCHEMA public TO yanora_user; > %TEMP%\grant.sql
echo ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO yanora_user; >> %TEMP%\grant.sql

psql -U postgres -d yanora_db -f %TEMP%\grant.sql >nul 2>nul
del %TEMP%\grant.sql

echo ✅ 数据库创建完成
echo.

:skip_db_creation

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 步骤 4/5: 初始化数据表
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node database\init.js

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  数据表初始化失败
    echo 请检查数据库连接配置
    echo.
)

echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 👤 步骤 5/5: 创建管理员账户
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node create-admin.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✨ 安装完成！
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 下一步操作:
echo.
echo 1. 启动项目:
echo    双击运行 start.bat
echo.
echo 2. 或者手动启动:
echo    后端: cd project\server ^&^& npm start
echo    前端: cd project ^&^& npm run dev
echo.
echo 3. 访问系统:
echo    用户端: http://localhost:5173
echo    管理端: http://localhost:5173/admin/login
echo.
echo 4. 管理员账户:
echo    邮箱: admin@yanora.com
echo    密码: admin123456
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause

