'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PricingModal from '@/app/components/pricing/PricingModal'
import { useSavedProperties } from '@/app/hooks/useSavedProperties'
import { getSupabase } from '@/lib/supabase-browser'

export default function PropertyPricingPage() {
  const params = useParams()
  const router = useRouter()
  const propertyCode = params.propertyCode
  
  const [sessionId, setSessionId] = useState('')
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // Cargar propiedad (mismo código que en page.js)
  useEffect(() => {
    if (!propertyCode || !sessionId) return

    async function loadProperty() {
      try {
        const supabase = getSupabase()
        
        // Buscar en properties_database
        const { data: dbProperty, error: dbError } = await supabase
          .from('properties_database')
          .select('*')
          .eq('propertyCode', propertyCode)
          .single()

        if (!dbError && dbProperty) {
          setProperty({
            property_id: dbProperty.propertyCode,
            propertyCode: dbProperty.propertyCode,
            title: dbProperty.title || dbProperty.subtitle,
            price: dbProperty.price
          })
          setLoading(false)
          return
        }

        // Buscar en chat_sessions
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
            setProperty({
              property_id: foundProperty.property_id || propertyCode,
              propertyCode: foundProperty.propertyCode || propertyCode,
              title: foundProperty.title,
              price: foundProperty.price
            })
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading property:', err)
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyCode, sessionId])

  const handleClose = () => {
    // Volver al detalle de la propiedad
    router.push(`/property/${propertyCode}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center">
      <PricingModal
        isOpen={true}
        onClose={handleClose}
        property={property}
      />
    </div>
  )
}
