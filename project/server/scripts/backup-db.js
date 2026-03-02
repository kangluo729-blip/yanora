#!/usr/bin/env node

/**
 * 数据库备份脚本
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

dotenv.config({ path: path.join(__dirname, '.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'yanora_db';
const DB_USER = process.env.DB_USER || 'yanora_user';
const DB_PASSWORD = process.env.DB_PASSWORD;

const BACKUP_DIR = path.join(__dirname, '../../backups');

async function backupDatabase() {
  try {
    console.log('🔄 开始备份数据库...\n');

    // 创建备份目录
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('✅ 创建备份目录:', BACKUP_DIR);
    }

    // 生成备份文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(BACKUP_DIR, `yanora_backup_${timestamp}.sql`);

    // 设置环境变量
    const env = {
      ...process.env,
      PGPASSWORD: DB_PASSWORD
    };

    // 执行备份
    const command = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -F p -f "${backupFile}"`;
    
    console.log('📦 执行备份命令...');
    await execAsync(command, { env });

    // 检查文件大小
    const stats = fs.statSync(backupFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ 数据库备份成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 备份文件:', backupFile);
    console.log('📊 文件大小:', fileSizeInMB, 'MB');
    console.log('⏰ 备份时间:', new Date().toLocaleString('zh-CN'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 清理旧备份（保留最近7天）
    cleanOldBackups();

  } catch (error) {
    console.error('❌ 备份失败:', error.message);
    process.exit(1);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    let deletedCount = 0;

    files.forEach(file => {
      if (file.startsWith('yanora_backup_') && file.endsWith('.sql')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`🗑️  清理了 ${deletedCount} 个旧备份文件\n`);
    }
  } catch (error) {
    console.warn('⚠️  清理旧备份时出错:', error.message);
  }
}

// 执行备份
backupDatabase();

