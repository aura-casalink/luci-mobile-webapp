'use client'
import { Heart, Share2, MapPin, Bed, Bath, Square } from 'lucide-react'

export default function PropertyResults({ properties, onPropertyClick, savedProperties, onToggleSave }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleShare = async (property, e) => {
    e.stopPropagation()
    const propertyCode = property.propertyCode || property.property_id || property.id
    const shareUrl = `https://luci.aura-app.es/share/${propertyCode}`
    const text = `${property.title} - ${formatPrice(property.price)}`
    
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
      alert('Enlace copiado al portapapeles')
    }
  }

  const handleLike = (property, e) => {
    e.stopPropagation()
    const propertyId = property.property_id || property.propertyCode
    onToggleSave && onToggleSave(propertyId)
  }

  if (!properties || properties.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-50 py-4">
      <div className="px-4 mb-3">
        <p className="text-sm text-gray-600">
          {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} encontrada{properties.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-4 px-4" style={{ width: 'max-content' }}>
          {properties.map((property, index) => {
            const propertyId = property.property_id || property.propertyCode
            const isLiked = savedProperties?.has(propertyId)
            
            return (
              <div
                key={propertyId || index}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 relative"
                style={{ width: '280px', height: '200px' }}
                onClick={() => onPropertyClick(property)}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.3)), url(${property.thumbnail || property.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI4MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgNjBIMTQwVjcwSDEzMFY2MFpNMTQwIDcwSDE1MFY4MEgxNDBWNzBaTTEyMCA3MEgxMzBWODBIMTIwVjcwWk0xMTAgODBIMTIwVjkwSDExMFY4MFpNMTUwIDgwSDE2MFY5MEgxNTBWODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPlByb3BpZWRhZDwvdGV4dD4KPHN2Zz4K'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      onClick={(e) => handleShare(property, e)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                      style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
                    >
                      <Share2 size={16} className="text-[#0A0A23]" strokeWidth={2} />
                    </button>
                    
                    <button
                      onClick={(e) => handleLike(property, e)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                      style={{ backgroundColor: 'rgba(250, 250, 250, 0.75)' }}
                    >
                      <Heart
                        size={16}
                        className={isLiked ? "text-[#FFB300] fill-[#FFB300]" : "text-gray-600"}
                        fill={isLiked ? "#FFB300" : "none"}
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-semibold mb-1 line-clamp-2 text-shadow">
                      {property.title}
                    </h3>
                    <p className="text-white text-xl font-bold text-shadow">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <style jsx>{`
        .text-shadow {
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  )
}
