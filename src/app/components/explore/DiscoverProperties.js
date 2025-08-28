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
  isFullscreen = false
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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title || 'Propiedad',
          text: text,
          url: window.location.href
        })
      } catch (err) {}
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} - ${window.location.href}`)
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
      onCurrentIndexChange && onCurrentIndexChange(currentIndex + 1)
    } else {
      // Swipe down -> anterior
      if (currentIndex > 0) {
        onCurrentIndexChange && onCurrentIndexChange(currentIndex - 1)
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
        <p className="text-gray-600">No hay propiedades disponibles</p>
      </div>
    )
  }

  // SIEMPRE mostrar SOLO LA PROPIEDAD ACTUAL
  const property = properties[currentIndex % properties.length]
  const isLiked = savedProperties?.has(property.propertyCode || property.id)
  
  const cardHeight = isFullscreen
    ? 'calc(100dvh - var(--top-nav-height) - var(--discover-title-height))'
    : '420px'

  return (
    <div
      className="relative bg-black rounded-2xl overflow-hidden cursor-pointer"
      style={{ height: cardHeight }}
      onClick={() => onPropertyClick && onPropertyClick(property)}
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
          </div>
        </div>
      </div>
    </div>
  )
}
