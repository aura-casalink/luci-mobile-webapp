'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    // IMPORTANTE: El redirect a desktop se maneja en next.config.mjs
    // Este código solo se ejecuta si NO hubo redirect (es decir, si es móvil)
    
    if (typeof window !== 'undefined') {
      // Verificar si ya vieron la landing
      const seen = localStorage.getItem('landing_seen')
      
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
