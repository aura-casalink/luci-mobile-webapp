'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
        .single()

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
    console.log('🔧 Current sessionId:', sessionId)
    console.log('🔧 Current savedProperties:', Array.from(savedProperties))
    if (!sessionId || !propertyId) return

    const isSaved = savedProperties.has(propertyId)
    
    try {
      let newFavorites
      if (isSaved) {
        // Quitar de favoritos
        newFavorites = Array.from(savedProperties).filter(id => id !== propertyId)
        setSavedProperties(prev => {
          const newSet = new Set(prev)
          newSet.delete(propertyId)
          return newSet
        })
      } else {
        // Agregar a favoritos
        newFavorites = [...Array.from(savedProperties), propertyId]
        setSavedProperties(prev => new Set([...prev, propertyId]))
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          favorited_properties: newFavorites,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error updating favorites:', error)
        // Revertir cambio local en caso de error
        if (isSaved) {
          setSavedProperties(prev => new Set([...prev, propertyId]))
        } else {
          setSavedProperties(prev => {
            const newSet = new Set(prev)
            newSet.delete(propertyId)
            return newSet
          })
        }
        return
      }

      console.log(isSaved ? `Removed ${propertyId} from favorites` : `Added ${propertyId} to favorites`)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return {
    savedProperties,
    isLoading,
    toggleSaveProperty,
    loadSavedProperties
  }
}
