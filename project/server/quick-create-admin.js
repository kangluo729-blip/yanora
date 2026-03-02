import bcrypt from 'bcryptjs';

const email = 'admin@yanora.com';
const password = 'Admin123456';

console.log('\n=== 快速创建管理员账户 ===\n');
console.log('管理员登录信息:');
console.log(`  邮箱: ${email}`);
console.log(`  密码: ${password}`);
console.log(`  角色: super_admin\n`);

const hash = await bcrypt.hash(password, 10);

console.log('密码已加密\n');
console.log('=== 接下来的步骤 ===\n');
console.log('1. 确保 PostgreSQL 数据库正在运行');
console.log('2. 确保已运行数据库初始化: node database/init.js');
console.log('3. 运行交互式创建脚本: node scripts/create-admin.js');
console.log('   或者使用上面的默认账号密码\n');
console.log('4. 启动后端服务器: npm start');
console.log('5. 在浏览器中打开: http://localhost:5173/admin/login\n');
console.log('=== 预生成的 SQL (如果需要手动执行) ===\n');
console.log(`-- 插入用户`);
console.log(`INSERT INTO users (email, password_hash) VALUES ('${email}', '${hash}') RETURNING id;\n`);
console.log(`-- 插入管理员 (用上面返回的 id 替换 <user_id>)`);
console.log(`INSERT INTO admins (user_id, email, role, is_active) VALUES ('<user_id>', '${email}', 'super_admin', true);\n`);
