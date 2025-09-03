import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';
  const sid = requestUrl.searchParams.get('sid');

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get: (name) => cookieStore.get(name)?.value,
            set: (name, value, options) => {
              cookieStore.set({ name, value, ...options })
            },
            remove: (name, options) => {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Exchange error:', error);
        throw error;
      }

      const finalUrl = new URL(redirectTo, requestUrl.origin);
      if (sid) finalUrl.searchParams.set('sid', sid);

      return NextResponse.redirect(finalUrl);
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
