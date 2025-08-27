'use client'
import { useState, useEffect } from 'react'

export default function SearchingAnimation() {
  const [currentLogo, setCurrentLogo] = useState(0)
  
  const logos = [
    { name: 'idealista', color: '#6DB83F' },
    { name: 'fotocasa', color: '#FF6B00' },
    { name: 'habitaclia', color: '#E74C3C' },
    { name: 'casas.com', color: '#2E86AB' }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 font-medium">Buscando en</span>
        <span 
          className="font-bold transition-all duration-300"
          style={{ color: logos[currentLogo].color }}
        >
          {logos[currentLogo].name}
        </span>
      </div>
      <div className="flex space-x-1">
        <span className="animate-bounce animation-delay-0">.</span>
        <span className="animate-bounce animation-delay-100">.</span>
        <span className="animate-bounce animation-delay-200">.</span>
      </div>
    </div>
  )
}
