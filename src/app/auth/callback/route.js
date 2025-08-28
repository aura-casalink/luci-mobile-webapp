import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const redirectTo = searchParams.get('redirectTo') || '/';
  const sid = searchParams.get('sid');

  const finalUrl = new URL(redirectTo, origin);
  if (sid) finalUrl.searchParams.set('sid', sid);

  const res = NextResponse.redirect(finalUrl);

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: '', ...options }),
      },
    }
  );

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else if (token_hash) {
      const { error } = await supabase.auth.verifyOtp({ 
        type: type === 'recovery' ? 'recovery' : 'email', 
        token_hash 
      });
      if (error) throw error;
    }
  } catch (e) {
    return NextResponse.redirect(new URL('/?error=auth', origin));
  }

  return res;
}
