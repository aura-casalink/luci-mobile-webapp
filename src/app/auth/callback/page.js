'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase-browser'

export default function OAuthClientCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleCallback() {
      const next = searchParams.get('next') || '/'
      const sid = searchParams.get('sid')
      const error = searchParams.get('error')

      // Si hay error, redirigir con el error
      if (error) {
        router.replace(`/?error=auth&reason=${encodeURIComponent(error)}`)
        return
      }

      // Esperar un momento para que Supabase procese el code automáticamente
      // (detectSessionInUrl: true hace el exchange automáticamente)
      const supabase = getSupabase()
      
      // Verificar si el auth fue exitoso
      setTimeout(async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          // Éxito: redirigir al destino
          const finalUrl = new URL(next, window.location.origin)
          if (sid) finalUrl.searchParams.set('sid', sid)
          router.replace(finalUrl.pathname + finalUrl.search)
        } else {
          // Error: redirigir con mensaje
          console.error('No session after callback:', sessionError)
          router.replace(`/?error=auth&reason=no_session`)
        }
      }, 500) // Dar tiempo a Supabase para procesar
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Iniciando sesión...</p>
      </div>
    </div>
  )
}
