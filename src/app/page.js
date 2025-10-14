'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    // IMPORTANTE: Solo ejecutar si estamos exactamente en '/'
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      
      // Si ya estamos en otra ruta, no hacer nada
      if (currentPath !== '/' && currentPath !== '') {
        console.log('⏭️ No estamos en /, skip redirect')
        return
      }
      
      console.log('🔍 Estamos en /, verificando landing_seen...')
      
      // Verificar si ya vieron la landing
      const seen = localStorage.getItem('landing_seen')
      console.log('🔍 landing_seen:', seen)
      
      if (seen === 'true') {
        // Ya vieron landing → ir directo a chat
        console.log('✅ Usuario recurrente → Redirigiendo a /chat')
        router.replace('/chat')
      } else {
        // Primera visita → mostrar landing
        console.log('🆕 Primera visita → Redirigiendo a /landing')
        router.replace('/landing')
      }
    }
  }, [router])

  // Mostrar un loader mientras decide
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
