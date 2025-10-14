'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase-browser'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function handleCallback() {
      const next = searchParams.get('next') || '/chat'
      const sid = searchParams.get('sid')
      const error = searchParams.get('error')

      // Si hay error, redirigir con el error
      if (error) {
        router.replace(`/?error=auth&reason=${encodeURIComponent(error)}`)
        return
      }

      // Esperar un momento para que Supabase procese el code automáticamente
      const supabase = getSupabase()
      
      // Verificar si el auth fue exitoso
      setTimeout(async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          console.log('✅ Login exitoso')
          
          // IMPORTANTE: Verificar si hay una ruta de retorno guardada
          let returnPath = null
          
          if (typeof window !== 'undefined') {
            returnPath = sessionStorage.getItem('auth_return_to')
            
            if (returnPath) {
              console.log('🔙 Retornando a:', returnPath)
              sessionStorage.removeItem('auth_return_to')
              
              // Restaurar el usuario globalmente
              window.currentUser = session.user
              
              // Si vuelve a pricing, marcar que debe mostrar popup
              if (returnPath.includes('/pricing')) {
                console.log('🚧 Guardando flag para mostrar popup en pricing')
                sessionStorage.setItem('show_dev_popup_after_login', 'true')
              }
              
              router.replace(returnPath)
              return
            }
          }
          
          // Si no hay ruta guardada, usar el parámetro 'next' o fallback
          const finalUrl = new URL(next, window.location.origin)
          if (sid) finalUrl.searchParams.set('sid', sid)
          
          console.log('🔙 Retornando a (fallback):', finalUrl.pathname + finalUrl.search)
          
          // Restaurar el usuario globalmente
          if (typeof window !== 'undefined') {
            window.currentUser = session.user
          }
          
          router.replace(finalUrl.pathname + finalUrl.search)
        } else {
          // Error: redirigir con mensaje
          console.error('❌ No session after callback:', sessionError)
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

export default function OAuthClientCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
