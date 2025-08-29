'use client'
import { useState, useEffect } from 'react'
import { MapPin, Bed, Bath, Square, Home, ChevronLeft, ChevronRight, Layers, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SharePropertyView({ propertyCode }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showStreetView, setShowStreetView] = useState(false)
  const [images, setImages] = useState([])

  useEffect(() => {
    fetchProperty()
  }, [propertyCode])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      
      // Buscar propiedad en Supabase
      const { data, error } = await supabase
        .from('properties_database')
        .select('*')
        .eq('propertyCode', propertyCode)
        .single()

      if (error) throw error
      if (!data) throw new Error('Propiedad no encontrada')

      // Procesar imágenes
      let propertyImages = []
      
      // Intentar obtener imágenes del campo multimedia
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

      // Si no hay imágenes, usar thumbnail
      if (propertyImages.length === 0 && data.thumbnail) {
        propertyImages = [data.thumbnail]
      }

      // Si aún no hay imágenes, placeholder
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

  const handleOpenInApp = () => {
    // Redirigir a la app principal con el propertyCode
    window.location.href = `/?propertyCode=${propertyCode}`
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

  const latitude = property.latitude || 40.4168
  const longitude = property.longitude || -3.7038

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="Luci" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-semibold text-[#0A0A23]">Luci</h1>
              <p className="text-xs text-gray-500">Tu asistente inmobiliario</p>
            </div>
          </div>
          <button
            onClick={handleOpenInApp}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0A0A23] text-white rounded-lg hover:bg-[#1A1A33] transition-colors"
          >
            <ExternalLink size={16} />
            <span className="text-sm font-medium">Abrir en App</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Galería de imágenes */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ height: '400px' }}>
          <img
            src={images[currentImageIndex]}
            alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Información de la propiedad */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-[#0A0A23] mb-2">
            {property.title || property.address || 'Propiedad en Madrid'}
          </h2>
          
          <p className="text-3xl font-bold text-[#0A0A23] mb-4">
            {formatPrice(property.price)}
          </p>

          <div className="flex items-center text-gray-600 mb-4">
            <MapPin size={18} className="mr-2" />
            <span>
              {property.neighborhood && `${property.neighborhood}, `}
              {property.municipality || 'Madrid'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
            <div className="text-center">
              <Bed className="w-6 h-6 mx-auto mb-1 text-gray-500" />
              <p className="text-lg font-semibold">{property.bedrooms || 0}</p>
              <p className="text-sm text-gray-500">Habitaciones</p>
            </div>
            <div className="text-center">
              <Bath className="w-6 h-6 mx-auto mb-1 text-gray-500" />
              <p className="text-lg font-semibold">{property.bathrooms || 0}</p>
              <p className="text-sm text-gray-500">Baños</p>
            </div>
            <div className="text-center">
              <Square className="w-6 h-6 mx-auto mb-1 text-gray-500" />
              <p className="text-lg font-semibold">{property.sqft || property.builtArea || 0}</p>
              <p className="text-sm text-gray-500">m²</p>
            </div>
          </div>

          {property.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#0A0A23] mb-3">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}
        </div>

        {/* Street View */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0A0A23]">Vista de la calle</h3>
            <button
              onClick={() => setShowStreetView(!showStreetView)}
              className="flex items-center space-x-2 text-[#0A0A23] hover:text-[#1A1A33]"
            >
              <Layers size={18} />
              <span className="text-sm">{showStreetView ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>
          
          {showStreetView && (
            <div className="rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <iframe
                src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyAf-L38UI3hGyYrMJjeFO0Ij2n1p1mCyMk&location=${latitude},${longitude}&heading=0&pitch=0&fov=90`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-[#0A0A23] to-[#1A1A33] rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">¿Te interesa esta propiedad?</h3>
          <p className="mb-4 opacity-90">
            Habla con Luci para obtener más información y encontrar tu hogar ideal
          </p>
          <button
            onClick={handleOpenInApp}
            className="bg-white text-[#0A0A23] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Chatear con Luci
          </button>
        </div>
      </div>
    </div>
  )
}
