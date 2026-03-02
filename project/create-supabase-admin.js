import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 缺少 Supabase 环境变量');
  console.error('请确保 .env 文件中有 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  try {
    console.log('=== 创建 Supabase 管理员账户 ===\n');

    const email = 'admin@yanora.com';
    const password = 'Admin123456';

    console.log('正在创建账户...');
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}`);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('\n用户已存在,尝试登录以获取用户信息...');

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          throw new Error(`无法登录: ${signInError.message}`);
        }

        console.log('✓ 用户已存在');

        const { data: existingAdmin, error: checkError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', signInData.user.id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingAdmin) {
          console.log('✓ 该用户已经是管理员');
        } else {
          const { error: insertError } = await supabase
            .from('admins')
            .insert({
              user_id: signInData.user.id,
              email: email,
              role: 'super_admin',
              is_active: true,
            });

          if (insertError) throw insertError;
          console.log('✓ 管理员权限已添加');
        }
      } else {
        throw signUpError;
      }
    } else {
      console.log('✓ 用户创建成功');

      if (authData.user) {
        const { error: insertError } = await supabase
          .from('admins')
          .insert({
            user_id: authData.user.id,
            email: email,
            role: 'super_admin',
            is_active: true,
          });

        if (insertError) {
          console.error('警告: 无法添加管理员权限:', insertError.message);
        } else {
          console.log('✓ 管理员权限已添加');
        }
      }
    }

    console.log('\n=== 管理员创建成功 ===');
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}`);
    console.log('角色: super_admin');
    console.log('\n现在可以使用这些凭据登录管理后台:\n');
    console.log(`  http://localhost:5173/admin/login`);
    console.log('\n请妥善保管这些凭据!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n错误:', error.message);
    process.exit(1);
  }
}

createAdmin();
