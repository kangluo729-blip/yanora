import bcrypt from 'bcryptjs';

const email = 'admin@yanora.com';
const password = 'Admin123456';

console.log('=== 生成管理员账户信息 ===\n');
console.log('邮箱:', email);
console.log('密码:', password);
console.log('\n正在生成密码哈希...\n');

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('错误:', err);
    process.exit(1);
  }

  console.log('密码哈希:', hash);
  console.log('\n=== SQL 命令 ===\n');
  console.log('请在 PostgreSQL 中执行以下命令:\n');
  console.log('-- 1. 连接数据库');
  console.log('psql -U yanora_user -d yanora_db\n');
  console.log('-- 2. 创建用户和管理员');
  console.log(`INSERT INTO users (email, password_hash) VALUES ('${email}', '${hash}') ON CONFLICT (email) DO NOTHING RETURNING id;`);
  console.log('\n-- 3. 添加管理员权限 (使用上面返回的 user_id)');
  console.log(`INSERT INTO admins (user_id, email, role, is_active)`);
  console.log(`SELECT id, '${email}', 'super_admin', true FROM users WHERE email = '${email}'`);
  console.log(`ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', is_active = true;`);
  console.log('\n=== 完成 ===\n');
  console.log('管理员登录信息:');
  console.log(`  邮箱: ${email}`);
  console.log(`  密码: ${password}`);
  console.log('\n登录地址: http://localhost:5173/admin/login\n');

  process.exit(0);
});
