'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingRoute() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    console.log('✅ Landing route loaded successfully!')
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/chat')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-yellow-600 p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          ✅ LANDING FUNCIONA
        </h1>
        <p className="text-2xl text-white mb-8">
          El routing está correcto
        </p>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <p className="text-4xl font-bold text-gray-900 mb-4">
            {countdown}
          </p>
          <p className="text-gray-600">
            Redirigiendo a /chat...
          </p>
        </div>
        <button
          onClick={() => router.push('/chat')}
          className="mt-8 bg-white text-yellow-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-100 transition"
        >
          Ir a Chat ahora
        </button>
      </div>
    </div>
  )
}
