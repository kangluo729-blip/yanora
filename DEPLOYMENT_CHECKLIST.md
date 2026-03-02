# 部署检查清单

## 部署前检查

### 1. 环境配置
- [ ] 已配置生产环境 `.env` 文件
- [ ] JWT_SECRET 使用强密码
- [ ] 数据库密码已修改
- [ ] CORS_ORIGIN 设置为生产域名
- [ ] API URL 配置正确

### 2. 数据库
- [ ] PostgreSQL 已安装并运行
- [ ] 数据库已创建
- [ ] 数据库用户权限正确
- [ ] 数据库结构已初始化
- [ ] 管理员账户已创建
- [ ] 数据库备份策略已设置

### 3. 安全
- [ ] 所有默认密码已修改
- [ ] HTTPS 证书已配置
- [ ] 防火墙规则已设置
- [ ] 敏感文件权限正确
- [ ] .env 文件不在版本控制中
- [ ] 已启用 SQL 注入防护
- [ ] 已配置速率限制

### 4. 性能
- [ ] 前端已构建（npm run build）
- [ ] 静态资源已压缩
- [ ] 图片已优化
- [ ] 数据库索引已创建
- [ ] 缓存策略已配置

### 5. 监控
- [ ] 日志系统已配置
- [ ] 错误监控已设置
- [ ] 性能监控已启用
- [ ] 备份任务已配置
- [ ] 健康检查端点可访问

### 6. 文档
- [ ] API 文档已更新
- [ ] 部署文档已完善
- [ ] 运维手册已准备
- [ ] 故障排查指南已编写

## 部署步骤

### 服务器准备
```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 4. 安装 Nginx
sudo apt install -y nginx

# 5. 安装 PM2
sudo npm install -g pm2
```

### 应用部署
```bash
# 1. 克隆代码
git clone <repository-url>
cd project-bolt-github-ymk7v6nm

# 2. 安装依赖
cd project/server && npm install
cd ../.. && cd project && npm install

# 3. 配置环境变量
cp project/server/.env.example project/server/.env
cp project/.env.example project/.env
# 编辑 .env 文件

# 4. 初始化数据库
cd project/server
node database/init.js
node create-admin.js

# 5. 构建前端
cd ..
npm run build

# 6. 启动后端
cd server
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. 配置 Nginx
sudo cp /path/to/nginx.conf /etc/nginx/sites-available/yanora
sudo ln -s /etc/nginx/sites-available/yanora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL 证书配置
```bash
# 使用 Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 部署后验证

### 功能测试
- [ ] 首页可以访问
- [ ] 用户注册/登录正常
- [ ] 预约功能正常
- [ ] 管理后台可访问
- [ ] 图片上传正常
- [ ] 多语言切换正常
- [ ] 移动端显示正常

### 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 并发用户测试通过
- [ ] 数据库查询优化

### 安全测试
- [ ] SQL 注入测试
- [ ] XSS 攻击测试
- [ ] CSRF 防护测试
- [ ] 文件上传安全测试
- [ ] 认证授权测试

## 回滚计划

### 数据库回滚
```bash
# 恢复数据库备份
psql -U yanora_user -d yanora_db < backup.sql
```

### 应用回滚
```bash
# 切换到上一个版本
git checkout <previous-commit>
npm install
npm run build
pm2 restart all
```

## 监控和维护

### 日志查看
```bash
# PM2 日志
pm2 logs

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 定期任务
```bash
# 添加数据库备份 cron 任务
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /usr/bin/node /path/to/project/server/scripts/backup-db.js
```

### 性能监控
```bash
# 查看 PM2 状态
pm2 status
pm2 monit

# 查看系统资源
htop
df -h
free -m
```

## 紧急联系

- 技术负责人: [联系方式]
- 运维负责人: [联系方式]
- 数据库管理员: [联系方式]

## 备注

- 部署日期: ___________
- 部署人员: ___________
- 版本号: ___________
- 备注: ___________

