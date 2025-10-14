'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Heart, Share2, MapPin, Bed, Bath, Square, Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import { getStreetViewUrl } from '@/lib/maps'
import PricingModal from '@/app/components/pricing/PricingModal'

export default function PropertyDetailView({ property, onClose, onSendMessage, savedProperties, onToggleSave, onStreetViewChange }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [inputText, setInputText] = useState('')
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showImageOverlay, setShowImageOverlay] = useState(false)
  const imageRef = useRef(null)
  const [showStreetView, setShowStreetView] = useState(false)
  const [images, setImages] = useState([])
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    if (onStreetViewChange) {
      onStreetViewChange(showStreetView)
    }
  }, [showStreetView, onStreetViewChange])

  useEffect(() => {
    const extractImages = () => {
      const imageList = []
      
      if (property.images && Array.isArray(property.images)) {
        property.images.forEach(url => {
          if (url && !imageList.includes(url)) {
            imageList.push(url)
          }
        })
      }
      
      if (imageList.length === 0 && property.thumbnail) {
        imageList.push(property.thumbnail)
      }
      
      if (imageList.length === 0) {
        imageList.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5Qcm9waWVkYWQ8L3RleHQ+PC9zdmc+')
      }
      
      return imageList
    }

    setImages(extractImages())
  }, [property])

  useEffect(() => {
    // Detectar si debe reabrir el modal de precios después del login
    const shouldReopenPricing = sessionStorage.getItem('return_to_pricing_modal')
    if (shouldReopenPricing === 'true') {
      sessionStorage.removeItem('return_to_pricing_modal')
      // Pequeño delay para que se cargue todo antes de abrir el modal
      setTimeout(() => {
        setShowPricing(true)
      }, 500)
    }
  }, [])
    
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleShare = () => {
    const text = `${property.title} - ${formatPrice(property.price)}`
    const propertyCode = property.propertyCode || property.property_id || property.id
    const shareUrl = `https://luci.aura-app.es/share/${propertyCode}`
  
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: text,
        url: shareUrl
      }).catch(err => {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      })
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} - ${shareUrl}`)
      alert('Enlace copiado al portapapeles')
    }
  }

  const handleSendPropertyMessage = () => {
    if (!inputText.trim()) return
    
    const message = `Sobre "${property.title}": ${inputText}`
    onSendMessage(message)
    setInputText('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendPropertyMessage()
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageClick = () => {
    setShowImageOverlay(true)
  }

  const address = property.address || `${property.neighborhood}, ${property.municipality}`
  const isSaved = savedProperties && savedProperties.has(property.property_id || property.propertyCode)
  const description = property.description || 'No hay descripción disponible.'
  const shortDescription = description.length > 150 ? description.substring(0, 150) + '...' : description

  const latitude = property.latitude || property.lat || 40.4168
  const longitude = property.longitude || property.lng || -3.7038
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAf-L38UI3hGyYrMJjeFO0Ij2n1p1mCyMk&q=${latitude},${longitude}&zoom=16`

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="relative">
          <div className="relative h-72 transition-all duration-300 overflow-hidden bg-black">
            <img
              ref={imageRef}
              src={images[currentImageIndex]}
              alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleImageClick}
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1}/{images.length}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => {
                  const propertyId = property.property_id || property.propertyCode
                  onToggleSave && onToggleSave(propertyId)
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
              >
                <Heart 
                  size={22} 
                  className={isSaved ? 'text-[#FFB300] fill-[#FFB300]' : 'text-[#0A0A23]'}
                  fill={isSaved ? '#FFB300' : 'none'}
                  strokeWidth={2}
                />
              </button>
              
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
              >
                <Share2 size={22} className="text-[#0A0A23]" strokeWidth={2} />
              </button>

              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
              >
                <X size={22} className="text-[#0A0A23]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0A0A23] mb-3 leading-tight">
              {property.title}
            </h1>
            <p className="text-2xl font-bold text-[#0A0A23] mb-1">
              {formatPrice(property.price)}
            </p>
            {property.pricePerSqm && (
              <p className="text-sm text-gray-500">
                {property.pricePerSqm}€/m²
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Bed size={24} className="mx-auto text-gray-600 mb-1" />
              <p className="text-sm font-medium text-gray-700">{property.bedrooms || 0}</p>
              <p className="text-xs text-gray-500">hab</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Bath size={24} className="mx-auto text-gray-600 mb-1" />
              <p className="text-sm font-medium text-gray-700">{property.bathrooms || 0}</p>
              <p className="text-xs text-gray-500">baños</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Square size={24} className="mx-auto text-gray-600 mb-1" />
              <p className="text-sm font-medium text-gray-700">{property.builtArea || property.usefulArea || 0}</p>
              <p className="text-xs text-gray-500">m²</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Layers size={24} className="mx-auto text-gray-600 mb-1" />
              <p className="text-sm font-medium text-gray-700">{property.height || property.floor || 'N/A'}</p>
              <p className="text-xs text-gray-500">planta</p>
            </div>
          </div>

          <div>
            {/* Botón "Me interesa" - NUEVO */}
            <button
              onClick={() => setShowPricing(true)}
              className="w-full py-3 px-4 rounded-lg font-bold mb-6 transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#FFB300',
                color: '#FAFAFA',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Me interesa
            </button>

            <h3 className="text-xl font-semibold text-[#0A0A23] mb-3">Descripción</h3>
            <div className="text-gray-700 leading-relaxed">
              <p>{showFullDescription ? description : shortDescription}</p>
              {description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-[#0A0A23] font-bold mt-2 hover:text-gray-700 transition-colors underline"
                >
                  {showFullDescription ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#0A0A23] mb-3">Ubicación</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin size={20} className="text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700">{property.neighborhood ? `${property.neighborhood}, ${property.municipality || 'Madrid'}` : address}</p>
              </div>
              
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Botón "Ver Street View" */}
              <button
                onClick={() => setShowStreetView(true)}
                className="w-full flex items-center justify-center p-4 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: '#0A0A23' }}
              >
                <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="4" r="2" fill="currentColor"/>
                  <path d="M12 6L12 14" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 9L9 11" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 11L15 9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14L9 20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14L15 20" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Ver Street View
              </button>

              {/* Botón "Contacta con ventas" - MOVIDO AQUÍ */}
              <a
                href={`https://wa.me/34910626648?text=${encodeURIComponent(
                  `Hola! Estoy interesado en esta propiedad: https://luci.aura-app.es/share/${property.propertyCode || property.property_id || property.id}. ¿Me podrías dar más información?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
                </svg>
                Contacta con ventas
              </a>
            </div>
          </div>
        </div>

        <div className="h-24"></div>
      </div>

      <div className="absolute bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 z-[80]">
        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="¿Alguna pregunta sobre esta propiedad?"
            className="flex-1 bg-transparent px-4 py-2 outline-none text-[#0A0A23] placeholder-gray-500 text-sm"
          />
          <button
            onClick={handleSendPropertyMessage}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full text-white flex items-center justify-center transition-colors"
            style={{ backgroundColor: inputText.trim() ? '#0A0A23' : '#D8D8E0' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L12 22M12 2L5 9M12 2L19 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {showStreetView && (
        <div className="fixed inset-0 z-[95] bg-black flex flex-col">
          <div className="flex-shrink-0 h-16 bg-black/90 flex items-center justify-between px-4">
            <div className="text-white font-medium">Street View</div>
            <button
              onClick={() => setShowStreetView(false)}
              className="w-10 h-10 rounded-full bg-white text-[#0A0A23] flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1">
            <iframe
              src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyAf-L38UI3hGyYrMJjeFO0Ij2n1p1mCyMk&location=${latitude},${longitude}&heading=0&pitch=0&fov=90`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="accelerometer; gyroscope; web-share"
            />
          </div>
        </div>
      )}

      {showImageOverlay && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
          <button
            onClick={() => setShowImageOverlay(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[currentImageIndex]}
              alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1}/{images.length}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Planes de Precios */}
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} property={property} />
    </div>
  )
}
