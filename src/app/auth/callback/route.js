import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// CRÍTICO: Forzar evaluación dinámica para evitar cache
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/';
  const sid = searchParams.get('sid');

  // Construir URL de destino
  const finalUrl = new URL(next, origin);
  if (sid) finalUrl.searchParams.set('sid', sid);

  const cookieStore = cookies();
  
  // Diagnóstico en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Auth callback debug:', {
      code: code ? 'present' : 'missing',
      origin,
      next,
      cookies: cookieStore.getAll().map(c => c.name)
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    if (code) {
      // Intercambiar código por sesión
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Auth error:', error.message);
        
        // Si el error es de PKCE, es problema de cookies/dominio
        if (error.message?.includes('code verifier')) {
          return NextResponse.redirect(
            new URL(`/?error=auth&reason=pkce_mismatch`, origin)
          );
        }
        
        throw error;
      }
      
      console.log('✅ Session exchanged successfully');
      
    } else if (token_hash) {
      // Magic link
      const { error } = await supabase.auth.verifyOtp({ 
        type: type === 'recovery' ? 'recovery' : 'email', 
        token_hash 
      });
      if (error) throw error;
    }
    
    // Redirigir al destino final
    return NextResponse.redirect(finalUrl);
    
  } catch (e) {
    console.error('❌ Callback error:', e);
    return NextResponse.redirect(
      new URL(`/?error=auth&reason=${encodeURIComponent(e.message || 'unknown')}`, origin)
    );
  }
}
