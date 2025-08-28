'use client'
import { useState, useEffect, useRef } from 'react'
import PropertyCarousel from './PropertyCarousel'
import ServicesCarousel from './ServicesCarousel'
import PropertyDetailView from '../properties/PropertyDetailView'
import { useExploreProperties } from '../../hooks/useExploreProperties'
import DiscoverProperties from './DiscoverProperties'

export default function ExploreContainer({ sessionId, savedProperties, onToggleSave, onSendMessage }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [discoverCurrentIndex, setDiscoverCurrentIndex] = useState(0)
  const [isTikTokMode, setIsTikTokMode] = useState(false)
  const discoverRef = useRef(null)
  const { getPropertyDetails } = useExploreProperties()

  const handlePropertyClick = (property) => {
    const fullProperty = getPropertyDetails(property.id)
    if (fullProperty) {
      setSelectedProperty(fullProperty)
    }
  }

  useEffect(() => {
    let isScrolling = false

    const handleScroll = () => {
      if (!discoverRef.current || isScrolling) return
      
      const discoverRect = discoverRef.current.getBoundingClientRect()
      
      // Activar TikTok mode cuando el título de Descubre está en la parte superior
      if (discoverRect.top <= 80 && !isTikTokMode) {
        setIsTikTokMode(true)
      }
      
      // Desactivar si scrolleamos hacia arriba fuera de la sección
      if (discoverRect.top > 100 && isTikTokMode) {
        setIsTikTokMode(false)
        setDiscoverCurrentIndex(0)
      }
    }

    const handleWheel = (e) => {
      if (!isTikTokMode) return
      
      // Solo intervenir en modo TikTok
      e.preventDefault()
      isScrolling = true
      
      if (e.deltaY > 0) {
        // Siguiente propiedad
        setDiscoverCurrentIndex(prev => prev + 1)
      } else {
        // Anterior o salir
        if (discoverCurrentIndex > 0) {
          setDiscoverCurrentIndex(prev => prev - 1)
        } else {
          // Salir del modo TikTok
          setIsTikTokMode(false)
          window.scrollBy(0, -100)
        }
      }
      
      setTimeout(() => { isScrolling = false }, 300)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isTikTokMode, discoverCurrentIndex])

  if (selectedProperty) {
    return (
      <PropertyDetailView
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onSendMessage={onSendMessage || (() => {})}
        savedProperties={savedProperties}
        onToggleSave={onToggleSave}
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white scroll-smooth">
      {/* Espaciador inicial para el nav bar */}
      <div className="h-16"></div>
      
      {/* Nuestras Propiedades */}
      <section className="py-6 scroll-mt-16">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestras Propiedades</h2>
        </div>
        <PropertyCarousel 
          savedProperties={savedProperties} 
          onToggleSave={onToggleSave}
          onPropertyClick={handlePropertyClick}
        />
      </section>

      {/* Nuestros Servicios */}
      <section className="py-6 scroll-mt-16">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>

      {/* Descubre Propiedades */}
      <section ref={discoverRef} className="py-6 scroll-mt-16">
        <div className={`px-4 pb-4 ${
          isTikTokMode ? 'fixed top-16 left-0 right-0 bg-white z-40 border-b' : ''
        }`}>
          <h2 className="text-xl font-bold text-[#0A0A23] mb-2">Descubre Propiedades</h2>
          {!isTikTokMode && <p className="text-sm text-gray-500">Continúa para explorar</p>}
        </div>
        
        {/* Espaciador cuando el título está fijo */}
        {isTikTokMode && <div className="h-20"></div>}
        
        <div className={`px-4 ${isTikTokMode ? 'fixed top-32 left-0 right-0 bottom-0 overflow-hidden bg-white z-30' : ''}`}>
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={handlePropertyClick}
            isFullscreen={isTikTokMode}
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>
      
      {/* Espaciador extra en modo TikTok */}
      {isTikTokMode && <div style={{ height: '200vh' }}></div>}
      
      {/* Espaciador para el tab bar */}
      <div className="h-20"></div>
    </div>
  )
}
