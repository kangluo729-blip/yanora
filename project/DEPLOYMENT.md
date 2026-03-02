# 部署指南

本文档提供三种部署方案的详细说明。

## 方案 1: 传统 VPS 部署 (推荐用于中小型项目)

### 1.1 服务器要求

- Ubuntu 20.04+ / Debian 10+ / CentOS 8+
- 至少 2GB RAM
- 20GB 硬盘空间
- Node.js 18+
- PostgreSQL 12+
- Nginx

### 1.2 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2
sudo npm install -g pm2
```

### 1.3 配置 PostgreSQL

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 中执行
CREATE DATABASE yanora_db;
CREATE USER yanora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE yanora_db TO yanora_user;
\q

# 允许远程连接 (如果需要)
sudo nano /etc/postgresql/*/main/pg_hba.conf
# 添加: host    all    all    0.0.0.0/0    md5

sudo nano /etc/postgresql/*/main/postgresql.conf
# 修改: listen_addresses = '*'

sudo systemctl restart postgresql
```

### 1.4 部署后端

```bash
# 克隆或上传项目
cd /var/www
git clone <your-repo> yanora
cd yanora/server

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env
# 修改数据库密码和 JWT 密钥

# 初始化数据库
node database/init.js

# 创建管理员账户
node scripts/create-admin.js

# 使用 PM2 启动
pm2 start server.js --name yanora-api
pm2 save
pm2 startup
```

### 1.5 部署前端

```bash
cd /var/www/yanora

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env
# 设置 VITE_API_URL=https://your-domain.com/api

# 构建
npm run build

# 前端文件在 dist/ 目录
```

### 1.6 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/yanora
```

添加配置:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/yanora/dist;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传的文件
    location /uploads {
        proxy_pass http://localhost:3001;

        # 缓存上传的图片
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点:

```bash
sudo ln -s /etc/nginx/sites-available/yanora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 1.7 配置 SSL (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

### 1.8 配置防火墙

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 方案 2: Docker 部署 (推荐用于快速部署)

### 2.1 安装 Docker

```bash
# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install -y docker-compose

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER
```

### 2.2 配置环境变量

```bash
# 创建环境变量文件
nano .env.docker
```

添加内容:

```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_jwt_key
```

### 2.3 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 初始化数据库 (首次运行)
docker-compose exec api node database/init.js

# 创建管理员
docker-compose exec api node scripts/create-admin.js
```

### 2.4 Nginx 反向代理 (Docker)

如果使用 Docker 部署后端,前端仍然需要 Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/yanora/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        # ... 其他配置同方案1
    }

    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

---

## 方案 3: 云服务部署

### 3.1 数据库 (云数据库)

使用云提供商的托管 PostgreSQL:

- AWS RDS
- Azure Database for PostgreSQL
- Google Cloud SQL
- DigitalOcean Managed Databases
- 阿里云 RDS
- 腾讯云 PostgreSQL

配置步骤:
1. 创建 PostgreSQL 实例
2. 获取连接字符串
3. 配置安全组/防火墙
4. 更新后端 `.env` 中的数据库配置

### 3.2 后端部署

#### AWS EC2 / Azure VM / Google Compute Engine

按照方案1的步骤部署

#### Heroku

```bash
# 安装 Heroku CLI
npm install -g heroku

# 登录
heroku login

# 创建应用
cd server
heroku create yanora-api

# 配置环境变量
heroku config:set JWT_SECRET=your_secret
heroku config:set DATABASE_URL=postgresql://...

# 部署
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Railway / Render

1. 连接 GitHub 仓库
2. 选择 `server` 目录作为根目录
3. 配置环境变量
4. 部署

### 3.3 前端部署

#### Netlify

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod --dir=dist
```

配置 `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
```

#### Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

配置 `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-url.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Cloudflare Pages

1. 连接 GitHub 仓库
2. 构建命令: `npm run build`
3. 输出目录: `dist`
4. 配置环境变量
5. 部署

---

## 维护和监控

### 日志管理

```bash
# PM2 日志
pm2 logs yanora-api

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### 备份数据库

创建备份脚本 `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/yanora"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U yanora_user -d yanora_db > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# 备份上传的文件
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" /var/www/yanora/public/uploads

# 保留最近 7 天的备份
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

设置定时任务:

```bash
chmod +x backup.sh
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh >> /var/log/yanora-backup.log 2>&1
```

### 监控

安装监控工具:

```bash
# PM2 监控
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 系统监控
sudo apt install -y htop iotop
```

---

## 性能优化

### 1. 数据库优化

```sql
-- 添加缺失的索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 定期清理
VACUUM ANALYZE;
```

### 2. Nginx 优化

在 Nginx 配置中添加:

```nginx
# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss;

# 连接优化
keepalive_timeout 65;
keepalive_requests 100;

# 缓冲区大小
client_body_buffer_size 10K;
client_header_buffer_size 1k;
client_max_body_size 10m;
large_client_header_buffers 2 1k;
```

### 3. Node.js 优化

在 PM2 启动时:

```bash
pm2 start server.js --name yanora-api --instances max --exec-mode cluster
```

---

## 故障排除

### 后端无法连接数据库

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接
psql -U yanora_user -d yanora_db -h localhost

# 查看日志
sudo journalctl -u postgresql
```

### API 返回 502 错误

```bash
# 检查后端是否运行
pm2 status

# 重启后端
pm2 restart yanora-api

# 查看日志
pm2 logs yanora-api --lines 100
```

### 前端无法加载

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 安全检查清单

- [ ] 使用强密码 (JWT_SECRET, 数据库密码)
- [ ] 启用 HTTPS
- [ ] 配置防火墙
- [ ] 定期更新系统和依赖
- [ ] 设置自动备份
- [ ] 配置日志轮转
- [ ] 限制 API 请求频率
- [ ] 使用环境变量存储敏感信息
- [ ] 定期检查安全漏洞
- [ ] 禁用不必要的端口

---

## 更新部署

### 方案 1: 传统部署

```bash
cd /var/www/yanora

# 备份数据库
pg_dump -U yanora_user yanora_db > backup_before_update.sql

# 拉取最新代码
git pull

# 更新后端
cd server
npm install
pm2 restart yanora-api

# 更新前端
cd ..
npm install
npm run build

# 如果有数据库变更
cd server
node database/init.js
```

### 方案 2: Docker 部署

```bash
cd /var/www/yanora

# 拉取最新代码
git pull

# 重新构建和启动
docker-compose down
docker-compose up -d --build

# 如果有数据库变更
docker-compose exec api node database/init.js
```

---

## 联系支持

如遇到问题,请查看:
- `README.md` - 基本使用说明
- `MIGRATION_GUIDE.md` - 迁移详细指南
- 项目 GitHub Issues

祝部署顺利!
