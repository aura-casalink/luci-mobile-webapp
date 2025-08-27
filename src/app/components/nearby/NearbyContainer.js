'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import MapView from '../map/MapView'
import PropertyDetailView from '../properties/PropertyDetailView'

// Propiedades hardcodeadas (manteniendo lat/lng)
const HARDCODED_PROPERTIES = [
  {
    property_id: 1,
    propertyCode: "prop_1",
    title: "Ático en la Calle San Bernardo",
    address: "Palacio, Madrid",
    price: 1480000,
    bedrooms: 4,
    bathrooms: 3,
    builtArea: 193,
    lat: 40.4271276,
    lng: -3.7090447,
    thumbnail: "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027",
    images: [
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f108148655c92f14e_d20250710_m075738_c003_v0312006_t0012_u01752134258167"
    ],
    description: "Ático exclusivo en el corazón de Madrid: Una oportunidad única para vivir en un espectacular ático exterior de 193 m², completamente reformado y recién amueblado con piezas de diseño, listo para entrar a vivir.",
    neighborhood: "Palacio",
    municipality: "Madrid",
    source: "hardcoded"
  },
  {
    property_id: 2,
    propertyCode: "prop_2",
    title: "Piso en venta en avenida de la Marina, 5",
    address: "Puerto de Sotogrande-La Marina, Sotogrande",
    price: 332000,
    bedrooms: 2,
    bathrooms: 2,
    builtArea: 142,
    lat: 36.2874961,
    lng: -5.2828522,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/f4/c7/a1/1217657634.webp"
    ],
    description: "Sin comisión de Agencia! Vendemos un lote de apartamentos. Pisos chollo. Desde 332.000€ (Alquilado)",
    neighborhood: "Puerto de Sotogrande-La Marina",
    municipality: "Sotogrande",
    source: "hardcoded"
  },
  {
    property_id: 3,
    propertyCode: "prop_3",
    title: "Piso en venta en Av Puerto Sotogrande",
    address: "Puerto de Sotogrande-La Marina, Sotogrande",
    price: 489000,
    bedrooms: 3,
    bathrooms: 2,
    builtArea: 174,
    lat: 36.2871823,
    lng: -5.2825606,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/1c/87/26/1217657656.webp"
    ],
    description: "Piso reformado con 3 habitaciones, dos plazas de garaje, trastero y piscina. Se vende este piso recién reformado, muy luminoso y con una distribución cómoda.",
    neighborhood: "Puerto de Sotogrande-La Marina",
    municipality: "Sotogrande",
    source: "hardcoded"
  },
  {
    property_id: 4,
    propertyCode: "prop_4",
    title: "Chalet adosado en avenida Pernet",
    address: "Nueva Atalaya, Estepona",
    price: 459000,
    bedrooms: 3,
    bathrooms: 3,
    builtArea: 227,
    lat: 36.4726642,
    lng: -5.0179132,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2c/93/90/1305149507.webp"
    ],
    description: "Sin Comisión de Agencia! Se vende encantadora casa adosada en la codiciada zona de Monte Biarritz, a tan solo 5 minutos de la playa.",
    neighborhood: "Nueva Atalaya",
    municipality: "Estepona",
    source: "hardcoded"
  },
  {
    property_id: 5,
    propertyCode: "prop_5",
    title: "Piso en calle Sierra Cazorla",
    address: "Lomas de Marbella Club, Marbella",
    price: 849000,
    bedrooms: 3,
    bathrooms: 3,
    builtArea: 254,
    lat: 36.5118884,
    lng: -4.9380596,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/14/2c/c9/1257669913.webp"
    ],
    description: "Sin Comisión de Agencia! PRECIO NEGOCIABLE - HACER OFERTA ¡Descubre tu nuevo hogar en la prestigiosa Milla de Oro!",
    neighborhood: "Lomas de Marbella Club",
    municipality: "Marbella",
    source: "hardcoded"
  },
  {
    property_id: 6,
    propertyCode: "prop_6",
    title: "Estudio en venta en Retiro",
    address: "Retiro, Madrid",
    price: 320000,
    bedrooms: 1,
    bathrooms: 1,
    builtArea: 40,
    lat: 40.4150,
    lng: -3.6850,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
    ],
    description: "Acogedor estudio cerca del Parque del Retiro, ideal para jóvenes profesionales.",
    neighborhood: "Retiro",
    municipality: "Madrid",
    source: "hardcoded"
  },
  {
    property_id: 7,
    propertyCode: "prop_7",
    title: "Piso en venta en Malasaña",
    address: "Malasaña, Madrid",
    price: 550000,
    bedrooms: 2,
    bathrooms: 2,
    builtArea: 80,
    lat: 40.4250,
    lng: -3.7050,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"
    ],
    description: "Moderno piso en el vibrante barrio de Malasaña, rodeado de cafeterías y vida nocturna.",
    neighborhood: "Malasaña",
    municipality: "Madrid",
    source: "hardcoded"
  },
  {
    property_id: 8,
    propertyCode: "prop_8",
    title: "Piso en venta en Chueca",
    address: "Chueca, Madrid",
    price: 680000,
    bedrooms: 2,
    bathrooms: 2,
    builtArea: 90,
    lat: 40.4220,
    lng: -3.6950,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    ],
    description: "Piso de diseño en Chueca, con todas las comodidades y un estilo contemporáneo único.",
    neighborhood: "Chueca",
    municipality: "Madrid",
    source: "hardcoded"
  },
  {
    property_id: 9,
    propertyCode: "prop_9",
    title: "Piso en venta en Lavapiés",
    address: "Lavapiés, Madrid",
    price: 395000,
    bedrooms: 2,
    bathrooms: 1,
    builtArea: 70,
    lat: 40.4080,
    lng: -3.7000,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop"
    ],
    description: "Piso con carácter en el multicultural barrio de Lavapiés, lleno de arte y diversidad.",
    neighborhood: "Lavapiés",
    municipality: "Madrid",
    source: "hardcoded"
  }
]

