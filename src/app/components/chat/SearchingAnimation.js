'use client'
import { useState, useEffect } from 'react'

export default function SearchingAnimation() {
  const [currentLogo, setCurrentLogo] = useState(0)
  
  const logos = [
    {
      name: 'idealista',
      url: 'https://res.cloudinary.com/dr3mimpok/image/upload/v1756468194/unnamed_1_vcgy2s.png'
    },
    {
      name: 'fotocasa',
      url: 'https://res.cloudinary.com/dr3mimpok/image/upload/v1756468194/images_yumis2.png'
    },
    {
      name: 'habitaclia',
      url: 'https://res.cloudinary.com/dr3mimpok/image/upload/v1756468194/unnamed_2_sioeox.png'
    },
    {
      name: 'pisos.com',
      url: 'https://res.cloudinary.com/dr3mimpok/image/upload/v1756468194/images_1_sgxdrp.jpg'
    },
    {
      name: 'yaencontre',
      url: 'https://res.cloudinary.com/dr3mimpok/image/upload/v1756468194/images_1_gg887e.png'
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length)
    }, 1200)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 inline-block">
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 text-sm">Buscando en</span>
        
        {/* Contenedor para los logos - más grande */}
        <div className="relative w-28 h-8 flex items-center justify-center">
          {logos.map((logo, index) => (
            <img 
              key={logo.name}
              src={logo.url} 
              alt={logo.name}
              className={`absolute h-8 w-auto object-contain transition-all duration-300 ${
                index === currentLogo 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
