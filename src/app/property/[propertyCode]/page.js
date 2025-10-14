'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PropertyDetailView from '@/app/components/properties/PropertyDetailView'
import { useSavedProperties } from '@/app/hooks/useSavedProperties'
import { getSupabase } from '@/lib/supabase-browser'

export default function PropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyCode = params.propertyCode
  
  const [sessionId, setSessionId] = useState('')
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { savedProperties, toggleSaveProperty } = useSavedProperties(sessionId)

  // Generar sessionId
  useEffect(() => {
    const stored = localStorage.getItem('luci_session_id')
    const storedTime = localStorage.getItem('luci_session_time')
    const oneHour = 60 * 60 * 1000
    
    if (stored && storedTime && (Date.now() - parseInt(storedTime) < oneHour)) {
      setSessionId(stored)
    } else {
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('luci_session_id', newId)
      localStorage.setItem('luci_session_time', Date.now().toString())
      setSessionId(newId)
    }
  }, [])

  // Cargar propiedad
  useEffect(() => {
    if (!propertyCode || !sessionId) return

    async function loadProperty() {
      try {
        console.log('🔍 Loading property:', propertyCode)
        
        const supabase = getSupabase()
        
        // Intentar buscar en properties_database
        const { data: dbProperty, error: dbError } = await supabase
          .from('properties_database')
          .select('*')
          .eq('propertyCode', propertyCode)
          .single()

        if (!dbError && dbProperty) {
          // Formatear propiedad de la base de datos
          let images = [dbProperty.thumbnail]
          
          if (dbProperty.multimedia?.images) {
            const parsedImages = dbProperty.multimedia.images
              .map(item => item.url)
              .filter(url => url && typeof url === 'string')
              .slice(0, 15)
            
            if (parsedImages.length > 0) {
              images = parsedImages
            }
          }
          
          const formattedProperty = {
            property_id: dbProperty.propertyCode,
            propertyCode: dbProperty.propertyCode,
            title: dbProperty.title || dbProperty.subtitle,
            address: dbProperty.address || `${dbProperty.neighborhood || ''}, ${dbProperty.municipality || ''}`.trim(),
            price: dbProperty.price,
            bedrooms: dbProperty.bedrooms,
            bathrooms: dbProperty.bathrooms,
            builtArea: dbProperty.sqft,
            thumbnail: dbProperty.thumbnail,
            images: images,
            description: dbProperty.description,
            neighborhood: dbProperty.neighborhood,
            municipality: dbProperty.municipality,
            latitude: dbProperty.latitude,
            longitude: dbProperty.longitude
          }
          
          setProperty(formattedProperty)
          setLoading(false)
          return
        }

        // Si no está en properties_database, buscar en chat_sessions
        const { data: sessionData } = await supabase
          .from('chat_sessions')
          .select('property_sets')
          .eq('session_id', sessionId)
          .single()

        if (sessionData?.property_sets) {
          const propertySets = Array.isArray(sessionData.property_sets) 
            ? sessionData.property_sets 
            : [sessionData.property_sets]

          let foundProperty = null
          
          for (const set of propertySets) {
            if (set.properties && Array.isArray(set.properties)) {
              foundProperty = set.properties.find(
                p => p.property_id === propertyCode || p.propertyCode === propertyCode
              )
              if (foundProperty) break
            }
          }

          if (foundProperty) {
            const formattedProperty = {
              property_id: foundProperty.property_id || propertyCode,
              propertyCode: foundProperty.propertyCode || propertyCode,
              title: foundProperty.title,
              address: foundProperty.location || `${foundProperty.neighborhood || ''}, ${foundProperty.municipality || ''}`.trim(),
              price: foundProperty.price,
              bedrooms: foundProperty.bedrooms,
              bathrooms: foundProperty.bathrooms,
              builtArea: foundProperty.builtArea,
              thumbnail: foundProperty.thumbnail,
              images: foundProperty.images || [foundProperty.thumbnail],
              description: foundProperty.description,
              neighborhood: foundProperty.neighborhood,
              municipality: foundProperty.municipality,
              latitude: foundProperty.lat,
              longitude: foundProperty.lng
            }
            
            setProperty(formattedProperty)
            setLoading(false)
            return
          }
        }

        // Propiedad no encontrada
        setError('Propiedad no encontrada')
        setLoading(false)

      } catch (err) {
        console.error('Error loading property:', err)
        setError('Error al cargar la propiedad')
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyCode, sessionId])

  const handleClose = () => {
    router.back()
  }

  const handleSendMessage = (message) => {
    console.log('Message from property:', message)
    // Aquí podrías redirigir a /chat con el mensaje
    router.push(`/chat?message=${encodeURIComponent(message)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Propiedad no encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            No pudimos encontrar la propiedad que buscas
          </p>
          <button
            onClick={() => router.push('/chat')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Volver al chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <PropertyDetailView
      property={property}
      onClose={handleClose}
      onSendMessage={handleSendMessage}
      savedProperties={savedProperties}
      onToggleSave={toggleSaveProperty}
    />
  )
}
