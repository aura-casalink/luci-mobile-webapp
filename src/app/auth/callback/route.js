import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/';
  const sid = searchParams.get('sid');
  const tab = searchParams.get('tab');

  // Construir URL final preservando parámetros
  const finalUrl = new URL(next, origin);
  if (sid) finalUrl.searchParams.set('sid', sid);
  if (tab) finalUrl.searchParams.set('tab', tab);

  const res = NextResponse.redirect(finalUrl);
  
  // Asegurar que landing_seen se preserve
  res.cookies.set({
    name: 'landing_seen',
    value: 'true',
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 365 // 1 año
  });

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
    console.error('Auth callback error:', e);
    return NextResponse.redirect(new URL('/?error=auth', origin));
  }

  return res;
}
