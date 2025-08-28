'use client'
import { useState, useRef } from 'react'
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
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Nuestras Propiedades */}
      <section className="py-6">
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
      <section className="py-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-[#0A0A23] mb-4">Nuestros Servicios</h2>
        </div>
        <ServicesCarousel />
      </section>

      {/* Descubre Propiedades */}
      <section className="py-6 pb-20">
        <div className="px-4 pb-4">
          <h2 className="text-xl font-bold text-[#0A0A23]">Descubre Propiedades</h2>
          <p className="text-sm text-gray-500 mt-1">Continúa para explorar</p>
        </div>
        
        <DiscoverProperties 
          sessionId={sessionId}
          savedProperties={savedProperties}
          onToggleSave={onToggleSave}
          onPropertyClick={(property) => setSelectedProperty(property)}
          isFullscreen={false}
          currentIndex={discoverCurrentIndex}
          onCurrentIndexChange={setDiscoverCurrentIndex}
        />
      </section>
    </div>
  )
}
