import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forzar evaluación dinámica
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const next = requestUrl.searchParams.get('next') || '/'
  const sid = requestUrl.searchParams.get('sid')
  
  // Validar next para evitar open redirect
  const isValidNext = next.startsWith('/') && !next.startsWith('//')
  const safeNext = isValidNext ? next : '/'

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.delete(name)
        },
      },
    }
  )

  // Exchange del código OAuth
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Éxito: redirigir al destino
      const finalUrl = new URL(safeNext, requestUrl.origin)
      if (sid) finalUrl.searchParams.set('sid', sid)
      return NextResponse.redirect(finalUrl)
    }
    
    // Error en exchange
    console.error('Exchange error:', error.message)
    return NextResponse.redirect(
      new URL(`/?error=auth&reason=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  // Magic link
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({ 
      type: 'magiclink', // IMPORTANTE: usar 'magiclink' no 'email'
      token_hash 
    })
    
    if (!error) {
      const finalUrl = new URL(safeNext, requestUrl.origin)
      if (sid) finalUrl.searchParams.set('sid', sid)
      return NextResponse.redirect(finalUrl)
    }
    
    console.error('Magic link error:', error.message)
  }

  // Si no hay code ni token_hash, error
  return NextResponse.redirect(new URL('/?error=auth', requestUrl.origin))
}
