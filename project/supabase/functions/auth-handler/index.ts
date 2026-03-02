import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (path === 'register') {
      const { email, password } = await req.json();

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const bcrypt = await import('npm:bcryptjs@2.4.3');
      const passwordHash = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert([{ email, password_hash: passwordHash }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ user: data, token: 'supabase-session' }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'login') {
      const { email, password } = await req.json();

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const bcrypt = await import('npm:bcryptjs@2.4.3');
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
          },
          token: 'supabase-session',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'admin-login') {
      const { email, password } = await req.json();

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const bcrypt = await import('npm:bcryptjs@2.4.3');
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError || !admin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            role: admin.role,
          },
          token: 'supabase-session',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path === 'create-admin') {
      const { email, password, role } = await req.json();

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const bcrypt = await import('npm:bcryptjs@2.4.3');
        const passwordHash = await bcrypt.hash(password, 10);

        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert([{ email, password_hash: passwordHash }])
          .select('id')
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      const { data, error } = await supabase
        .from('admins')
        .insert([{
          user_id: userId,
          email,
          role: role || 'admin',
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
