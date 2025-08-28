'use client'
import { useState, useEffect, useRef } from 'react'
import OurProperties from './OurProperties'
import OurServices from './OurServices'
import DiscoverProperties from './DiscoverProperties'

export default function ExploreContainer({ sessionId, savedProperties, onToggleSave, onPropertyClick }) {
  const [currentDiscoverIndex, setCurrentDiscoverIndex] = useState(0)
  const [isDiscoverLocked, setIsDiscoverLocked] = useState(false)
  const discoverRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!discoverRef.current || !containerRef.current) return
      
      const discoverRect = discoverRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      
      // Si el 25% superior de Descubre está visible
      const triggerPoint = window.innerHeight * 0.75
      
      if (discoverRect.top < triggerPoint && discoverRect.top > 100 && !isDiscoverLocked) {
        // Auto-scroll suave hasta fijar la sección
        setIsDiscoverLocked(true)
        discoverRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
      
      // Desbloquear si scrollea hacia arriba fuera de la zona
      if (discoverRect.top > window.innerHeight && isDiscoverLocked) {
        setIsDiscoverLocked(false)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [isDiscoverLocked])

  // Manejar scroll dentro de Descubre cuando está bloqueado
  useEffect(() => {
    if (!isDiscoverLocked) return

    const handleWheel = (e) => {
      const discoverRect = discoverRef.current?.getBoundingClientRect()
      
      // Si Descubre está visible y bloqueado
      if (discoverRect && discoverRect.top <= 80 && discoverRect.bottom >= window.innerHeight) {
        e.preventDefault()
        
        // Cambiar índice con el scroll
        if (e.deltaY > 0) {
          setCurrentDiscoverIndex(prev => prev + 1) // Siguiente propiedad
        } else {
          setCurrentDiscoverIndex(prev => Math.max(0, prev - 1)) // Anterior
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isDiscoverLocked])

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto bg-gray-50"
    >
      {/* Sección Nuestras Propiedades */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestras propiedades</h2>
        <OurProperties />
      </div>

      {/* Sección Nuestros Servicios */}
      <div className="p-4 mt-6">
        <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros servicios</h2>
        <OurServices />
      </div>

      {/* Sección Descubre Propiedades */}
      <div 
        ref={discoverRef}
        className={`mt-6 transition-all duration-300 ${
          isDiscoverLocked ? 'fixed top-16 left-0 right-0 bottom-0 z-40 bg-gray-50' : ''
        }`}
      >
        <div className={`${isDiscoverLocked ? 'h-full flex flex-col' : ''}`}>
          <div className="p-4 bg-gray-50">
            <h2 className="text-xl font-bold text-[#0A0A23]">Descubre propiedades</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isDiscoverLocked ? 'Desliza para explorar' : 'Scroll para ver más'}
            </p>
          </div>
          
          <div className={`${isDiscoverLocked ? 'flex-1 overflow-hidden' : 'h-[600px]'}`}>
            <DiscoverProperties 
              sessionId={sessionId}
              savedProperties={savedProperties}
              onToggleSave={onToggleSave}
              onPropertyClick={onPropertyClick}
              isFullscreen={isDiscoverLocked}
              currentIndex={currentDiscoverIndex}
              onCurrentIndexChange={setCurrentDiscoverIndex}
            />
          </div>
        </div>
      </div>

      {/* Espaciador cuando Descubre está fijo */}
      {isDiscoverLocked && (
        <div style={{ height: 'calc(100vh - 64px)' }} />
      )}
    </div>
  )
}
