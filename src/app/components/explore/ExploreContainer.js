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
    const checkScroll = () => {
      if (!discoverRef.current) return
      
      const rect = discoverRef.current.getBoundingClientRect()
      
      // Activar TikTok cuando la sección Descubre está arriba
      if (rect.top <= 100 && !isTikTokMode) {
        console.log('Activando modo TikTok')
        setIsTikTokMode(true)
        // Hacer scroll para que quede bien posicionado
        discoverRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    window.addEventListener('scroll', checkScroll)
    return () => window.removeEventListener('scroll', checkScroll)
  }, [isTikTokMode])

  // Manejar navegación en modo TikTok
  useEffect(() => {
    if (!isTikTokMode) return

    const handleWheel = (e) => {
      e.preventDefault()
      
      if (e.deltaY > 0) {
        // Siguiente
        setDiscoverCurrentIndex(prev => prev + 1)
      } else {
        // Anterior
        if (discoverCurrentIndex > 0) {
          setDiscoverCurrentIndex(prev => prev - 1)
        } else {
          // Salir del modo TikTok
          setIsTikTokMode(false)
          setDiscoverCurrentIndex(0)
          window.scrollBy(0, -200)
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
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
      {/* Espaciador inicial */}
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
      <section ref={discoverRef} className="py-6 scroll-mt-16 min-h-screen">
        <div className={`px-4 pb-4 ${
          isTikTokMode ? 'sticky top-16 bg-white z-40 border-b' : ''
        }`}>
          <h2 className="text-xl font-bold text-[#0A0A23] mb-2">Descubre Propiedades</h2>
          {!isTikTokMode && <p className="text-sm text-gray-500">Continúa para explorar</p>}
          {isTikTokMode && (
            <p className="text-sm text-gray-500">
              Propiedad {discoverCurrentIndex + 1} • Desliza para navegar
            </p>
          )}
        </div>
        
        <div className="px-4">
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={handlePropertyClick}
            isFullscreen={isTikTokMode}  // IMPORTANTE: pasar el estado correcto
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>
      
      {/* Espaciador para el tab bar */}
      <div className="h-20"></div>
    </div>
  )
}
