'use client'
import { useEffect, useRef } from 'react'

export function useGeolocation({ sessionId, consent = false } = {}) {
  const attemptedRef = useRef(false)

  useEffect(() => {
    // Solo intentar una vez por montaje del componente
    if (attemptedRef.current || !sessionId || typeof window === 'undefined') return
    attemptedRef.current = true

    console.log('🌍 useGeolocation starting for session:', sessionId)

    const savedConsent = localStorage.getItem('geo_consent') === 'true'
    const shouldTrack = consent || savedConsent
    
    console.log('🌍 Consent status:', { consent, savedConsent, shouldTrack })

    const send = async (browser_geo = null) => {
      console.log('🌍 Sending location to server:', { session_id: sessionId, browser_geo })
      
      try {
        const response = await fetch('/api/track-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            session_id: sessionId, 
            browser_geo 
          })
        })
        
        const data = await response.json()
        console.log('🌍 Server response:', data)
        
        if (data.tracked) {
          console.log('✅ Location successfully tracked')
        }
      } catch (err) {
        console.error('❌ Error sending location:', err)
      }
    }

    // Si no hay consentimiento, enviar solo datos básicos
    if (!shouldTrack) {
      console.log('🌍 No consent, sending basic data')
      send(null)
      return
    }

    // Si hay consentimiento, obtener ubicación
    if ('geolocation' in navigator) {
      console.log('🌍 Requesting current position...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Position obtained:', position.coords)
          
          const browser_geo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy_meters: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitude_accuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString(),
            source: 'browser'
          }
          
          // Guardar en window para debug
          if (typeof window !== 'undefined') {
            window.userBrowserGeo = browser_geo
          }
          
          send(browser_geo)
        },
        (error) => {
          console.error('⚠️ Geolocation error:', error.message)
          // Enviar sin ubicación si falla
          send({
            error: error.message,
            error_code: error.code,
            source: 'browser_error'
          })
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos de cache
        }
      )
    } else {
      console.log('⚠️ Geolocation not supported')
      send(null)
    }
  }, [sessionId, consent])
  
  return null
}