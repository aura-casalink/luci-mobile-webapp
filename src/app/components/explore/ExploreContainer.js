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
    let lastScrollTop = 0

    const handleScroll = (e) => {
      if (isAutoScrolling) return
      
      const scrollTop = containerRef.current?.scrollTop || 0
      const scrollingDown = scrollTop > lastScrollTop
      lastScrollTop = scrollTop

      // Puntos de anclaje
      const servicesTop = servicesRef.current?.offsetTop || 0
      const discoverTop = discoverRef.current?.offsetTop || 0
      
      // Auto-scroll a puntos clave
      if (scrollingDown) {
        // Si estamos cerca de servicios, anclar ahí
        if (scrollTop > servicesTop - 200 && scrollTop < servicesTop + 50) {
          isAutoScrolling = true
          containerRef.current?.scrollTo({
            top: servicesTop - 20,
            behavior: 'smooth'
          })
          setTimeout(() => { isAutoScrolling = false }, 500)
        }
        // Si estamos cerca de descubre, anclar ahí
        else if (scrollTop > discoverTop - 300 && scrollTop < discoverTop - 100) {
          isAutoScrolling = true
          containerRef.current?.scrollTo({
            top: discoverTop - 80,
            behavior: 'smooth'
          })
          setTimeout(() => { isAutoScrolling = false }, 500)
        }
        // Si vemos casi toda la primera imagen, modo TikTok
        else if (scrollTop > discoverTop + 100 && !isTikTokMode) {
          isAutoScrolling = true
          setIsTikTokMode(true)
          containerRef.current?.scrollTo({
            top: discoverTop + 200,
            behavior: 'smooth'
          })
          setTimeout(() => { isAutoScrolling = false }, 500)
        }
      }
    }

    const handleWheel = (e) => {
      // Solo intervenir en modo TikTok
      if (!isTikTokMode) return
      
      const discoverRect = discoverRef.current?.getBoundingClientRect()
      if (!discoverRect || discoverRect.top < -200) return
      
      e.preventDefault()
      
      if (e.deltaY > 0) {
        // Siguiente propiedad
        setDiscoverCurrentIndex(prev => prev + 1)
      } else {
        // Anterior o salir de TikTok
        if (discoverCurrentIndex > 0) {
          setDiscoverCurrentIndex(prev => prev - 1)
        } else {
          // Volver a vista con título
          setIsTikTokMode(false)
          containerRef.current?.scrollTo({
            top: discoverRef.current.offsetTop - 80,
            behavior: 'smooth'
          })
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      window.addEventListener('wheel', handleWheel, { passive: false })
      
      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('wheel', handleWheel)
      }
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
      <section ref={discoverRef} className="py-6">
        <div className={`px-4 pb-4 transition-all duration-500 ${
          isTikTokMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}>
          <h2 className="text-xl font-bold text-[#0A0A23]">Descubre Propiedades</h2>
          <p className="text-sm text-gray-500 mt-1">Continúa para explorar</p>
        </div>
        
        {/* Altura dinámica basada en modo */}
        <div style={{ 
          height: isTikTokMode ? '100vh' : '80vh',
          transition: 'height 0.5s ease'
        }}>
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
