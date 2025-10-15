'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LandingPage from '@/app/components/landing/LandingPage'

export default function LandingRoute() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // Verificar si ya vieron la landing
  useEffect(() => {
    console.log('🔍 Landing route mounted')
    
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('landing_seen')
      console.log('🔍 landing_seen value:', seen)
      
      // Preservar parámetros UTM
      const searchParams = window.location.search
      console.log('📊 Search params en landing:', searchParams)
      
      if (seen === 'true') {
        console.log('✅ Usuario recurrente en /landing → Redirigiendo a /chat con params:', searchParams)
        router.replace(`/chat${searchParams}`)
      } else {
        console.log('🆕 Primera visita → Mostrando landing')
        setIsChecking(false)
      }
    }  // <-- ESTA LLAVE FALTABA
  }, [router])

  const handleStartApp = () => {
    console.log('🚀 handleStartApp called')
    
    // Guardar que ya vieron la landing
    if (typeof window !== 'undefined') {
      localStorage.setItem('landing_seen', 'true')
      console.log('✅ landing_seen guardado')
    }
    
    // Preservar parámetros UTM al redirigir
    const searchParams = typeof window !== 'undefined' ? window.location.search : ''
    console.log('📊 Search params al empezar:', searchParams)
    
    // Redirigir a chat
    console.log('🚀 Redirigiendo a /chat con params:', searchParams)
    router.push(`/chat${searchParams}`)
  }

  // Mientras verifica, mostrar loader
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Preparando experiencia...</p>
        </div>
      </div>
    )
  }

  return <LandingPage onStart={handleStartApp} />
}
