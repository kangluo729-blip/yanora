#!/usr/bin/env node

/**
 * 数据库恢复脚本
 * 使用方法: node restore-db.js <backup-file.sql>
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'yanora_db';
const DB_USER = process.env.DB_USER || 'yanora_user';
const DB_PASSWORD = process.env.DB_PASSWORD;

async function restoreDatabase(backupFile) {
  try {
    // 检查备份文件是否存在
    if (!fs.existsSync(backupFile)) {
      console.error('❌ 备份文件不存在:', backupFile);
      process.exit(1);
    }

    console.log('🔄 开始恢复数据库...\n');
    console.log('📁 备份文件:', backupFile);
    console.log('🗄️  目标数据库:', DB_NAME);
    console.log('');

    // 警告提示
    console.log('⚠️  警告: 此操作将覆盖现有数据！');
    console.log('请确认要继续...\n');

    // 设置环境变量
    const env = {
      ...process.env,
      PGPASSWORD: DB_PASSWORD
    };

    // 执行恢复
    const command = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "${backupFile}"`;
    
    console.log('📦 执行恢复命令...');
    await execAsync(command, { env });

    console.log('\n✅ 数据库恢复成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏰ 恢复时间:', new Date().toLocaleString('zh-CN'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 恢复失败:', error.message);
    process.exit(1);
  }
}

// 获取命令行参数
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ 请指定备份文件');
  console.log('\n使用方法:');
  console.log('  node restore-db.js <backup-file.sql>');
  console.log('\n示例:');
  console.log('  node restore-db.js ../../backups/yanora_backup_2024-01-01.sql');
  process.exit(1);
}

// 执行恢复
restoreDatabase(path.resolve(backupFile));

