'use client'
import { useState, useEffect, useRef } from 'react'
import PropertyCarousel from './PropertyCarousel'
import ServicesCarousel from './ServicesCarousel'
import PropertyDetailView from '../properties/PropertyDetailView'
import { useExploreProperties } from '../../hooks/useExploreProperties'
import DiscoverProperties from './DiscoverProperties'

export default function ExploreContainer({ sessionId, savedProperties, onToggleSave, onSendMessage }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [isDiscoverFullscreen, setIsDiscoverFullscreen] = useState(false)
  const [discoverCurrentIndex, setDiscoverCurrentIndex] = useState(0)
  const scrollTimeoutRef = useRef(null)
  const { getPropertyDetails } = useExploreProperties()

  const handlePropertyClick = (property) => {
    const fullProperty = getPropertyDetails(property.id)
    if (fullProperty) {
      setSelectedProperty(fullProperty)
    }
  }

  // Manejar scroll para la sección de Discover Properties
  useEffect(() => {
    let isScrolling = false
    const discoverSectionRef = document.getElementById('discover-section')
  
    const handleScroll = () => {
      if (!discoverSectionRef || isScrolling) return
      
      const rect = discoverSectionRef.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Si el 25% superior de Discover está visible y no estamos en fullscreen
      if (!isDiscoverFullscreen && rect.top < windowHeight * 0.75 && rect.top > 0) {
        isScrolling = true
        
        // Auto-scroll suave hasta el inicio de la sección
        discoverSectionRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
        
        // Después del scroll, activar fullscreen
        setTimeout(() => {
          setIsDiscoverFullscreen(true)
          isScrolling = false
        }, 800)
      }
    }
  
    const handleWheel = (e) => {
      if (isDiscoverFullscreen) {
        e.preventDefault()
        
        if (e.deltaY > 0) {
          // Scroll down: siguiente propiedad
          setDiscoverCurrentIndex(prev => prev + 1)
        } else {
          // Scroll up: anterior o salir
          if (discoverCurrentIndex > 0) {
            setDiscoverCurrentIndex(prev => prev - 1)
          } else {
            setIsDiscoverFullscreen(false)
            // Scroll un poco hacia arriba para ver las secciones anteriores
            window.scrollBy(0, -100)
          }
        }
      }
    }
  
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('wheel', handleWheel, { passive: false })
  
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [isDiscoverFullscreen, discoverCurrentIndex])

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
    <div className="flex-1 overflow-y-auto bg-white">
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
  
      <section className="py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>
  
      <section id="discover-section" className={`py-6 ${
        isDiscoverFullscreen ? 'fixed inset-0 z-50 bg-white flex flex-col' : ''
      }`}>
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">
            Descubre Propiedades
            {isDiscoverFullscreen && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                Desliza para explorar
              </span>
            )}
          </h2>
        </div>
        <div className={isDiscoverFullscreen ? 'flex-1' : ''}>
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={(property) => setSelectedProperty(property)}
            isFullscreen={isDiscoverFullscreen}
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>
      
      {/* Espaciador cuando está en fullscreen */}
      {isDiscoverFullscreen && <div style={{ height: '100vh' }} />}
    </div>
  )
}
