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

    const handleWheel = (e) => {
      if (isScrolling) return
      
      const deltaY = e.deltaY
      
      // Evitar múltiples eventos de scroll rápidos
      isScrolling = true
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrolling = false
      }, 300)

      if (!isDiscoverFullscreen) {
        // En vista normal: detectar si estamos cerca de la sección de Discover Properties
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        
        // Si scroll down y estamos cerca del final (sección de Discover Properties)
        if (deltaY > 0 && (scrollTop + windowHeight) >= (documentHeight - 100)) {
          e.preventDefault()
          setIsDiscoverFullscreen(true)
        }
      } else {
        // En vista fullscreen de Discover Properties
        e.preventDefault()
        
        if (deltaY > 0) {
          // Scroll down: siguiente propiedad (se maneja en DiscoverProperties)
          setDiscoverCurrentIndex(prev => prev + 1)
        } else {
          // Scroll up: propiedad anterior o salir de fullscreen
          if (discoverCurrentIndex > 0) {
            setDiscoverCurrentIndex(prev => prev - 1)
          } else {
            setIsDiscoverFullscreen(false)
          }
        }
      }
    }

    const handleTouchStart = (e) => {
      const touchStartY = e.touches[0].clientY
      
      const handleTouchMove = (e) => {
        if (isScrolling) return
        
        const touchEndY = e.touches[0].clientY
        const diff = touchStartY - touchEndY

        if (Math.abs(diff) > 50) {
          isScrolling = true
          
          if (!isDiscoverFullscreen) {
            // En vista normal: swipe up cerca del final activa fullscreen
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            
            if (diff > 0 && (scrollTop + windowHeight) >= (documentHeight - 100)) {
              e.preventDefault()
              setIsDiscoverFullscreen(true)
            }
          } else {
            // En fullscreen: swipe up = siguiente, swipe down = anterior o salir
            e.preventDefault()
            
            if (diff > 0) {
              // Swipe up: siguiente propiedad
              setDiscoverCurrentIndex(prev => prev + 1)
            } else {
              // Swipe down: propiedad anterior o salir de fullscreen
              if (discoverCurrentIndex > 0) {
                setDiscoverCurrentIndex(prev => prev - 1)
              } else {
                setIsDiscoverFullscreen(false)
              }
            }
          }

          setTimeout(() => {
            isScrolling = false
          }, 300)
        }
      }

      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', () => {
        document.removeEventListener('touchmove', handleTouchMove)
      }, { once: true })
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('touchstart', handleTouchStart, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('touchstart', handleTouchStart)
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

      <section className="py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Descubre Propiedades</h2>
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
    </div>
  )
}