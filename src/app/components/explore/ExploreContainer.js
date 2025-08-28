'use client'
import { useState } from 'react'
import PropertyCarousel from './PropertyCarousel'
import ServicesCarousel from './ServicesCarousel'
import PropertyDetailView from '../properties/PropertyDetailView'
import { useExploreProperties } from '../../hooks/useExploreProperties'
import DiscoverProperties from './DiscoverProperties'

export default function ExploreContainer({ sessionId, savedProperties, onToggleSave, onSendMessage }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [discoverCurrentIndex, setDiscoverCurrentIndex] = useState(0)
  const { getPropertyDetails } = useExploreProperties()

  const handlePropertyClick = (property) => {
    const fullProperty = getPropertyDetails(property.id)
    if (fullProperty) {
      setSelectedProperty(fullProperty)
    }
  }

  if (selectedProperty) {
    return (
      <PropertyDetailView
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onSendMessage={onSendMessage || (() => {})}
        savedProperties={savedProperties}
        onToggleSave={onToggleSave}
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white scroll-smooth">
      {/* Espaciador inicial para el nav bar */}
      <div className="h-16"></div>
      
      {/* Nuestras Propiedades */}
      <section className="py-6 scroll-mt-16">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestras Propiedades</h2>
        </div>
        <PropertyCarousel 
          savedProperties={savedProperties} 
          onToggleSave={onToggleSave}
          onPropertyClick={handlePropertyClick}
        />
      </section>

      {/* Nuestros Servicios */}
      <section className="py-6 scroll-mt-16">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>

      {/* Descubre Propiedades */}
      <section className="py-6 scroll-mt-16">
        <div className="px-4 pb-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Descubre Propiedades</h2>
          <p className="text-sm text-gray-500">Continúa para explorar</p>
        </div>
        
        <div className="px-4">
          <DiscoverProperties 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={onToggleSave}
            onPropertyClick={handlePropertyClick}
            isFullscreen={false}
            currentIndex={discoverCurrentIndex}
            onCurrentIndexChange={setDiscoverCurrentIndex}
          />
        </div>
      </section>
      
      {/* Espaciador para el tab bar */}
      <div className="h-20"></div>
    </div>
  )
}
