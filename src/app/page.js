'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Solo ejecutar si pathname es exactamente '/'
    console.log('🔍 Current pathname:', pathname)
    
    if (pathname !== '/') {
      console.log('⏭️ Not on root path, skip redirect')
      return
    }

    console.log('✅ On root path, checking landing_seen...')
    setShouldRedirect(true)
  }, [pathname])

  useEffect(() => {
    if (!shouldRedirect) return
  
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('landing_seen')
      console.log('🔍 landing_seen:', seen)
      
      // Preservar parámetros UTM de la URL actual
      const searchParams = window.location.search // Incluye el "?"
      console.log('📊 Search params capturados:', searchParams)
      
      if (seen === 'true') {
        console.log('✅ Usuario recurrente → Redirigiendo a /chat con params:', searchParams)
        router.replace(`/chat${searchParams}`)
      } else {
        console.log('🆕 Primera visita → Redirigiendo a /landing con params:', searchParams)
        router.replace(`/landing${searchParams}`)
      }
    }
  }, [shouldRedirect, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
