'use client'
import { useState, useEffect, useRef } from 'react'
import PropertyCarousel from './PropertyCarousel'
import ServicesCarousel from './ServicesCarousel'
import PropertyDetailView from '../properties/PropertyDetailView'
import { useExploreProperties } from '../../hooks/useExploreProperties'
import DiscoverProperties from './DiscoverProperties'

export default function ExploreContainer({ sessionId, savedProperties, onToggleSave, onSendMessage }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [isDiscoverLocked, setIsDiscoverLocked] = useState(false)
  const [discoverCurrentIndex, setDiscoverCurrentIndex] = useState(0)
  const discoverRef = useRef(null)
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
      if (!discoverRef.current || isAutoScrolling || isDiscoverLocked) return
      
      const rect = discoverRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Detectar cuando el 25% de la primera imagen está visible
      if (rect.top < viewportHeight * 0.75 && rect.top > -100) {
        isAutoScrolling = true
        
        // Auto-completar el scroll hasta posición perfecta
        window.scrollTo({
          top: discoverRef.current.offsetTop - 64, // 64px es la altura del nav
          behavior: 'smooth'
        })
        
        setTimeout(() => {
          setIsDiscoverLocked(true)
          isAutoScrolling = false
        }, 500)
      }
    }

    const handleWheel = (e) => {
      if (!isDiscoverLocked) return
      
      // Verificar si estamos en la zona de Descubre
      const rect = discoverRef.current?.getBoundingClientRect()
      if (!rect || rect.top > 100) {
        setIsDiscoverLocked(false)
        return
      }
      
      e.preventDefault()
      
      // Navegación entre propiedades
      if (e.deltaY > 0) {
        // Scroll down - siguiente propiedad
        setDiscoverCurrentIndex(prev => prev + 1)
      } else if (e.deltaY < 0) {
        // Scroll up
        if (discoverCurrentIndex > 0) {
          // Propiedad anterior
          setDiscoverCurrentIndex(prev => prev - 1)
        } else {
          // Salir del modo locked y volver arriba
          setIsDiscoverLocked(false)
          window.scrollBy(0, -200)
        }
      }
    }

    // Touch events para móvil
    let touchStartY = 0
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    
    const handleTouchMove = (e) => {
      if (!isDiscoverLocked) return
      
      const touchEndY = e.touches[0].clientY
      const diff = touchStartY - touchEndY
      
      if (Math.abs(diff) > 50) {
        e.preventDefault()
        
        if (diff > 0) {
          // Swipe up - siguiente
          setDiscoverCurrentIndex(prev => prev + 1)
        } else {
          // Swipe down
          if (discoverCurrentIndex > 0) {
            setDiscoverCurrentIndex(prev => prev - 1)
          } else {
            setIsDiscoverLocked(false)
            window.scrollBy(0, -200)
          }
        }
        
        touchStartY = touchEndY
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isDiscoverLocked, discoverCurrentIndex])

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

      <section 
        ref={discoverRef}
        className={`${isDiscoverLocked ? 'fixed top-16 left-0 right-0 bottom-0 bg-white z-40' : 'py-6'}`}
      >
        <div className="px-4 pb-4">
          <h2 className="text-xl font-bold text-[#0A0A23]">
            Descubre Propiedades
            {isDiscoverLocked && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ↕ Desliza para navegar
              </span>
            )}
          </h2>
        </div>
        
        {/* Siempre mostrar a tamaño completo */}
        <div style={{ height: isDiscoverLocked ? 'calc(100vh - 120px)' : `${window.innerHeight - 120}px` }}>
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={(property) => setSelectedProperty(property)}
            isFullscreen={true} // Siempre en tamaño completo
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>
      
      {/* Espaciador cuando está locked para mantener el scroll */}
      {isDiscoverLocked && (
        <div style={{ height: `${window.innerHeight}px` }} />
      )}
    </div>
  )
}
