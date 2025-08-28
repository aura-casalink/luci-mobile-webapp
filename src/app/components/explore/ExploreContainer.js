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
  const [isExiting, setIsExiting] = useState(false)
  const discoverRef = useRef(null)
  const beforeDiscoverRef = useRef(null)
  const wheelHandlerRef = useRef(null)
  const touchPreventRef = useRef(null)
  const ioCooldownRef = useRef(0)
  const { getPropertyDetails } = useExploreProperties()

  const unlockScroll = () => {
    if (wheelHandlerRef.current) window.removeEventListener('wheel', wheelHandlerRef.current)
    if (touchPreventRef.current) window.removeEventListener('touchmove', touchPreventRef.current)
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.documentElement.style.overscrollBehaviorY = ''
    document.body.style.overscrollBehaviorY = ''
  }
  
  const handlePropertyClick = (property) => {
    // Desbloquear scroll al abrir
    unlockScroll()
    setIsTikTokMode(false)
    ioCooldownRef.current = Date.now() + 800
    
    const pid = property?.propertyCode || property?.id || property?.propertyId
    const fullProperty = pid ? getPropertyDetails(pid) : null
    setSelectedProperty(fullProperty || property)
  }

  const exitTikTokToTop = () => {
    // 1) Congelar el alto visual mientras salimos
    setIsExiting(true)
    
    // 2) Desactivar el modo sticky y resetear índice
    setIsTikTokMode(false)
    setDiscoverCurrentIndex(0)
  
    // 3) Quitar listeners inmediatamente
    if (wheelHandlerRef.current) window.removeEventListener('wheel', wheelHandlerRef.current)
    if (touchPreventRef.current) window.removeEventListener('touchmove', touchPreventRef.current)
  
    // 4) Desbloquear scroll del body
    unlockScroll()
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.documentElement.style.overscrollBehaviorY = ''
    document.body.style.overscrollBehaviorY = ''
  
    // 5) Evitar reenganche inmediato del IntersectionObserver
    ioCooldownRef.current = Date.now() + 800
  
    // 6) Hacer scroll después de que React quite el sticky
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const topNav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top-nav-height')) || 64
        const el = beforeDiscoverRef.current
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - topNav - 12
          window.scrollTo({ top: y, behavior: 'smooth' })
        } else {
          window.scrollBy({ top: -400, behavior: 'smooth' })
        }
        
        // 7) Liberar el estado visual después del scroll
        setTimeout(() => setIsExiting(false), 500)
      })
    })
  }

  // Detectar cuando llegar a la sección con IntersectionObserver
  useEffect(() => {
    if (!discoverRef.current) return
    
    const el = discoverRef.current
    const io = new IntersectionObserver(
      ([entry]) => {
        // No activar durante el cooldown
        if (Date.now() < ioCooldownRef.current) return
        
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
    wheelHandlerRef.current = handleWheel

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
    touchPreventRef.current = prevent
    
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
        onClose={() => {
          setSelectedProperty(null)
          unlockScroll()
          ioCooldownRef.current = Date.now() + 200
          
          // Reactivar TikTok si estamos en la sección
          requestAnimationFrame(() => {
            const el = discoverRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              setIsTikTokMode(true)
              el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          })
        }}
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
          className={`${(isTikTokMode || isExiting) ? 'sticky z-30 bg-white' : ''}`}
          style={
            (isTikTokMode || isExiting)
              ? {
                  top: 'var(--top-nav-height)',
                  overscrollBehaviorY: 'contain',
                  height: 'calc(100dvh - var(--top-nav-height) - var(--bottom-nav-height) - env(safe-area-inset-bottom))',
                  display: 'flex',
                  flexDirection: 'column'
                }
              : {}
          }
        >
          {/* Header dentro del bloque */}
          <div
            className="px-4 pb-3 pt-2"
            style={(isTikTokMode || isExiting) ? { 
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
          <div style={(isTikTokMode || isExiting) ? { flex: '1 1 auto', minHeight: 0, overflow: 'hidden' } : {}}>
            <DiscoverProperties
              sessionId={sessionId}
              savedProperties={savedProperties}
              onToggleSave={onToggleSave}
              onPropertyClick={handlePropertyClick}
              currentIndex={discoverCurrentIndex}
              onCurrentIndexChange={setDiscoverCurrentIndex}
              isFullscreen={isTikTokMode || isExiting} 
              fillParent={isTikTokMode || isExiting} 
              onExitTop={exitTikTokToTop}
            />
          </div>
        </div>
      </section>
      
      <div className="h-20"></div>
    </div>
  )
}
