import bcrypt from 'bcryptjs';
import readline from 'readline';
import pool from '../config/database.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('=== 创建管理员账户 ===\n');

    const email = await question('邮箱地址: ');
    const password = await question('密码: ');
    const roleInput = await question('角色 (admin/super_admin) [默认: admin]: ');
    const role = roleInput.trim() || 'admin';

    if (!email || !password) {
      console.error('错误: 邮箱和密码不能为空');
      process.exit(1);
    }

    if (!['admin', 'super_admin'].includes(role)) {
      console.error('错误: 角色必须是 admin 或 super_admin');
      process.exit(1);
    }

    console.log('\n正在创建账户...');

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      let userId;

      if (existingUser.rows.length > 0) {
        console.log('用户已存在,使用现有用户...');
        userId = existingUser.rows[0].id;
      } else {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userResult = await client.query(
          'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
          [email, passwordHash]
        );

        userId = userResult.rows[0].id;
        console.log('✓ 用户创建成功');
      }

      const existingAdmin = await client.query(
        'SELECT * FROM admins WHERE user_id = $1',
        [userId]
      );

      if (existingAdmin.rows.length > 0) {
        console.log('该用户已经是管理员');

        await client.query(
          'UPDATE admins SET role = $1, is_active = true WHERE user_id = $2',
          [role, userId]
        );
        console.log('✓ 管理员权限已更新');
      } else {
        await client.query(
          'INSERT INTO admins (user_id, email, role, is_active) VALUES ($1, $2, $3, true)',
          [userId, email, role]
        );
        console.log('✓ 管理员权限已添加');
      }

      await client.query('COMMIT');

      console.log('\n=== 管理员创建成功 ===');
      console.log(`邮箱: ${email}`);
      console.log(`角色: ${role}`);
      console.log(`\n现在可以使用这些凭据登录管理后台。\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('\n错误:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();
