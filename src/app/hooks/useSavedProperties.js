'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export function useSavedProperties(sessionId) {
  const [savedProperties, setSavedProperties] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Cargar favoritos al inicio
  useEffect(() => {
    if (sessionId) {
      loadSavedProperties()
    }
  }, [sessionId])

  const loadSavedProperties = async () => {
    if (!sessionId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('favorited_properties, property_sets')
        .eq('session_id', sessionId)
        .maybeSingle()

      if (error || !data) {
        console.log('No favorited properties found')
        return
      }

      const favoriteIds = data.favorited_properties || []
      setSavedProperties(new Set(favoriteIds))
      const propertySets = data.property_sets || []
      console.log(`Loaded ${favoriteIds.length} favorited properties`)
      return propertySets
    } catch (error) {
      console.error('Error loading favorited properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSaveProperty = async (propertyId) => {
    console.log('🔧 toggleSaveProperty called with:', propertyId)

    if (!sessionId || !propertyId) return
  
    const isSaved = savedProperties.has(propertyId)
    
    // Actualizar estado local inmediatamente
    if (isSaved) {
      setSavedProperties(prev => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
    } else {
      setSavedProperties(prev => new Set([...prev, propertyId]))
    }
    
    try {
      // Obtener favoritos actuales
      const { data: currentData } = await supabase
        .from('chat_sessions')
        .select('favorited_properties')
        .eq('session_id', sessionId)
        .maybeSingle()
      
      const currentFavorites = currentData?.favorited_properties || []
      
      // Actualizar lista
      let newFavorites
      if (isSaved) {
        newFavorites = currentFavorites.filter(id => id !== propertyId)
      } else {
        newFavorites = [...currentFavorites, propertyId]
      }
      
      // Guardar en Supabase
      const { error } = await supabase
        .from('chat_sessions')
        .upsert({
          session_id: sessionId,
          favorited_properties: newFavorites,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'session_id' 
        })
      
      if (error) throw error
      
      console.log(isSaved ? `Removed ${propertyId}` : `Added ${propertyId}`)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revertir cambio local si falla
      if (isSaved) {
        setSavedProperties(prev => new Set([...prev, propertyId]))
      } else {
        setSavedProperties(prev => {
          const newSet = new Set(prev)
          newSet.delete(propertyId)
          return newSet
        })
      }
    }
  }

  return {
    savedProperties,
    isLoading,
    toggleSaveProperty,
    loadSavedProperties
  }
}
