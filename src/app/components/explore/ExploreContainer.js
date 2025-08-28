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
  const containerRef = useRef(null)
  const propertiesRef = useRef(null)
  const servicesRef = useRef(null)
  const discoverRef = useRef(null)
  const { getPropertyDetails } = useExploreProperties()

  const handlePropertyClick = (property) => {
    const fullProperty = getPropertyDetails(property.id)
    if (fullProperty) {
      setSelectedProperty(fullProperty)
    }
  }

  useEffect(() => {
    // Ajustar scroll inicial para que quede bien posicionado
    if (propertiesRef.current) {
      setTimeout(() => {
        propertiesRef.current.scrollIntoView({ behavior: 'auto', block: 'start' })
        // Ajuste fino para compensar el nav bar (64px)
        window.scrollBy(0, -64)
      }, 100)
    }
  }, [])

  useEffect(() => {
    let isScrolling = false
    let lastScrollTop = 0

    const handleScroll = () => {
      if (isScrolling) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollingDown = scrollTop > lastScrollTop
      lastScrollTop = scrollTop

      // Solo actuar si hay movimiento significativo
      if (Math.abs(scrollTop - lastScrollTop) < 50) return

      const sections = [
        { ref: propertiesRef, offset: 64 },
        { ref: servicesRef, offset: 64 },
        { ref: discoverRef, offset: 64 }
      ]

      if (scrollingDown) {
        // Encontrar la siguiente sección
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i]
          if (section.ref.current) {
            const rect = section.ref.current.getBoundingClientRect()
            // Si la sección está parcialmente visible y estamos bajando
            if (rect.top < window.innerHeight && rect.top > -100) {
              isScrolling = true
              const targetScroll = section.ref.current.offsetTop - section.offset
              window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              })
              setTimeout(() => { isScrolling = false }, 800)
              break
            }
          }
        }
      } else {
        // Scrolling up - ir a la sección anterior completamente visible
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i]
          if (section.ref.current) {
            const rect = section.ref.current.getBoundingClientRect()
            if (rect.top < 0 && rect.bottom > 100) {
              isScrolling = true
              const targetScroll = section.ref.current.offsetTop - section.offset
              window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              })
              setTimeout(() => { isScrolling = false }, 800)
              break
            }
          }
        }
      }
    }

    // Detectar fin del scroll para aplicar snap
    let scrollEndTimer
    const handleScrollEnd = () => {
      clearTimeout(scrollEndTimer)
      scrollEndTimer = setTimeout(() => {
        if (!isScrolling) {
          handleScroll()
        }
      }, 150)
    }

    window.addEventListener('scroll', handleScrollEnd)
    return () => {
      window.removeEventListener('scroll', handleScrollEnd)
      clearTimeout(scrollEndTimer)
    }
  }, [])

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
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Espaciador para el nav bar */}
      <div className="h-16"></div>

      {/* Nuestras Propiedades */}
      <section ref={propertiesRef} className="py-6 min-h-[calc(100vh-64px)]">
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
      <section ref={servicesRef} className="py-6 min-h-[calc(100vh-64px)]">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>

      {/* Descubre Propiedades */}
      <section ref={discoverRef} className="py-6">
        <div className="px-4 pb-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Descubre Propiedades</h2>
          <p className="text-sm text-gray-500">Continúa para explorar</p>
        </div>
        
        <div className="px-4">
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={handlePropertyClick}
            isFullscreen={false}
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
