'use client'
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function PricingModal({ isOpen, onClose, property }) {
  if (!isOpen) return null

  return <PricingModalContent onClose={onClose} property={property} />
}

function PricingModalContent({ onClose, property }) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const plans = [
    {
      name: 'Free',
      price: 'GRATIS',
      description: 'Descubre la versión esencial de AURA. Ideal para explorar sin compromiso.',
      boldPhrase: null,
      features: [
        'Búsquedas básicas ilimitadas',
        'Acceso a propiedades multiplataforma',
        'Filtros esenciales',
        'Hasta 10 búsquedas con IA al día'
      ],
      buttonText: null,
      buttonColor: null,
      backgroundColor: '#F0F0F0',
      textColor: '#A5A5B0',
      borderColor: '#E5E7EB',
      showCurrentTag: true,
      showPopularTag: false,
      whatsappMessage: null,
      tagColor: '#0A0A23'
    },
    {
      name: 'Pro',
      price: '4,99€/mes',
      description: 'Para quienes quieren más control, más datos y más velocidad.',
      boldPhrase: 'Tu radar inmobiliario, siempre encendido.',
      features: [
        'Búsquedas y alertas ilimitadas',
        'Recomendaciones inteligentes basadas en tus preferencias',
        'Filtros avanzados por estilo de vida',
        'Soporte prioritario y asistencia en tiempo real'
      ],
      buttonText: 'Seleccionar plan',
      buttonColor: '#FFB300',
      backgroundColor: '#FFFFFF',
      textColor: '#374151',
      borderColor: '#E5E7EB',
      showCurrentTag: false,
      showPopularTag: false,
      whatsappMessage: null,
      tagColor: '#FFB300'
    },
    {
      name: 'Success',
      price: '10% del descuento conseguido',
      description: 'Solo pagas si ganamos por ti. Nos encargamos de coordinar visitas, negociar y cerrar al mejor precio.',
      boldPhrase: 'Tú eliges la casa. Nosotros conseguimos el mejor trato.',
      features: [
        'Visita gestionada en menos de 2 horas laborables',
        'Negociación profesional con el vendedor',
        'Optimización de todos los trámites',
        'Acompañamiento experto durante todo el proceso'
      ],
      buttonText: 'Agendar Llamada Gratuita',
      buttonColor: '#0A0A23',
      backgroundColor: '#FFFFFF',
      textColor: '#374151',
      borderColor: '#FFB300',
      showCurrentTag: false,
      showPopularTag: true,
      whatsappMessage: 'success',
      tagColor: '#FFB300'
    },
    {
      name: 'Care',
      price: '799€',
      description: 'Tu personal shopper inmobiliario completo. Un consultor AURA te acompaña durante 3 meses: búsqueda, visitas, trámites, reformas y más.',
      boldPhrase: 'La forma más inteligente y tranquila de comprar tu casa.',
      features: [
        'Reuniones periódicas con propuestas seleccionadas',
        'Informes detallados de barrios, precios y servicios',
        'Coordinación de reformas y presupuestos',
        'Tú decides, nosotros lo hacemos realidad'
      ],
      buttonText: 'Agendar Llamada Gratuita',
      buttonColor: '#0A0A23',
      backgroundColor: '#FFFFFF',
      textColor: '#374151',
      borderColor: '#E5E7EB',
      showCurrentTag: false,
      showPopularTag: false,
      whatsappMessage: 'care',
      tagColor: '#FFB300'
    }
  ]

  const getWhatsAppUrl = (messageType) => {
    const propertyCode = property?.propertyCode || property?.property_id || property?.id || ''
    const propertyUrl = propertyCode ? `https://luci.aura-app.es/share/${propertyCode}` : ''
    
    let message = ''
    if (messageType === 'success') {
      message = `Hola! Estoy interesado en agendar una llamada para conocer más sobre vuestro servicio a éxito. Me interesa la propiedad ${propertyUrl}. ¿Me podrías dar más información?`
    } else if (messageType === 'care') {
      message = `Hola! Estoy interesado en agendar una llamada para conocer más sobre vuestro servicio de personal shopping completo. ¿Me podrías dar más información?`
    }
    
    return `https://wa.me/34910626648?text=${encodeURIComponent(message)}`
  }

  const modal = (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Planes de suscripción</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none w-8 h-8 flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-72px)] px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className="relative rounded-xl p-6 flex flex-col"
                style={{ 
                  backgroundColor: plan.backgroundColor,
                  border: `2px solid ${plan.borderColor}`
                }}
              >
                {/* Current Plan Tag - FUERA del borde */}
                {plan.showCurrentTag && (
                  <div 
                    className="absolute -top-3 right-4 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: plan.tagColor || '#FFB300' }}
                  >
                    Plan actual
                  </div>
                )}

                {/* Popular Tag - FUERA del borde */}
                {plan.showPopularTag && (
                  <div 
                    className="absolute -top-3 right-4 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: plan.tagColor || '#FFB300' }}
                  >
                    Más Popular
                  </div>
                )}

                {/* Plan Name - CENTRADO */}
                <h3 
                  className="text-xl font-bold mb-2 text-center"
                  style={{ color: plan.textColor }}
                >
                  {plan.name}
                </h3>

                {/* Price - CENTRADO */}
                <p 
                  className="text-3xl font-bold mb-3 text-center"
                  style={{ color: plan.textColor }}
                >
                  {plan.price}
                </p>

                {/* Description - JUSTIFICADO */}
                <div className="text-sm mb-6 flex-grow text-justify" style={{ color: plan.textColor }}>
                  <p>{plan.description}</p>
                  {plan.boldPhrase && (
                    <p className="font-bold mt-2">{plan.boldPhrase}</p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <li 
                      key={i} 
                      className="flex items-start text-sm"
                      style={{ color: plan.textColor }}
                    >
                      <span className="mr-2 font-bold flex-shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                {plan.buttonText && (
                  <>
                    {plan.whatsappMessage ? (
                      <a
                        href={getWhatsAppUrl(plan.whatsappMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-lg font-bold transition-opacity hover:opacity-90 text-center"
                        style={{
                          backgroundColor: plan.buttonColor,
                          color: '#FAFAFA',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      >
                        {plan.buttonText}
                      </a>
                    ) : (
                      <button
                        className="w-full py-3 px-4 rounded-lg font-bold transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: plan.buttonColor,
                          color: '#FAFAFA',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        onClick={() => {
                          console.log(`Plan seleccionado: ${plan.name}`)
                          onClose?.()
                        }}
                      >
                        {plan.buttonText}
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Portal al body para evitar stacking context del modal de propiedades
  return createPortal(modal, document.body)
}
