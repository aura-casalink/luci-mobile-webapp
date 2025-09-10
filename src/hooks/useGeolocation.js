'use client'
import { useEffect, useRef } from 'react'

export function useGeolocation({ sessionId, consent = false } = {}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current || !sessionId || typeof window === 'undefined') return
    fired.current = true

    const savedConsent = localStorage.getItem('geo_consent') === 'true'
    const shouldTrack = consent || savedConsent

    const send = (browser_geo = null) => {
      const data = JSON.stringify({ session_id: sessionId, browser_geo })
      const blob = new Blob([data], { type: 'application/json' })
      
      if (!navigator.sendBeacon('/api/track-location', blob)) {
        // Fallback a fetch si sendBeacon falla
        fetch('/api/track-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
        }).catch(() => {})
      }
      
      sessionStorage.setItem(`geo_tracked_${sessionId}`, 'true')
    }

    // Evitar duplicados por sesión
    if (sessionStorage.getItem(`geo_tracked_${sessionId}`)) return

    if (!shouldTrack || !('geolocation' in navigator)) {
      send()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy, altitude, speed } = pos.coords || {}
        const browser_geo = {
          latitude, 
          longitude,
          accuracy_meters: accuracy ?? null,
          altitude, 
          speed,
          source: 'browser',
          timestamp: new Date(pos.timestamp).toISOString(),
        }
        send(browser_geo)
        if (typeof window !== 'undefined') {
          window.userBrowserGeo = browser_geo
        }
      },
      () => send(), // Si falla, enviar solo edge-geo
      { 
        enableHighAccuracy: false, 
        timeout: 10000, 
        maximumAge: 300000 
      }
    )
  }, [sessionId, consent])
  
  return null
}
