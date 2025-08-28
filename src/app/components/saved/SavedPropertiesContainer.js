'use client'
import { useState, useEffect } from 'react'
import SavedProperties from './SavedProperties'
import { supabase } from '@/lib/supabase'

// Propiedades hardcodeadas con múltiples imágenes
const HARDCODED_PROPERTIES = {
  1: { 
    property_id: 1, 
    propertyCode: "prop_1", 
    title: "Ático en la Calle San Bernardo", 
    address: "Palacio, Madrid", 
    price: 1480000, 
    bedrooms: 4, 
    bathrooms: 3,
    lat: 40.4271276,
    lng: -3.7090447,
    builtArea: 193, 
    thumbnail: "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027", 
    images: [
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f108148655c92f14e_d20250710_m075738_c003_v0312006_t0012_u01752134258167",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f109c229b2e483ef1_d20250710_m075737_c003_v0312030_t0047_u01752134257742",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f1018df8439e96569_d20250710_m075735_c003_v0312026_t0021_u01752134255919"
    ], 
    description: "Ático exclusivo en el corazón de Madrid", 
    neighborhood: "Palacio", 
    municipality: "Madrid" 
  },
  2: { 
    property_id: 2, 
    propertyCode: "prop_2", 
    title: "Piso en venta en avenida de la Marina, 5", 
    address: "Puerto de Sotogrande-La Marina, Sotogrande", 
    price: 332000, 
    bedrooms: 2, 
    bathrooms: 2, 
    lat: 36.2874961,
    lng: -5.2828522,
    builtArea: 142, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/f4/c7/a1/1217657634.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/04/d1/fb/1217657636.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2d/91/23/1217657638.webp"
    ], 
    description: "Sin comisión de Agencia!", 
    neighborhood: "Puerto de Sotogrande-La Marina", 
    municipality: "Sotogrande" 
  },
  3: { 
    property_id: 3, 
    propertyCode: "prop_3", 
    title: "Piso en venta en Av Puerto Sotogrande", 
    address: "Puerto de Sotogrande-La Marina, Sotogrande", 
    price: 489000, 
    bedrooms: 3, 
    bathrooms: 2, 
    lat: 36.2871823,
    lng: -5.2825606,
    builtArea: 174, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/1c/87/26/1217657656.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/75/16/da/1217657654.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/bc/ce/c8/1217657664.webp"
    ], 
    description: "Piso reformado con 3 habitaciones.", 
    neighborhood: "Puerto de Sotogrande-La Marina", 
    municipality: "Sotogrande" 
  },
  4: { 
    property_id: 4, 
    propertyCode: "prop_4", 
    title: "Chalet adosado en avenida Pernet", 
    address: "Nueva Atalaya, Estepona", 
    price: 459000, 
    bedrooms: 3, 
    bathrooms: 3, 
    lat: 36.4726642,
    lng: -5.0179132,
    builtArea: 227, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2c/93/90/1305149507.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2d/4a/df/1305149428.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/36/84/8d/1305149553.webp"
    ], 
    description: "Casa adosada en Monte Biarritz.", 
    neighborhood: "Nueva Atalaya", 
    municipality: "Estepona" 
  },
  5: { 
    property_id: 5, 
    propertyCode: "prop_5", 
    title: "Piso en calle Sierra Cazorla", 
    address: "Lomas de Marbella Club, Marbella", 
    price: 849000, 
    bedrooms: 3, 
    bathrooms: 3, 
    lat: 36.5118884,
    lng: -4.9380596,
    builtArea: 254, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/14/2c/c9/1257669913.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/14/c1/2b/1257669928.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/18/18/46/1257669956.webp"
    ], 
    description: "Milla de Oro!", 
    neighborhood: "Lomas de Marbella Club", 
    municipality: "Marbella" 
  },
  6: { 
    property_id: 6, 
    propertyCode: "prop_6", 
    title: "Estudio en venta en Retiro", 
    address: "Retiro, Madrid", 
    price: 320000, 
    bedrooms: 1, 
    bathrooms: 1, 
    lat: 40.4150,
    lng: -3.6850,
    builtArea: 40, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    ], 
    description: "Estudio cerca del Retiro.", 
    neighborhood: "Retiro", 
    municipality: "Madrid" 
  },
  7: { 
    property_id: 7, 
    propertyCode: "prop_7", 
    title: "Piso en venta en Malasaña", 
    address: "Malasaña, Madrid", 
    price: 550000, 
    bedrooms: 2, 
    bathrooms: 2, 
    lat: 40.4250,
    lng: -3.7050,
    builtArea: 80, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop"
    ], 
    description: "Piso en Malasaña.", 
    neighborhood: "Malasaña", 
    municipality: "Madrid" 
  },
  8: { 
    property_id: 8, 
    propertyCode: "prop_8", 
    title: "Piso en venta en Chueca", 
    address: "Chueca, Madrid", 
    price: 680000, 
    bedrooms: 2, 
    bathrooms: 2, 
    lat: 40.4220,
    lng: -3.6950,
    builtArea: 90, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"
    ], 
    description: "Piso de diseño en Chueca.", 
    neighborhood: "Chueca", 
    municipality: "Madrid" 
  },
  9: { 
    property_id: 9, 
    propertyCode: "prop_9", 
    title: "Piso en venta en Lavapiés", 
    address: "Lavapiés, Madrid", 
    price: 395000, 
    bedrooms: 2, 
    bathrooms: 1, 
    lat: 40.4080,
    lng: -3.7000,
    builtArea: 70, 
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp", 
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    ], 
    description: "Piso en Lavapiés.", 
    neighborhood: "Lavapiés", 
    municipality: "Madrid" 
  }
}

