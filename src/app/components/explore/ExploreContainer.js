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
  const beforeDiscoverRef = useRef(null)
  const { getPropertyDetails } = useExploreProperties()

  const handlePropertyClick = (property) => {
    const fullProperty = getPropertyDetails(property.id)
    if (fullProperty) {
      setSelectedProperty(fullProperty)
    }
  }

  const exitTikTokToTop = () => {
    // 1) Salir del modo TikTok
    setIsTikTokMode(false)
    setDiscoverCurrentIndex(0)

    // 2) Forzar desbloqueo del scroll inmediatamente
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.documentElement.style.overscrollBehaviorY = ''
    document.body.style.overscrollBehaviorY = ''

    // 3) Esperar a que React actualice el DOM y luego hacer scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const topNav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-nav-height')) || 64
        const el = beforeDiscoverRef.current
        if (el) {
          const y = el.getBoundingClientRect().bottom + window.scrollY - topNav - 100
          window.scrollTo({ top: y, behavior: 'smooth' })
        } else {
          window.scrollBy({ top: -400, behavior: 'smooth' })
        }
      })
    })
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
          exitTikTokToTop()
        }
      }
    }

    // Guardar estados previos
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevHtmlOB = document.documentElement.style.overscrollBehaviorY
    const prevBodyOB = document.body.style.overscrollBehaviorY
    
    // Bloquea scroll del body y del root (iOS)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    
    // Evita scroll chaining (empujar el viewport) en iOS/Android
    document.documentElement.style.overscrollBehaviorY = 'none'
    document.body.style.overscrollBehaviorY = 'none'
    
    // Prevenir touchmove para bloqueo total en móviles
    const prevent = (e) => e.preventDefault()
    
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchmove', prevent, { passive: false })
    
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.documentElement.style.overscrollBehaviorY = prevHtmlOB
      document.body.style.overscrollBehaviorY = prevBodyOB
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', prevent)
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

      {/* Ancla para volver a carruseles */}
      <div id="before-discover" ref={beforeDiscoverRef} />

      <section className="py-6 scroll-mt-16 min-h-screen">
        {/* BLOQUE STICKY: título + viewport feed */}
        <div
          ref={discoverRef}
          className={`${isTikTokMode ? 'sticky z-30 bg-white' : ''}`}
          style={
            isTikTokMode
              ? {
                  top: 'var(--top-nav-height)',
                  height: 'calc(100dvh - var(--top-nav-height) - var(--bottom-nav-height) - env(safe-area-inset-bottom))',
                  display: 'flex',
                  flexDirection: 'column',
                  overscrollBehaviorY: 'contain'
                }
              : {}
          }
        >
          {/* Header dentro del bloque */}
          <div
            className="px-4 pb-3 pt-2"
            style={isTikTokMode ? { 
              height: 'var(--discover-title-height)', 
              flex: '0 0 var(--discover-title-height)' 
            } : {}}
          >
            <h2 className="text-xl font-bold text-[#0A0A23] leading-none">Descubre Propiedades</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isTikTokMode 
                ? 'Desliza hacia abajo para ver más'
                : 'Continúa para explorar'}
            </p>
          </div>

          {/* Viewport del feed */}
          <div style={isTikTokMode ? { flex: '1 1 auto', minHeight: 0, overflow: 'hidden' } : {}}>
            <DiscoverProperties
              sessionId={sessionId}
              savedProperties={savedProperties}
              onToggleSave={onToggleSave}
              onPropertyClick={handlePropertyClick}
              currentIndex={discoverCurrentIndex}
              onCurrentIndexChange={setDiscoverCurrentIndex}
              isFullscreen={isTikTokMode}
              fillParent={isTikTokMode}
              onExitTop={exitTikTokToTop}
            />
          </div>
        </div>
      </section>
      
      <div className="h-20"></div>
    </div>
  )
}
