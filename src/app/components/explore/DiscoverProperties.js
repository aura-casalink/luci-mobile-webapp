'use client'
import { useState, useEffect } from 'react'
import { Heart, Share2, MapPin, Home, Bath, Maximize } from 'lucide-react'
import { useDiscoverProperties } from '../../hooks/useDiscoverProperties'

export default function DiscoverProperties({ 
  sessionId, 
  savedProperties, 
  onToggleSave, 
  onPropertyClick,
  isFullscreen,
  currentIndex,
  onCurrentIndexChange
}) {
  const { properties, loading, error } = useDiscoverProperties(sessionId)

  useEffect(() => {
    if (properties.length > 0 && currentIndex >= properties.length) {
      onCurrentIndexChange(properties.length - 1)
    }
  }, [properties.length, currentIndex, onCurrentIndexChange])

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
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} - ${window.location.href}`)
      alert('Enlace copiado al portapapeles')
    }
  }

  const handleLike = (property) => {
    onToggleSave && onToggleSave(property.propertyCode || property.id)
  }

  if (loading) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A0A23] mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando propiedades...</p>
        </div>
      </div>
    )
  }

  if (error || !properties || properties.length === 0) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center px-6">
          <Home size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 text-xl font-semibold mb-3">
            ¡Aún no tienes propiedades que descubrir!
          </p>
          <p className="text-gray-600 mb-4">
            Para ver propiedades aquí, primero necesitas buscar en el chat.
          </p>
        </div>
      </div>
    )
  }

  // MODO TIKTOK - Solo mostrar UNA propiedad
  if (isFullscreen) {
    const currentProperty = properties[currentIndex % properties.length]
    const isLiked = savedProperties?.has(currentProperty.propertyCode || currentProperty.id)
    
    return (
      <div 
        className="relative bg-black rounded-lg overflow-hidden cursor-pointer"
        style={{ height: 'calc(100vh - 200px)' }}
        onClick={() => {
          if (onPropertyClick) {
            let propertyWithImages = {...currentProperty}
            if (currentProperty.multimedia) {
              try {
                if (currentProperty.multimedia.images) {
                  propertyWithImages.images = currentProperty.multimedia.images
                    .map(item => item.url)
                    .filter(Boolean)
                    .slice(0, 15)
                }
              } catch (e) {}
            }
            
            if (!propertyWithImages.images || propertyWithImages.images.length === 0) {
              propertyWithImages.images = [currentProperty.thumbnail]
            }
            
            onPropertyClick(propertyWithImages)
          }
        }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${getPropertyImage(currentProperty)})`,
          }}
        />

        {/* Botones de acción */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleShare(currentProperty)
            }}
            className="bg-white/20 backdrop-blur p-3 rounded-full"
          >
            <Share2 size={20} className="text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLike(currentProperty)
            }}
            className="bg-white/20 backdrop-blur p-3 rounded-full"
          >
            <Heart 
              size={20} 
              className={isLiked ? "text-[#FFB300] fill-[#FFB300]" : "text-white"}
              fill={isLiked ? "#FFB300" : "none"}
            />
          </button>
        </div>

        {/* Info de la propiedad */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2">
              {currentProperty.title || currentProperty.subtitle || 'Propiedad sin título'}
            </h3>
            
            {currentProperty.neighborhood && (
              <p className="text-base opacity-90 mb-3 flex items-center">
                <MapPin size={16} className="mr-2" />
                {currentProperty.neighborhood}
              </p>
            )}

            <p className="text-3xl font-bold mb-3">
              {formatPrice(currentProperty.price)}
            </p>

            <div className="flex items-center space-x-6 text-base">
              {currentProperty.bedrooms && (
                <div className="flex items-center">
                  <Home size={16} className="mr-2" />
                  <span>{currentProperty.bedrooms} hab</span>
                </div>
              )}
              {currentProperty.bathrooms && (
                <div className="flex items-center">
                  <Bath size={16} className="mr-2" />
                  <span>{currentProperty.bathrooms} baños</span>
                </div>
              )}
              {currentProperty.sqft && (
                <div className="flex items-center">
                  <Maximize size={16} className="mr-2" />
                  <span>{currentProperty.sqft} m²</span>
                </div>
              )}
            </div>

            <p className="text-sm opacity-75 text-center mt-4">
              Toca para ver más detalles
            </p>
          </div>
        </div>
      </div>
    )
  }

  // MODO NORMAL - Mostrar todas las propiedades
  return (
    <div className="space-y-4">
      {properties.map((property, index) => {
        const isPropertyLiked = savedProperties?.has(property.propertyCode || property.id)
        
        return (
          <div 
            key={property.id || index}
            className="relative bg-black rounded-lg overflow-hidden cursor-pointer"
            style={{ height: 'calc(100vh - 240px)' }}
            onClick={() => {
              if (onPropertyClick) {
                let propertyWithImages = {...property}
                if (property.multimedia) {
                  try {
                    if (property.multimedia.images) {
                      propertyWithImages.images = property.multimedia.images
                        .map(item => item.url)
                        .filter(Boolean)
                        .slice(0, 15)
                    }
                  } catch (e) {}
                }
                
                if (!propertyWithImages.images || propertyWithImages.images.length === 0) {
                  propertyWithImages.images = [property.thumbnail]
                }
                
                onPropertyClick(propertyWithImages)
              }
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${getPropertyImage(property)})`,
              }}
            />

            {/* Botones de acción */}
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
                  className={isPropertyLiked ? "text-[#FFB300] fill-[#FFB300]" : "text-white"}
                  fill={isPropertyLiked ? "#FFB300" : "none"}
                />
              </button>
            </div>

            {/* Info de la propiedad */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {property.title || property.subtitle || 'Propiedad sin título'}
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

                <div className="flex items-center space-x-6 text-base">
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

                <p className="text-sm opacity-75 text-center mt-4">
                  Toca para ver más detalles
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
