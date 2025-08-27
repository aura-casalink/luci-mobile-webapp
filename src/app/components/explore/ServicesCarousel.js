'use client'
import { useState } from 'react'
import { CreditCard, Wrench, FileText, CheckCircle, Zap, Truck, X } from 'lucide-react'

export default function ServicesCarousel() {
  const [showOverlay, setShowOverlay] = useState(false)

  const services = [
    { id: 1, name: "Financiación", icon: CreditCard, description: "Te ayudamos con tu hipoteca" },
    { id: 2, name: "Reforma", icon: Wrench, description: "Renovamos tu hogar" },
    { id: 3, name: "Tasación", icon: FileText, description: "Valoramos tu propiedad" },
    { id: 4, name: "Auditorías", icon: CheckCircle, description: "Revisión completa" },
    { id: 5, name: "Gestión de suministros", icon: Zap, description: "Gestionamos alta/baja servicios" },
    { id: 6, name: "Mudanzas", icon: Truck, description: "Servicio de mudanza completo" }
  ]

  const handleServiceClick = (service) => {
    setShowOverlay(true)
  }

  const handleWhatsAppContact = () => {
    const phoneNumber = "34910626648"
    const message = encodeURIComponent("Hola, me interesa conocer más sobre sus servicios.")
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    setShowOverlay(false)
  }

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-4 pb-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex-shrink-0 w-44 bg-white rounded-lg shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleServiceClick(service)}
            >
              <div className="flex flex-col items-center text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#0A0A23' }}
                >
                  <service.icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-[#0A0A23] mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay de WhatsApp */}
      {showOverlay && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
          <div className="relative">
            <button
              onClick={handleWhatsAppContact}
              className="flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 text-white py-4 px-8 rounded-lg font-semibold transition-colors text-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.687"/>
              </svg>
              <span>Contacta con Ventas</span>
            </button>
            
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}