'use client'
import { useState, useEffect } from 'react'
import { MapPin, Bed, Bath, Square, Layers, Home, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SharePropertyView({ propertyCode }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showStreetView, setShowStreetView] = useState(false)
  const [showImageOverlay, setShowImageOverlay] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [images, setImages] = useState([])

  useEffect(() => {
    fetchProperty()
  }, [propertyCode])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('properties_database')
        .select('*')
        .eq('propertyCode', propertyCode)
        .single()

      if (error) throw error
      if (!data) throw new Error('Propiedad no encontrada')

      // Procesar imágenes
      let propertyImages = []
      
      if (data.multimedia) {
        try {
          const multimedia = typeof data.multimedia === 'string' 
            ? JSON.parse(data.multimedia) 
            : data.multimedia
          
          if (Array.isArray(multimedia)) {
            propertyImages = multimedia
          } else if (multimedia.images && Array.isArray(multimedia.images)) {
            propertyImages = multimedia.images.map(img => 
              typeof img === 'string' ? img : img.url
            ).filter(Boolean)
          }
        } catch (e) {
          console.error('Error parsing multimedia:', e)
        }
      }

      if (propertyImages.length === 0 && data.thumbnail) {
        propertyImages = [data.thumbnail]
      }

      if (propertyImages.length === 0) {
        propertyImages = ['https://via.placeholder.com/800x600/f0f0f0/666666?text=Sin+Imagen']
      }

      setImages(propertyImages)
      setProperty(data)
      
    } catch (err) {
      console.error('Error fetching property:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price) return 'Precio no disponible'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A23] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Home size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Propiedad no encontrada
          </h2>
          <p className="text-gray-500 mb-4">
            {error || 'No pudimos encontrar esta propiedad'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-[#0A0A23] text-white rounded-lg hover:bg-[#1A1A33]"
          >
            Ir a Luci
          </button>
        </div>
      </div>
    )
  }

  const latitude = property.latitude || property.lat || 40.4168
  const longitude = property.longitude || property.lng || -3.7038
  const address = property.address || `${property.neighborhood || ''}, ${property.municipality || 'Madrid'}`.trim()
  const description = property.description || 'No hay descripción disponible.'
  const shortDescription = description.length > 150 ? description.substring(0, 150) + '...' : description
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAf-L38UI3hGyYrMJjeFO0Ij2n1p1mCyMk&q=${latitude},${longitude}&zoom=16`

  return (
    <div className="min-h-screen bg-white">
      {/* Header fijo */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="Luci" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-semibold text-[#0A0A23]">Luci</h1>
              <p className="text-xs text-gray-500">Tu asistente inmobiliario</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/?propertyCode=' + propertyCode}
            className="px-4 py-2 bg-[#0A0A23] text-white rounded-lg hover:bg-[#1A1A33] transition-colors text-sm font-medium"
          >
            Prueba la App
          </button>
        </div>
      </div>

      {/* Galería de imágenes a pantalla completa */}
      <div className="relative h-72 bg-black">
        <img
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
        
        {/* Contador de imágenes */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1}/{images.length}
        </div>

        {/* Indicadores (bolitas) */}
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
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">
        {/* Título y precio */}
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A23] mb-3 leading-tight">
            {property.title || property.address || 'Propiedad en Madrid'}
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

        {/* Features en grid */}
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
            <p className="text-sm font-medium text-gray-700">{property.sqft || property.builtArea || 0}</p>
            <p className="text-xs text-gray-500">m²</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Layers size={24} className="mx-auto text-gray-600 mb-1" />
            <p className="text-sm font-medium text-gray-700">{property.height || property.floor || 'N/A'}</p>
            <p className="text-xs text-gray-500">planta</p>
          </div>
        </div>

        {/* Botón WhatsApp */}
        
          href={`https://wa.me/34910626648?text=${encodeURIComponent(
            `Hola! Quiero más información sobre el piso ${propertyCode}, en ${address}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"/>
          </svg>
          Contacta con ventas
        </a>

        {/* Descripción con leer más */}
        <div>
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

        {/* Ubicación */}
        <div>
          <h3 className="text-xl font-semibold text-[#0A0A23] mb-3">Ubicación</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <MapPin size={20} className="text-gray-500 mt-1 flex-shrink-0" />
              <p className="text-gray-700">{address}</p>
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
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-[#0A0A23] to-[#1A1A33] rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">¿Te interesa esta propiedad?</h3>
          <p className="mb-4 opacity-90">
            Habla con Luci para obtener más información y encontrar tu hogar ideal
          </p>
          <button
            onClick={() => window.location.href = '/?propertyCode=' + propertyCode}
            className="bg-white text-[#0A0A23] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Chatear con Luci
          </button>
        </div>
      </div>

      {/* Street View Modal */}
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

      {/* Image Overlay (Zoom) */}
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
    </div>
  )
}
