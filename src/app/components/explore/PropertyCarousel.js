'use client'
import { Heart, Share2 } from 'lucide-react'

export default function PropertyCarousel({ savedProperties, onToggleSave, onPropertyClick }) {
  // IDs de propiedades hardcodeadas
  const properties = [
    { id: 1, title: "Ático en la Calle San Bernardo", price: 1480000, thumbnail: "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027" },
    { id: 2, title: "Piso en venta en avenida de la Marina, 5", price: 332000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp" },
    { id: 3, title: "Piso en venta en Av Puerto Sotogrande", price: 489000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp" },
    { id: 4, title: "Chalet adosado en avenida Pernet", price: 459000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp" },
    { id: 5, title: "Piso en calle Sierra Cazorla", price: 849000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp" },
    { id: 6, title: "Estudio en venta en Retiro", price: 320000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp" },
    { id: 7, title: "Piso en venta en Malasaña", price: 550000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp" },
    { id: 8, title: "Piso en venta en Chueca", price: 680000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp" },
    { id: 9, title: "Piso en venta en Lavapiés", price: 395000, thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp" }
  ]

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleShare = async (property, e) => {
    e.stopPropagation()
    const text = `${property.title} - ${formatPrice(property.price)}`
    const propertyCode = property.propertyCode || property.property_id || property.id
    const shareUrl = `${window.location.origin}/share/${propertyCode}`
    
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
    onToggleSave && onToggleSave(property.id)
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-4 px-4" style={{ width: 'max-content' }}>
        {properties.map((property) => {
          const isLiked = savedProperties?.has(property.id)
          
          return (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 relative"
              style={{ width: '280px', height: '200px' }}
              onClick={() => onPropertyClick(property)}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.3)), url(${property.thumbnail})`,
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
      
      <style jsx>{`
        .text-shadow {
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  )
}
