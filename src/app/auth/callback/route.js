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

  // Si viene "code" (OAuth), redirigir a página cliente para que haga el exchange
  if (code) {
    const clientCallbackUrl = new URL('/auth/callback/client', requestUrl.origin)
    // Preservar TODOS los params para el cliente
    requestUrl.searchParams.forEach((value, key) => {
      clientCallbackUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(clientCallbackUrl)
  }

  // Magic link - esto SÍ lo maneja el servidor
  if (token_hash) {
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
    
    const { error } = await supabase.auth.verifyOtp({ 
      type: 'magiclink',
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