export default function NearbyContainer({ sessionId, savedProperties, onToggleSave }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          
          // Obtener ciudad usando geocoding reverso
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`)
            const data = await response.json()
            const city = data.city || data.locality || 'Tu ubicación'
            
            setUserLocation({ lat, lng, city })
          } catch (error) {
            console.log('Error getting city name:', error)
            setUserLocation({ lat, lng, city: 'Tu ubicación' })
          }
        },
        (error) => {
          console.log('Error getting location:', error)
          // Fallback a Barcelona (tu ubicación según el contexto)
          setUserLocation({ lat: 41.3851, lng: 2.1734, city: 'Barcelona' })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    } else {
      setUserLocation({ lat: 41.3851, lng: 2.1734, city: 'Barcelona' })
    }
  }, [])

  useEffect(() => {
    const loadNearbyProperties = async () => {
      try {
        const allProperties = []

        // Siempre agregar propiedades hardcodeadas
        allProperties.push(...HARDCODED_PROPERTIES)

        // Cargar propiedades de búsqueda desde Supabase
        try {
          const { data: sessionData, error } = await supabase
            .from('chat_sessions')
            .select('property_sets')
            .eq('session_id', sessionId)
            .single()

          if (!error && sessionData?.property_sets) {
            const propertySets = Array.isArray(sessionData.property_sets) 
              ? sessionData.property_sets 
              : [sessionData.property_sets]

            propertySets.forEach((set) => {
              if (set.properties && Array.isArray(set.properties)) {
                set.properties.forEach(property => {
                  if (property.lat && property.lng) {
                    allProperties.push({
                      property_id: property.property_id,
                      propertyCode: property.property_id,
                      title: property.title,
                      address: property.location || `${property.neighborhood || ''}, ${property.municipality || ''}`.trim().replace(/^,\s*/, ''),
                      price: property.price,
                      bedrooms: property.bedrooms,
                      bathrooms: property.bathrooms,
                      builtArea: property.builtArea,
                      lat: property.lat,
                      lng: property.lng,
                      thumbnail: property.thumbnail,
                      images: property.images || [property.thumbnail],
                      description: property.description,
                      neighborhood: property.neighborhood,
                      municipality: property.municipality,
                      source: "search"
                    })
                  }
                })
              }
            })
          }
        } catch (supabaseError) {
          console.log('Could not load search properties:', supabaseError)
        }

        setProperties(allProperties)
      } catch (error) {
        console.error('Error loading nearby properties:', error)
        setProperties(HARDCODED_PROPERTIES)
      } finally {
        setLoading(false)
      }
    }

    loadNearbyProperties()
  }, [sessionId])

  const handlePropertyClick = (property) => {
    setSelectedProperty(property)
  }

  const handleSendMessage = (message) => {
    console.log('Mensaje desde mapa:', message)
  }

  if (selectedProperty) {
    return (
      <PropertyDetailView
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onSendMessage={handleSendMessage}
        savedProperties={savedProperties}
        onToggleSave={onToggleSave}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando propiedades cercanas...</div>
      </div>
    )
  }

  return (
    <MapView 
      properties={properties}
      userLocation={userLocation}
      savedProperties={savedProperties}
      onToggleSave={onToggleSave}
      onPropertyClick={handlePropertyClick} 
    />
  )
}
