'use client'
import { useState, useEffect } from 'react'

export default function SearchingAnimation() {
  const [currentLogo, setCurrentLogo] = useState(0)
  
  // URLs de los logos de los portales inmobiliarios
  const logos = [
    {
      name: 'Idealista',
      url: 'https://x.idealista.com/idealista-app/app-static/brand/logo_android_main@3x.png',
      bg: '#6DB83F'
    },
    {
      name: 'Fotocasa',
      url: 'https://st.fotocasa.es/images/logos/fotocasa-logo.svg',
      bg: '#FF6B00'
    },
    {
      name: 'Habitaclia',
      url: 'https://static.habitaclia.com/img/logos/habitaclia-logo-color.svg',
      bg: '#FF6700'
    },
    {
      name: 'Pisos.com',
      url: 'https://st.pisosypisos.com/statics/pisos/img/logos/pisos-logo.svg',
      bg: '#004B87'
    },
    {
      name: 'Yaencontre',
      url: 'https://www.yaencontre.com/img/yaencontre-logo.svg',
      bg: '#E91E63'
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length)
    }, 1500) // Cambiar cada 1.5 segundos
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-4 inline-block">
      <div className="flex items-center space-x-3">
        <span className="text-gray-600 text-sm">Buscando en</span>
        
        {/* Contenedor para los logos con transición */}
        <div className="relative w-24 h-8 overflow-hidden">
          {logos.map((logo, index) => (
            <div
              key={logo.name}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                index === currentLogo 
                  ? 'opacity-100 transform translate-y-0' 
                  : index === (currentLogo - 1 + logos.length) % logos.length
                  ? 'opacity-0 transform -translate-y-full'
                  : 'opacity-0 transform translate-y-full'
              }`}
            >
              <img 
                src={logo.url} 
                alt={logo.name}
                className="h-6 object-contain"
                style={{ maxWidth: '80px' }}
                onError={(e) => {
                  // Si falla la imagen, mostrar el nombre como fallback
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <span 
                className="font-bold text-sm hidden"
                style={{ color: logo.bg, display: 'none' }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Puntos animados */}
        <div className="flex space-x-1">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span>
          <span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
        </div>
      </div>
    </div>
  )
}
