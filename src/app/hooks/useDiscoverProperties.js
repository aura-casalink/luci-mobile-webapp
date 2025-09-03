'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export function useDiscoverProperties(sessionId) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sessionId) {
      fetchDiscoverProperties()
    }
  }, [sessionId])

  const fetchDiscoverProperties = async () => {
    try {
      setLoading(true)

      console.log('🔍 Starting Supabase query with sessionId:', sessionId)
      
      const { data, error, count } = await supabase
        .from('properties_database')
        .select(`
          id,
          title,
          subtitle,
          price,
          address,
          location,
          neighborhood,
          municipality,
          province,
          thumbnail,
          multimedia,
          bedrooms,
          bathrooms,
          sqft,
          description,
          "propertyCode",
          session_id
        `, { count: 'exact' })
        .eq('session_id', sessionId)
        .limit(20)

      console.log('🔍 Supabase raw response:', { data, error, count })
      console.log('🔍 Data length:', data?.length)
      console.log('🔍 Error details:', error)

      if (error) {
        console.error('🔍 Supabase error:', error)
        throw error
      }

      // También hacer una consulta de prueba sin filtros para ver si hay datos
      const { data: testData, error: testError } = await supabase
        .from('properties_database')
        .select('session_id, id, title')
        .limit(10)

      console.log('🔍 Test query (first 10 rows):', testData)
      console.log('🔍 Available session_ids:', testData?.map(item => item.session_id))

      // Consulta específica para contar registros con este session_id
      const { count: specificCount } = await supabase
        .from('properties_database')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)

      console.log('🔍 Count of properties with this session_id:', specificCount)

      const shuffledProperties = data ? data.sort(() => Math.random() - 0.5) : []
      setProperties(shuffledProperties)

    } catch (err) {
      console.error('Error fetching discover properties:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { properties, loading, error }
}
