'use client'
import { useState, useEffect } from 'react'

let isLoading = false
let isLoaded = false
let loadPromise = null

export function useGoogleMaps() {
  const [googleMaps, setGoogleMaps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Si ya está cargado
    if (window.google && window.google.maps) {
      setGoogleMaps(window.google.maps)
      setLoading(false)
      isLoaded = true
      return
    }

    // Si ya está cargando, esperar a la promesa existente
    if (isLoading && loadPromise) {
      loadPromise
        .then(() => {
          setGoogleMaps(window.google.maps)
          setLoading(false)
        })
        .catch(() => {
          setError(true)
          setLoading(false)
        })
      return
    }

    // Cargar por primera vez
    if (!isLoaded && !isLoading) {
      isLoading = true
      loadPromise = loadGoogleMapsScript()
      
      loadPromise
        .then(() => {
          setGoogleMaps(window.google.maps)
          setLoading(false)
          isLoaded = true
          isLoading = false
        })
        .catch(() => {
          setError(true)
          setLoading(false)
          isLoading = false
        })
    }
  }, [])

  return { googleMaps, loading, error }
}

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAf-L38UI3hGyYrMJjeFO0Ij2n1p1mCyMk'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Maps loaded globally')
      resolve()
    }
    
    script.onerror = () => {
      console.error('Failed to load Google Maps')
      reject(new Error('Failed to load Google Maps'))
    }
    
    document.head.appendChild(script)
  })
}