export default function SavedPropertiesContainer({ sessionId, savedProperties, onToggleSave }) {
  const [savedPropertiesList, setSavedPropertiesList] = useState([])
  const [loading, setLoading] = useState(true)

  const handleSendMessage = (message) => {
    console.log('Mensaje desde propiedad guardada:', message)
  }

  useEffect(() => {
    const loadSavedProperties = async () => {
      console.log('🔍 loadSavedProperties - savedProperties:', Array.from(savedProperties))
      console.log('🔍 loadSavedProperties - sessionId:', sessionId)
      
      if (!savedProperties || savedProperties.size === 0) {
        console.log('🔍 No saved properties found')
        setSavedPropertiesList([])
        setLoading(false)
        return
      }

      const allSavedProperties = []
      const savedIds = Array.from(savedProperties)
      
      console.log('🔍 All savedIds:', savedIds)
      console.log('🔍 Types of savedIds:', savedIds.map(id => `${id} (${typeof id})`))

      // Agregar propiedades hardcodeadas
      const hardcodedIds = savedIds.filter(id => typeof id === 'number')
      console.log('🔍 Hardcoded IDs:', hardcodedIds)
      
      hardcodedIds.forEach(id => {
        if (HARDCODED_PROPERTIES[id]) {
          allSavedProperties.push(HARDCODED_PROPERTIES[id])
          console.log('🔍 Added hardcoded property:', id)
        }
      })

      // PRIMERO: Buscar TODOS los IDs string en properties_database
      const stringIds = savedIds.filter(id => typeof id === 'string')
      console.log('🔍 String IDs to check:', stringIds)
      
      const foundInDatabase = []
      if (stringIds.length > 0) {
        try {
          console.log('🔍 Querying properties_database with ALL string IDs:', stringIds)
          
          // Ver qué hay realmente en la tabla
          const { data: sampleData, error: sampleError } = await supabase
            .from('properties_database')
            .select('propertyCode, title')
            .limit(5)
            
          console.log('🔍 Sample data from properties_database:', sampleData)
          
          // Intentar con comillas en el nombre de columna
          const { data: discoverProperties1, error: error1 } = await supabase
            .from('properties_database')
            .select('*')
            .in('"propertyCode"', stringIds)

          console.log('🔍 Query with quoted column result:', { discoverProperties1, error: error1 })

          // Intentar sin comillas
          const { data: discoverProperties2, error: error2 } = await supabase
            .from('properties_database')
            .select('*')
            .in('propertyCode', stringIds)

          console.log('🔍 Query without quotes result:', { discoverProperties2, error: error2 })
          
          // Intentar búsqueda específica del ID exacto
          const { data: specificSearch, error: specificError } = await supabase
            .from('properties_database')
            .select('*')
            .eq('"propertyCode"', '108727256')
            
          console.log('🔍 Specific search for 108727256:', { specificSearch, specificError })

          // Usar la consulta que funcionó
          const discoverProperties = discoverProperties1?.length > 0 ? discoverProperties1 : discoverProperties2

          if (discoverProperties && discoverProperties.length > 0) {
            discoverProperties.forEach(property => {
              console.log('🔍 Processing discover property:', property.propertyCode)
              
              foundInDatabase.push(property.propertyCode)

              let images = [property.thumbnail]
              if (property.multimedia) {
                try {
                  let multimediaData = property.multimedia
                  
                  // Formato: {"images": [{tag: "...", url: "..."}, ...]}
                  if (multimediaData.images && Array.isArray(multimediaData.images)) {
                    const parsedImages = multimediaData.images
                      .map(item => item.url)
                      .filter(url => url && typeof url === 'string')
                      .slice(0, 15)
                    
                    if (parsedImages.length > 0) {
                      images = parsedImages
                    }
                  }
                  
                  console.log('Parsed', images.length, 'images for property:', property.propertyCode)
                } catch (e) {
                  console.log('Could not parse multimedia for property:', property.propertyCode)
                }
              }
              
              allSavedProperties.push({
                property_id: property.propertyCode,
                propertyCode: property.propertyCode,
                title: property.title || property.subtitle,
                address: property.address || `${property.neighborhood || ''}, ${property.municipality || ''}`.trim().replace(/^,\s*/, ''),
                price: property.price,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                builtArea: property.sqft,
                usefulArea: property.sqft,
                thumbnail: property.thumbnail,
                images: images,
                description: property.description,
                neighborhood: property.neighborhood,
                municipality: property.municipality,
                latitude: property.latitude,
                longitude: property.longitude
              })
              console.log('🔍 Added discover property with', images.length, 'images:', property.propertyCode)
              console.log('🔍 Added discover property:', property.propertyCode)
            })
          }
        } catch (error) {
          console.log('Error accessing properties_database:', error)
        }
      }

      // SEGUNDO: Para IDs que NO se encontraron en properties_database, buscar en chat_sessions
      const notFoundInDatabase = stringIds.filter(id => !foundInDatabase.includes(id))
      console.log('🔍 IDs not found in properties_database, checking chat_sessions:', notFoundInDatabase)

      if (notFoundInDatabase.length > 0) {
        try {
          const { data: sessionData, error } = await supabase
            .from('chat_sessions')
            .select('property_sets')
            .eq('session_id', sessionId)
            .single()

          console.log('🔍 Chat sessions query result:', { sessionData, error })

          if (!error && sessionData?.property_sets) {
            const propertySets = Array.isArray(sessionData.property_sets) 
              ? sessionData.property_sets 
              : [sessionData.property_sets]

            propertySets.forEach((set) => {
              if (set.properties && Array.isArray(set.properties)) {
                set.properties.forEach(property => {
                  const propertyId = property.property_id
                  if (notFoundInDatabase.includes(propertyId)) {
                    allSavedProperties.push({
                      property_id: propertyId,
                      propertyCode: propertyId,
                      title: property.title,
                      address: property.location || `${property.neighborhood || ''}, ${property.municipality || ''}`.trim().replace(/^,\s*/, ''),
                      price: property.price,
                      bedrooms: property.bedrooms,
                      bathrooms: property.bathrooms,
                      builtArea: property.builtArea,
                      usefulArea: property.usefulArea,
                      thumbnail: property.thumbnail,
                      images: property.images || [property.thumbnail],
                      description: property.description,
                      neighborhood: property.neighborhood,
                      municipality: property.municipality,
                      latitude: property.lat,
                      longitude: property.lng,
                      pricePerSqm: property.pricePerSqm,
                      priceComparison: property.priceComparison,
                      amenities: property.amenities
                    })
                    console.log('🔍 Added chat property:', propertyId)
                  }
                })
              }
            })
          }
        } catch (error) {
          console.log('Error accessing chat_sessions:', error)
        }
      }

      console.log('🔍 Final allSavedProperties:', allSavedProperties)
      console.log('🔍 Final count:', allSavedProperties.length)
      
      setSavedPropertiesList(allSavedProperties)
      setLoading(false)
    }

    loadSavedProperties()
  }, [savedProperties, sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando propiedades guardadas...</div>
      </div>
    )
  }

  return (
    <SavedProperties 
      savedPropertiesList={savedPropertiesList}
      savedProperties={savedProperties}
      onToggleSave={onToggleSave}
      onSendMessage={handleSendMessage}
    />
  )
}
