import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
  const sid = requestUrl.searchParams.get('sid')

  if (code) {
    try {
      // IMPORTANTE: Pasar la función cookies, no cookies()
      const supabase = createRouteHandlerClient({ cookies })

      // Intercambiar el código OAuth por una sesión
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error)
        throw error
      }

      // Construir URL de destino
      const finalUrl = new URL(redirectTo, requestUrl.origin)
      if (sid) finalUrl.searchParams.set('sid', sid)

      return NextResponse.redirect(finalUrl)
    } catch (err) {
      console.error('[auth/callback] ERROR:', err)
      // Redirigir sin error en URL
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }
  }

  // Si no hay code, redirigir a home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
