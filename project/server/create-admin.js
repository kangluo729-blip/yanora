#!/usr/bin/env node

/**
 * 快速创建管理员账户脚本
 * 使用方法: node quick-create-admin.js
 */

import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;

// 数据库配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'yanora_db',
  user: process.env.DB_USER || 'yanora_user',
  password: process.env.DB_PASSWORD || 'yanora123456'
});

// 默认管理员信息
const ADMIN_EMAIL = 'admin@yanora.com';
const ADMIN_PASSWORD = 'admin123456';

async function createAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 开始创建管理员账户...\n');

    // 开始事务
    await client.query('BEGIN');

    // 检查用户是否已存在
    const userCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    let userId;

    if (userCheck.rows.length > 0) {
      console.log('⚠️  用户已存在，更新密码...');
      userId = userCheck.rows[0].id;
      
      // 生成新密码哈希
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      // 更新密码
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId]
      );
    } else {
      console.log('✨ 创建新用户...');
      
      // 生成密码哈希
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      // 创建用户
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [ADMIN_EMAIL, passwordHash]
      );
      
      userId = userResult.rows[0].id;
    }

    // 检查管理员记录是否存在
    const adminCheck = await client.query(
      'SELECT user_id FROM admins WHERE user_id = $1',
      [userId]
    );

    if (adminCheck.rows.length > 0) {
      console.log('⚠️  管理员记录已存在，更新状态...');
      
      // 更新管理员状态
      await client.query(
        'UPDATE admins SET is_active = true, role = $1, updated_at = NOW() WHERE user_id = $2',
        ['super_admin', userId]
      );
    } else {
      console.log('✨ 创建管理员记录...');
      
      // 创建管理员记录
      await client.query(
        'INSERT INTO admins (user_id, email, role, is_active) VALUES ($1, $2, $3, true)',
        [userId, ADMIN_EMAIL, 'super_admin']
      );
    }

    // 提交事务
    await client.query('COMMIT');

    console.log('\n✅ 管理员账户创建成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 邮箱:', ADMIN_EMAIL);
    console.log('🔑 密码:', ADMIN_PASSWORD);
    console.log('👤 角色: 超级管理员');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 管理后台地址: http://localhost:5173/admin/login\n');
    console.log('⚠️  请在生产环境中修改默认密码！\n');

  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    console.error('❌ 创建管理员失败:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 执行创建
createAdmin()
  .then(() => {
    console.log('✨ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });

