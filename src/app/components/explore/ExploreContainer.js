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
  const servicesRef = useRef(null)
  const containerRef = useRef(null)
  const { getPropertyDetails } = useExploreProperties()

  const handlePropertyClick = (property) => {
    const fullProperty = getPropertyDetails(property.id)
    if (fullProperty) {
      setSelectedProperty(fullProperty)
    }
  }

  useEffect(() => {
    let isAutoScrolling = false
    
    const handleScroll = () => {
      if (!discoverRef.current || isAutoScrolling || isTikTokMode) return
      
      const discoverRect = discoverRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Solo activar TikTok cuando la imagen esté casi completa en pantalla
      if (discoverRect.top < -200 && !isTikTokMode) {
        setIsTikTokMode(true)
      }
    }
  
    const handleWheel = (e) => {
      // SOLO intervenir si estamos en modo TikTok Y en la zona correcta
      if (!isTikTokMode) return
      
      const discoverRect = discoverRef.current?.getBoundingClientRect()
      
      // Verificar que realmente estamos en la zona de Descubre
      if (!discoverRect || discoverRect.top > 0) {
        setIsTikTokMode(false)
        return
      }
      
      // Solo prevenir default en modo TikTok activo
      e.preventDefault()
      
      if (e.deltaY > 0) {
        setDiscoverCurrentIndex(prev => prev + 1)
      } else {
        if (discoverCurrentIndex > 0) {
          setDiscoverCurrentIndex(prev => prev - 1)
        } else {
          setIsTikTokMode(false)
          window.scrollBy(0, -100)
        }
      }
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
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-white">
      {/* Nuestras Propiedades - normal */}
      <section className="py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestras Propiedades</h2>
        </div>
        <PropertyCarousel 
          savedProperties={savedProperties} 
          onToggleSave={onToggleSave}
          onPropertyClick={handlePropertyClick}
        />
      </section>

      {/* Nuestros Servicios - normal */}
      <section ref={servicesRef} className="py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>

      {/* Descubre Propiedades */}
      <section ref={discoverRef} className="py-6 min-h-screen">
        <div className={`px-4 pb-4 ${
          isTikTokMode ? 'fixed top-16 left-0 right-0 bg-white z-10' : ''
        }`}>
          <h2 className="text-xl font-bold text-[#0A0A23]">Descubre Propiedades</h2>
          {!isTikTokMode && <p className="text-sm text-gray-500 mt-1">Continúa para explorar</p>}
        </div>
        
        <div className={isTikTokMode ? 'fixed inset-0 pt-32' : ''}>
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={(property) => setSelectedProperty(property)}
            isFullscreen={isTikTokMode}
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>

      {/* Espaciador extra cuando está en TikTok mode para permitir scroll */}
      {isTikTokMode && (
        <div style={{ height: '200vh' }} />
      )}
    </div>
  )
}
