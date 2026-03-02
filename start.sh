#!/bin/bash

# Yanora 项目启动脚本

echo "🚀 启动 Yanora 美容诊所管理系统..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  未检测到 PostgreSQL，请确保已安装并启动"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 1: 安装后端依赖"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd project/server
npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  步骤 2: 初始化数据库"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node database/init.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 步骤 3: 创建管理员账户"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node create-admin.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 步骤 4: 启动后端服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "后端将在后台运行..."
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 5: 安装前端依赖"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd ..
npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 步骤 6: 启动前端服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run dev

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# 捕获退出信号
trap cleanup SIGINT SIGTERM

wait

