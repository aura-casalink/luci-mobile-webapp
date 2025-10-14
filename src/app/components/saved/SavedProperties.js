'use client'
import { useRouter } from 'next/navigation'
import { Heart, Share2, MapPin, Bed, Bath, Square } from 'lucide-react'

export default function SavedProperties({ savedPropertiesList, savedProperties, onToggleSave, onSendMessage }) {
  const router = useRouter()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleShare = async (property) => {
    const text = `${property.title} - ${formatPrice(property.price)}`
    const propertyCode = property.propertyCode || property.property_id || property.id
    const shareUrl = `https://luci.aura-app.es/property/${propertyCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: text,
          url: shareUrl
        })
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} - ${shareUrl}`)
      alert("Enlace copiado al portapapeles")
    }
  }

  const handlePropertyClick = (property) => {
    const propertyCode = property.propertyCode || property.property_id || property.id
    // Guardar la ruta actual como origen
    sessionStorage.setItem('property_return_to', '/saved')
    router.push(`/property/${propertyCode}`)
  }

  if (!savedPropertiesList || savedPropertiesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Heart size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-[#0A0A23] mb-2">
          No tienes propiedades guardadas
        </h3>
        <p className="text-gray-600 mb-6">
          Cuando encuentres propiedades que te gusten, guárdalas tocando el corazón
        </p>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          {savedPropertiesList.length} propiedad{savedPropertiesList.length !== 1 ? 'es' : ''} guardada{savedPropertiesList.length !== 1 ? 's' : ''}
        </p>
        
        <div className="space-y-4">
          {savedPropertiesList.map((property, index) => (
            <div
              key={property.property_id || property.propertyCode || index}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePropertyClick(property)}
            >
              <div className="relative h-48">
                <img
                  src={property.thumbnail || property.images?.[0] || '/placeholder-property.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEg5M1Y1NEg4N1Y0OFpNOTMgNTRIOTlWNjBIOTNWNTRaTTgxIDU0SDg3VjYwSDgxVjU0Wk03NSA2MEg4MVY2Nkg3NVY2MFpNOTkgNjBIMTA1VjY2SDk5VjYwWk0xMDUgNTRIMTExVjYwSDEwNVY1NFpNMTExIDQ4SDExN1Y1NEgxMTFWNDhaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+UHJvcGllZGFkPC90ZXh0Pgo8L3N2Zz4K'
                  }}
                />
                
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(property)
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                    style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
                  >
                    <Share2 size={18} className="text-[#0A0A23]" strokeWidth={2} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const propertyId = property.property_id || property.propertyCode
                      onToggleSave && onToggleSave(propertyId)
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                    style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
                  >
                    <Heart
                      size={18}
                      className="text-[#FFB300] fill-[#FFB300]"
                      fill="#FFB300"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#0A0A23] mb-2 line-clamp-2">
                  {property.title || property.address}
                </h3>
                
                <p className="text-xl font-bold text-[#0A0A23] mb-3">
                  {formatPrice(property.price)}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <Bed size={16} className="mr-1" />
                    <span>{property.bedrooms || 0} hab</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Bath size={16} className="mr-1" />
                    <span>{property.bathrooms || 0} baños</span>
                  </div>
                  <div className="flex items-center">
                    <Square size={16} className="mr-1" />
                    <span>{property.builtArea || property.usefulArea || 0} m²</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={14} className="mr-1" />
                  <span className="truncate">
                    {property.neighborhood || property.municipality}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
