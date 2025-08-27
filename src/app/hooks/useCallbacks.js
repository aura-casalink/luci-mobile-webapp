'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCallbacks(sessionId) {
  const [callbacks, setCallbacks] = useState([])
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (!sessionId) return

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel(`callbacks-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'callbacks',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          console.log('Nuevo callback recibido:', payload.new)
          
          // Si es un callback de propiedades, obtener las propiedades
          const callbackWithProperties = await enrichCallbackWithProperties(payload.new)
          
          setCallbacks(prev => [...prev, callbackWithProperties])
          
          // Marcar como procesado
          markCallbackAsProcessed(payload.new.id)
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        setIsListening(status === 'SUBSCRIBED')
      })

    // Polling de respaldo cada 5 segundos
    const pollingInterval = setInterval(() => {
      if (!isListening) {
        checkPendingCallbacks()
      }
    }, 5000)

    // Cleanup
    return () => {
      subscription.unsubscribe()
      clearInterval(pollingInterval)
    }
  }, [sessionId])

  const enrichCallbackWithProperties = async (callback) => {
    try {
      const payload = callback.payload
      
      console.log('Full callback:', callback)  
      console.log('Callback payload:', payload)
      console.log('payload.properties exists:', !!payload.properties)
      console.log('payload.properties isArray:', Array.isArray(payload.properties))
      if (payload.properties) {
        console.log('payload.properties length:', payload.properties.length)
        console.log('First property:', payload.properties[0])
      }
      
      // Si es un callback que indica propiedades encontradas
      if (payload && payload.type === 'properties_search_completed') {
        console.log('🏠 Properties search completed callback received')
        
        let properties = []
        
        // OPCIÓN 1: Si las propiedades vienen en el payload (para testing)
        if (payload.properties && Array.isArray(payload.properties)) {
          properties = payload.properties
          console.log(`📊 USING PAYLOAD PROPERTIES: Found ${properties.length} properties in callback payload`)
        } 
        // OPCIÓN 2: Si hay que obtenerlas de la base de datos (producción)
        else {
          console.log('🔍 NO PAYLOAD PROPERTIES - Fetching properties from database...')
          const { data: dbProperties, error } = await supabase
            .from('properties_database')
            .select('*')
            .eq('session_id', callback.session_id)
            .order('created_at', { ascending: false })
            .limit(20)
          
          if (error) {
            console.error('Error fetching properties from DB:', error)
          } else {
            properties = dbProperties || []
            console.log(`📊 Found ${properties.length} properties in database`)
          }
        }
        
        // Enriquecer el callback con las propiedades
        return {
          ...callback,
          properties: properties
        }
      }
      
      return callback
    } catch (error) {
      console.error('Error enriching callback with properties:', error)
      return callback
    }
  }

  const markCallbackAsProcessed = async (callbackId) => {
    try {
      await supabase
        .from('callbacks')
        .update({ pending: false })
        .eq('id', callbackId)
    } catch (error) {
      console.error('Error marking callback as processed:', error)
    }
  }

  const checkPendingCallbacks = async () => {
    if (!sessionId) return

    try {
      const { data, error } = await supabase
        .from('callbacks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('pending', true)
        .order('updated_at', { ascending: false })

      if (data && data.length > 0) {
        console.log('Found pending callbacks:', data)
        
        // Enriquecer callbacks con propiedades si es necesario
        const enrichedCallbacks = await Promise.all(
          data.map(callback => enrichCallbackWithProperties(callback))
        )
        
        setCallbacks(prev => {
          const existing = prev.map(c => c.id)
          const newCallbacks = enrichedCallbacks.filter(c => !existing.includes(c.id))
          return [...prev, ...newCallbacks]
        })

        // Marcar todos como procesados
        for (const callback of data) {
          await markCallbackAsProcessed(callback.id)
        }
      }
    } catch (error) {
      console.error('Error checking pending callbacks:', error)
    }
  }

  return {
    callbacks,
    isListening,
    checkPendingCallbacks
  }
}
