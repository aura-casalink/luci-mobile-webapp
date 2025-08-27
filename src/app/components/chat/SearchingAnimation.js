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
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 inline-block">
      <div className="flex items-center space-x-3">
        <span className="text-gray-600 text-sm">Buscando en</span>
        <span 
          className="font-bold text-sm transition-all duration-300"
          style={{ color: logos[currentLogo].color }}
        >
          {logos[currentLogo].name}
        </span>
        <div className="flex space-x-1">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span>
          <span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
        </div>
      </div>
    </div>
  )
}
