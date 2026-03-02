@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Yanora 美容诊所管理系统 - 启动脚本
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node -v
echo.

REM 检查 PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未检测到 PostgreSQL 命令行工具
    echo    请确保 PostgreSQL 已安装并启动
    echo.
)

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 步骤 1: 安装后端依赖
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd project\server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🗄️  步骤 2: 初始化数据库
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node database\init.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 数据库初始化失败
    echo    请检查 PostgreSQL 是否运行
    echo    请检查 .env 文件中的数据库配置
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 👤 步骤 3: 创建管理员账户
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
node create-admin.js
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  管理员创建失败（可能已存在）
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔧 步骤 4: 启动后端服务
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 后端服务将在新窗口中启动...
start "Yanora Backend" cmd /k "npm start"

REM 等待后端启动
timeout /t 5 /nobreak >nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 步骤 5: 安装前端依赖
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd ..
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎨 步骤 6: 启动前端服务
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✨ 系统启动成功！
echo.
echo 📍 访问地址:
echo    用户端: http://localhost:5173
echo    管理端: http://localhost:5173/admin/login
echo.
echo 🔐 默认管理员账户:
echo    邮箱: admin@yanora.com
echo    密码: admin123456
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call npm run dev

pause

