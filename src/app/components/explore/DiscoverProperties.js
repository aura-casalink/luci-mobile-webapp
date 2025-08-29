'use client'
import { useState, useEffect, useRef } from 'react'
import { Heart, Share2, MapPin, Home, Bath, Maximize } from 'lucide-react'
import { useDiscoverProperties } from '../../hooks/useDiscoverProperties'

export default function DiscoverProperties({
  sessionId,
  savedProperties,
  onToggleSave,
  onPropertyClick,
  currentIndex = 0,
  onCurrentIndexChange,
  isFullscreen = false,
  fillParent = false,
  onExitTop
}) {
  const { properties, loading, error } = useDiscoverProperties(sessionId)
  
  // Swipe móvil
  const touchStartY = useRef(null)
  const touchBlocked = useRef(false)
  const SWIPE_THRESHOLD = 60

  const formatPrice = (price) => {
    if (!price) return 'Precio no disponible'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getPropertyImage = (property) => {
    if (property.thumbnail) return property.thumbnail
    if (property.multimedia && Array.isArray(property.multimedia) && property.multimedia.length > 0) {
      return property.multimedia[0]
    }
    return 'https://via.placeholder.com/400x600/f0f0f0/666666?text=Sin+Imagen'
  }

  const handleShare = async (property) => {
    const text = `${property.title || 'Propiedad'} - ${formatPrice(property.price)}`
    const propertyCode = property.propertyCode || property.property_id || property.id
    const shareUrl = `https://luci.aura-app.es/share/${propertyCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title || 'Propiedad',
          text: text,
          url: shareUrl
        })
      } catch (err) {}
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} - ${shareUrl}`)
    }
  }

  const handleLike = (property) => {
    onToggleSave && onToggleSave(property.propertyCode || property.id)
  }

  const onTouchStart = (e) => {
    touchBlocked.current = false
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchMove = (e) => {
    if (isFullscreen) e.preventDefault()
  }

  const onTouchEnd = (e) => {
    if (touchBlocked.current || touchStartY.current == null) return
    
    const endY = e.changedTouches[0].clientY
    const delta = endY - touchStartY.current
    
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    
    if (delta < 0) {
      // Swipe up -> siguiente
      const nextIndex = currentIndex + 1
      
      // Bloquear después de 3 (índice 0-3 = 4 propiedades)
      if (nextIndex > 3 && !window.currentUser) {
        window.requireAuth?.(
          'Regístrate para ver todas las propiedades disponibles',
          () => onCurrentIndexChange && onCurrentIndexChange(nextIndex)
        )
      } else {
        onCurrentIndexChange && onCurrentIndexChange(nextIndex)
      }
    } else {
      // Swipe down -> anterior o salir
      if (currentIndex > 0) {
        onCurrentIndexChange && onCurrentIndexChange(currentIndex - 1)
      } else {
        onExitTop && onExitTop()
      }
    }
    touchStartY.current = null
  }

  if (loading) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A0A23]"></div>
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600 text-center px-4">Usa primero el chat para ver propiedades personalizadas para ti</p>
      </div>
    )
  }

  // SIEMPRE mostrar SOLO LA PROPIEDAD ACTUAL
  const property = properties[currentIndex % properties.length]
  const isLiked = savedProperties?.has(property.propertyCode || property.id)
  
  // Padding reducido para maximizar el tamaño de la tarjeta
  const outerPadding = isFullscreen ? 6 : 0
  
  // Altura calculada correctamente
  const cardHeight = isFullscreen
    ? (fillParent 
        ? `calc(100% - ${outerPadding * 2}px)` 
        : `calc(100dvh - var(--top-nav-height) - var(--bottom-nav-height) - var(--discover-title-height) - env(safe-area-inset-bottom) - ${outerPadding * 2}px)`)
    : '420px'

  return (
    <div
      className="relative w-full h-full"
      style={{ padding: isFullscreen ? `${outerPadding}px 8px` : '0px' }}
    >
      <div
        className="relative bg-black rounded-2xl overflow-hidden cursor-pointer"
        style={{ height: cardHeight, width: '100%' }}
        onClick={() => {
          if (onPropertyClick) {
            let propertyWithImages = {...property}
            
            // Recopilar todas las imágenes posibles
            const allImages = []
            
            // De multimedia
            if (property.multimedia?.images) {
              property.multimedia.images.forEach(img => {
                if (img?.url) allImages.push(img.url)
                else if (typeof img === 'string') allImages.push(img)
              })
            } else if (Array.isArray(property.multimedia)) {
              allImages.push(...property.multimedia.filter(Boolean))
            }
            
            // De images directamente
            if (Array.isArray(property.images)) {
              allImages.push(...property.images.filter(Boolean))
            }
            
            // De photos
            if (Array.isArray(property.photos)) {
              property.photos.forEach(photo => {
                if (typeof photo === 'string') allImages.push(photo)
                else if (photo?.url) allImages.push(photo.url)
              })
            }
            
            // Thumbnail como respaldo
            if (property.thumbnail) allImages.push(property.thumbnail)
            
            // Eliminar duplicados y asignar
            propertyWithImages.images = [...new Set(allImages)].slice(0, 15)
            
            onPropertyClick(propertyWithImages)
          }
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${getPropertyImage(property)})`,
          }}
        />

        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleShare(property)
            }}
            className="bg-white/20 backdrop-blur p-3 rounded-full"
          >
            <Share2 size={20} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLike(property)
            }}
            className="bg-white/20 backdrop-blur p-3 rounded-full"
          >
            <Heart 
              size={20} 
              className={isLiked ? "text-[#FFB300] fill-[#FFB300]" : "text-white"}
            />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">
              {property.title || property.subtitle || 'Propiedad'}
            </h3>
            
            {property.neighborhood && (
              <p className="text-base opacity-90 mb-3 flex items-center">
                <MapPin size={16} className="mr-2" />
                {property.neighborhood}
              </p>
            )}

            <p className="text-3xl font-bold mb-3">
              {formatPrice(property.price)}
            </p>

            <div className="flex items-center space-x-6">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Home size={16} className="mr-2" />
                  <span>{property.bedrooms} hab</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath size={16} className="mr-2" />
                  <span>{property.bathrooms} baños</span>
                </div>
              )}
              {property.sqft && (
                <div className="flex items-center">
                  <Maximize size={16} className="mr-2" />
                  <span>{property.sqft} m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
