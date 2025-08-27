'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useGoogleMaps } from '../../hooks/useGoogleMaps'

export default function MapView({ properties, userLocation, savedProperties, onPropertyClick, onToggleSave }) {
  const { googleMaps, loading, error } = useGoogleMaps()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    const checkMapRef = () => {
      if (mapRef.current && googleMaps && !mapInstanceRef.current) {
        initializeMap()
        setIsMapReady(true)
      } else if (!mapRef.current) {
        setTimeout(checkMapRef, 100)
      }
    }

    if (googleMaps) {
      checkMapRef()
    }
  }, [googleMaps])

  useEffect(() => {
    if (isMapReady && mapInstanceRef.current) {
      updateUserLocation()
      updatePropertyMarkers()
    }
  }, [userLocation, properties, savedProperties, isMapReady])

  const initializeMap = () => {
    if (!googleMaps || !mapRef.current) return

    const center = userLocation || { lat: 40.4168, lng: -3.7038 }
    
    try {
      mapInstanceRef.current = new googleMaps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      })
    } catch (err) {
      console.error('Error creating map:', err)
    }
  }

  const updateUserLocation = () => {
    if (!mapInstanceRef.current || !googleMaps || !userLocation) return

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
    }

    userMarkerRef.current = new googleMaps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: `Tu ubicación: ${userLocation.city}`,
      icon: {
        path: googleMaps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    })

    mapInstanceRef.current.setCenter(userLocation)
  }

  const updatePropertyMarkers = () => {
    if (!mapInstanceRef.current || !googleMaps) return

    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (!properties || properties.length === 0) return

    properties.forEach((property) => {
      const lat = property.lat || property.latitude
      const lng = property.lng || property.longitude
      if (!lat || !lng) return

      const propertyId = property.property_id || property.propertyCode || property.id
      const isSaved = savedProperties?.has(propertyId)

      const marker = new googleMaps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: property.title,
        icon: isSaved ? {
          path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
          scale: 1,
          fillColor: '#FFB300',
          fillOpacity: 1,
          strokeColor: '#FFB300',
          strokeWeight: 1
        } : {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          scale: 1,
          fillColor: '#0A0A23',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1
        }
      })

      const infoWindow = new googleMaps.InfoWindow({
        content: `
          <div 
            style="
              width: 280px;
              height: 160px;
              background-image: linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.3)), url(${property.thumbnail});
              background-size: cover;
              background-position: center;
              border-radius: 12px;
              padding: 0;
              margin: 0;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            "
          >
            <div style="
              display: flex;
              justify-content: flex-end;
              gap: 8px;
              padding: 12px;
            ">
              <button 
                type="button"
                class="share-btn"
                data-property-title="${property.title}"
                data-property-price="${formatPrice(property.price)}"
                style="
                  background: rgba(255,255,255,0.95);
                  border: none;
                  border-radius: 50%;
                  width: 36px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                  transition: all 0.2s ease;
                "
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
              <button 
                type="button"
                class="like-btn"
                data-property-id="${propertyId}"
                data-is-saved="${isSaved}"
                style="
                  background: rgba(255,255,255,0.95);
                  border: none;
                  border-radius: 50%;
                  width: 36px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                  transition: all 0.2s ease;
                "
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? '#FFB300' : 'none'}" stroke="${isSaved ? '#FFB300' : '#666'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
            
            <div 
              class="property-info-area"
              data-property-id="${propertyId}"
              style="
                padding: 16px;
                color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                cursor: pointer;
              "
            >
              <h3 style="
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: bold;
                color: white;
                line-height: 1.2;
              ">${property.title}</h3>
              <p style="
                margin: 0 0 2px 0;
                font-size: 18px;
                color: white;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.9);
              ">${formatPrice(property.price)}</p>
              <p style="
                margin: 0;
                font-size: 14px;
                color: white;
                font-weight: normal;
              ">${property.bedrooms || 0} hab • ${property.bathrooms || 0} baños • ${property.builtArea || 0} m²</p>
            </div>
          </div>
        `
      })

      let currentHandler = null
      
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker)
        
        setTimeout(() => {
          if (currentHandler) {
            document.removeEventListener('click', currentHandler, true)
          }
          
          currentHandler = async function(e) {
            if (e.target.closest('.share-btn')) {
              e.stopImmediatePropagation()
              e.preventDefault()
              
              const btn = e.target.closest('.share-btn')
              const title = btn.getAttribute('data-property-title')
              const price = btn.getAttribute('data-property-price')
              
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: title,
                    text: `${title} - ${price}`,
                    url: window.location.href
                  })
                } catch (err) {
                  if (err.name !== "AbortError") {
                    console.error("Error sharing:", err)
                  }
                }
              } else {
                navigator.clipboard.writeText(`${title} - ${price} - ${window.location.href}`)
                alert('Enlace copiado al portapapeles')
              }
              return false
            }
            
            if (e.target.closest('.like-btn')) {
              e.stopImmediatePropagation()
              e.preventDefault()
              
              const btn = e.target.closest('.like-btn')
              const propId = btn.getAttribute('data-property-id')
              const currentSaved = btn.getAttribute('data-is-saved') === 'true'
              
              onToggleSave && onToggleSave(propId)
              
              const svg = btn.querySelector('svg')
              if (currentSaved) {
                svg.setAttribute('fill', 'none')
                svg.setAttribute('stroke', '#666')
                btn.setAttribute('data-is-saved', 'false')
              } else {
                svg.setAttribute('fill', '#FFB300')
                svg.setAttribute('stroke', '#FFB300')
                btn.setAttribute('data-is-saved', 'true')
              }
              return false
            }
            
            if (e.target.closest('.property-info-area')) {
              e.stopImmediatePropagation()
              e.preventDefault()
              infoWindow.close()
              onPropertyClick && onPropertyClick(property)
              document.removeEventListener('click', currentHandler, true)
              currentHandler = null
            }
          }
          
          document.addEventListener('click', currentHandler, true)
        }, 100)
      })

      infoWindow.addListener('closeclick', () => {
        if (currentHandler) {
          document.removeEventListener('click', currentHandler, true)
          currentHandler = null
        }
      })

      markersRef.current.push(marker)
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <MapPin size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error cargando el mapa</h3>
        <p className="text-gray-600">No se pudo cargar Google Maps</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay propiedades</h3>
        <p className="text-gray-600">Busca propiedades en el chat para verlas aquí</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full" />
      
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-600 mb-1">
          {properties.length} propiedades • {isMapReady ? 'Mapa cargado' : 'Cargando mapa...'}
        </p>
        {userLocation && (
          <p className="text-xs text-gray-500">📍 {userLocation.city}</p>
        )}
      </div>
    </div>
  )
}
