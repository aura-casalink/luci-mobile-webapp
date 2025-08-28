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

  // Detectar cuando llegar a la sección con IntersectionObserver
  useEffect(() => {
    if (!discoverRef.current) return
    
    const el = discoverRef.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3 && !isTikTokMode) {
          setIsTikTokMode(true)
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
      { root: null, threshold: [0, 0.3, 1] }
    )
    
    io.observe(el)
    return () => io.disconnect()
  }, [isTikTokMode])

  // Manejar navegación en modo TikTok
  useEffect(() => {
    if (!isTikTokMode) return

    const handleWheel = (e) => {
      e.preventDefault()
      
      if (e.deltaY > 0) {
        setDiscoverCurrentIndex(prev => prev + 1)
      } else {
        if (discoverCurrentIndex > 0) {
          setDiscoverCurrentIndex(prev => prev - 1)
        } else {
          setIsTikTokMode(false)
          setDiscoverCurrentIndex(0)
          window.scrollBy(0, -200)
        }
      }
    }

    // Bloquear scroll del body
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      document.body.style.overflow = prevOverflow
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
      <div className="h-16"></div>
      
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

      <section className="py-6 scroll-mt-16">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>

      <section ref={discoverRef} className="py-6 scroll-mt-16 min-h-screen">
        <div 
          className={`px-4 pb-4 ${isTikTokMode ? 'sticky bg-white z-40 border-b' : ''}`}
          style={isTikTokMode ? { top: 'var(--top-nav-height)' } : {}}
        >
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
            isFullscreen={isTikTokMode}
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>
      
      <div className="h-20"></div>
    </div>
  )
}
