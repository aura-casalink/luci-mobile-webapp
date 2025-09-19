'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase-browser'
import { Send, Mic, MicOff, Play, Pause, X, Check } from 'lucide-react'
import { useCallbacks } from '../../hooks/useCallbacks'
import PropertyResults from '../properties/PropertyResults'
import PropertyDetailView from '@/app/components/properties/PropertyDetailView'
import SearchingAnimation from './SearchingAnimation'
import { useDemo } from '@/contexts/DemoContext'

export default function ChatInterface({ sessionId, savedProperties, user, onToggleSave, onStreetViewChange }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [supabase, setSupabase] = useState(null)
  const [userIp, setUserIp] = useState(null)
  const { isDemoActive, currentStep } = useDemo()
  
  // Inicializar supabase solo en el cliente
  useEffect(() => {
    const sb = getSupabase()
    if (sb) {
      setSupabase(sb)
    }
  }, [])
  
  // Estado para esperar callbacks
  const [isWaitingForCallback, setIsWaitingForCallbackState] = useState(() => {
    if (typeof window !== 'undefined' && sessionId) {
      return sessionStorage.getItem(`waiting_callback_${sessionId}`) === 'true'
    }
    return false
  })
  
  const setIsWaitingForCallback = (value) => {
    setIsWaitingForCallbackState(value)
    if (typeof window !== 'undefined' && sessionId) {
      if (value) {
        sessionStorage.setItem(`waiting_callback_${sessionId}`, 'true')
      } else {
        sessionStorage.removeItem(`waiting_callback_${sessionId}`)
      }
    }
  }
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [propertySets, setPropertySets] = useState([])
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState(null)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [showAudioPreview, setShowAudioPreview] = useState(false)
  const messagesEndRef = useRef(null)
  const audioPreviewRef = useRef(null)
  
  // Hook personalizado para callbacks
  const { callbacks, isListening, checkPendingCallbacks } = useCallbacks(sessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    console.log('📊 Messages state updated. Current length:', messages.length)
    console.log('📊 Current messages:', messages)
    scrollToBottom()
  }, [messages, propertySets, isLoading])

  // Cargar historial de sesiones
  useEffect(() => {
    if (sessionId && supabase) {
      loadSessionHistory()
    }
  }, [sessionId, supabase])
  
  // Restaurar borrador al montar/cambiar sesión
  useEffect(() => {
    if (!sessionId) return
    const draft = sessionStorage.getItem(`draft_${sessionId}`)
    if (draft && !inputText) {
      setInputText(draft)
    }
  }, [sessionId]) // Solo al montar o cambiar sesión
  
  // Guardar borrador en cada cambio
  useEffect(() => {
    if (!sessionId) return
    sessionStorage.setItem(`draft_${sessionId}`, inputText || '')
  }, [sessionId, inputText])
  
  // Auto-enviar borrador después del login - MEJORADO
  useEffect(() => {
    if (!sessionId || !user) return
    
    // Pequeño delay para asegurar que todo esté inicializado
    const timer = setTimeout(() => {
      const raw = sessionStorage.getItem('after_login_action')
      if (!raw) return
      
      try {
        const action = JSON.parse(raw)
        
        // Verificar que la acción es para esta sesión y es reciente (menos de 5 minutos)
        if (action?.type === 'send_draft' && 
            action?.sessionId === sessionId &&
            (Date.now() - action.timestamp < 5 * 60 * 1000)) {
          
          // Limpiar PRIMERO para evitar re-ejecución
          sessionStorage.removeItem('after_login_action')
          
          // Obtener el draft guardado
          const draft = (action.draft || sessionStorage.getItem(`draft_${sessionId}`) || '').trim()
          
          if (draft) {
            // Limpiar el draft storage
            sessionStorage.removeItem(`draft_${sessionId}`)
            
            // Actualizar el input con el draft (visual feedback)
            setInputText(draft)
            
            // Enviar el mensaje después de un pequeño delay
            setTimeout(() => {
              sendMessage(draft)
            }, 100)
          }
        } else if (action) {
          // Acción expirada o para otra sesión, limpiar
          sessionStorage.removeItem('after_login_action')
        }
      } catch (e) {
        console.error('Error processing after_login_action:', e)
        sessionStorage.removeItem('after_login_action')
      }
    }, 500) // Delay de 500ms para asegurar que todo esté listo
    
    return () => clearTimeout(timer)
  }, [user, sessionId]) // NO incluir sendMessage en las dependencias
  
  
  // Cargar historial con sanitización robusta
  const loadSessionHistory = async () => {
    if (!supabase || !sessionId) return
    
    try {
      console.log('🌐 Loading session history...')
      
      // Obtener IP del usuario usando endpoint propio
      const ipRes = await fetch('/api/ip', { cache: 'no-store' })
      const { ip } = await ipRes.json()
      console.log('🌐 User IP:', ip)
      setUserIp(ip)
      
      await supabase
        .from('chat_sessions')
        .upsert(
          { 
            session_id: sessionId,
            device_id: window?.deviceId || null,
            topic: 'Buscar propiedades para comprar',
            ip, 
            updated_at: new Date().toISOString() 
          },
          { onConflict: 'session_id' }
        )
      
      // Cargar últimos 30 días de historiales con esta IP
      const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString()
      
      const { data: allSessions, error } = await supabase
        .from('chat_sessions')
        .select('conversations, property_sets, session_id, created_at')
        .eq('ip', ip)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error loading by IP:', error)
        setShowWelcome(true)
        return
      }
      
      if (!allSessions || allSessions.length === 0) {
        console.log('📱 No previous sessions found')
        setShowWelcome(true)
        return
      }
      
      // SANITIZACIÓN ROBUSTA - Acepta esquemas antiguos y nuevos
      const allConversations = []
      const allPropertySets = []
      const seenIds = new Set()
      const seenSignatures = new Set()
      let fallbackCounter = 0
      
      for (const session of allSessions) {
        // Procesar mensajes con esquemas flexibles
        if (Array.isArray(session.conversations)) {
          for (const msg of session.conversations) {
            if (!msg) continue
            
            // ACEPTA ESQUEMAS ANTIGUOS: text/sender o content/type
            const rawContent = 
              typeof msg === 'string' 
                ? msg 
                : msg.content || msg.text || msg.message || ''
            
            const content = String(rawContent).trim()
            if (!content) continue
            
            // Mapear tipo/rol flexiblemente
            const type = msg.type || msg.sender || msg.role || 'assistant'
            
            // Timestamp con fallbacks
            const timestamp = msg.timestamp || msg.created_at || session.created_at || new Date().toISOString()
            
            // ID único y deduplicación que NO colapsa mensajes iguales de sesiones distintas
            const msgId = msg.id || `msg_${session.session_id}_${Date.now()}_${++fallbackCounter}`
            const signature = `${session.session_id}|${content}|${timestamp}|${type}`
            
            if (seenIds.has(msgId) || seenSignatures.has(signature)) continue
            seenIds.add(msgId)
            seenSignatures.add(signature)
            
            allConversations.push({
              id: msgId,
              content: content,
              type: type === 'user' || type === 'human' ? 'user' : 'assistant',
              timestamp: timestamp,
              session_id: session.session_id
            })
          }
        }
        
        // Procesar property sets
        if (Array.isArray(session.property_sets)) {
          for (const set of session.property_sets) {
            if (!set || !Array.isArray(set.properties)) continue
            if (set.properties.length === 0) continue
            
            const setId = set.id || `propset_${session.session_id}_${Date.now()}_${++fallbackCounter}`
            const timestamp = set.timestamp || set.created_at || session.created_at || new Date().toISOString()
            
            if (seenIds.has(setId)) continue
            seenIds.add(setId)
            
            allPropertySets.push({
              id: setId,
              properties: set.properties,
              timestamp: timestamp,
              session_id: session.session_id
            })
          }
        }
      }
      
      // Ordenar cronológicamente
      allConversations.sort((a, b) => 
        new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
      )
      
      allPropertySets.sort((a, b) => 
        new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
      )
      
      console.log(`📱 Loaded from IP ${ip}:`)
      console.log(`   - ${allConversations.length} messages`)
      console.log(`   - ${allPropertySets.length} property sets`)
      console.log(`   - From ${allSessions.length} sessions`)
      
      setMessages(allConversations)
      setPropertySets(allPropertySets)
      setShowWelcome(allConversations.length === 0)
      
      // Check callbacks después de cargar
      setTimeout(checkPendingCallbacks, 1000)
      
    } catch (error) {
      console.error('Error loading session history:', error)
      
      // Fallback: intentar cargar solo la sesión actual
      try {
        const { data: currentSession } = await supabase
          .from('chat_sessions')
          .select('conversations, property_sets')
          .eq('session_id', sessionId)
          .single()
        
        if (currentSession) {
          setMessages(currentSession.conversations || [])
          setPropertySets(currentSession.property_sets || [])
          setShowWelcome(!currentSession.conversations || currentSession.conversations.length === 0)
        }
      } catch (fallbackError) {
        console.error('Fallback también falló:', fallbackError)
        setShowWelcome(true)
      }
    }
  }

  // Suscripción a cambios en chat_sessions para sincronizar mensajes
  useEffect(() => {
    if (!sessionId || !supabase) return
  
    console.log('🔄 Setting up chat_sessions subscription for session:', sessionId)
    
    const channel = supabase
      .channel(`chat_sessions:${sessionId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chat_sessions', 
          filter: `session_id=eq.${sessionId}` 
        },
        (payload) => {
          console.log('🔄 Chat session updated from server:', payload)
          
          // Obtener mensajes del servidor
          const serverMessages = Array.isArray(payload.new?.conversations) 
            ? payload.new.conversations 
            : []
          
          // Sanitizar mensajes del servidor
          const seenSignatures = new Set()
          
          const mergedMessages = serverMessages
            .filter(msg => {
              // Validaciones básicas
              if (!msg || typeof msg !== 'object') return false
              if (!msg.content || typeof msg.content !== 'string') return false
              
              const content = msg.content.trim()
              if (!content) return false
              
              // Deduplicación por firma
              const signature = `${content}|${msg.timestamp || ''}|${msg.type || 'assistant'}`
              if (seenSignatures.has(signature)) return false
              seenSignatures.add(signature)
              
              return true
            })
            .map(msg => ({
              id: msg.id || `msg_sync_${sessionId}_${Date.now()}_${Math.random()}`,
              content: msg.content.trim(),
              type: msg.type || 'assistant',
              timestamp: msg.timestamp || payload.new.updated_at || new Date().toISOString(),
              session_id: sessionId
            }))
          
          console.log(`🔄 Synced ${mergedMessages.length} messages from server`)
          
          // CAMBIO: Usar Map para evitar duplicados
          setMessages(prevMessages => {
            // Crear un Map para deduplicar por ID
            const messageMap = new Map()
            
            // Agregar mensajes anteriores al Map
            prevMessages.forEach(msg => {
              if (msg.id) messageMap.set(msg.id, msg)
            })
            
            // Agregar/actualizar con mensajes del servidor (solo de esta sesión)
            mergedMessages.forEach(msg => {
              if (msg.session_id === sessionId) {
                messageMap.set(msg.id, msg)
              }
            })
            
            // Convertir Map a array y ordenar
            const dedupedMessages = Array.from(messageMap.values())
              .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
            
            console.log(`🔄 Total unique messages: ${dedupedMessages.length}`)
            return dedupedMessages
          })
                    
          // También sincronizar property_sets si vienen
          if (payload.new?.property_sets && Array.isArray(payload.new.property_sets)) {
            const serverPropertySets = payload.new.property_sets
              .filter(set => set && Array.isArray(set.properties) && set.properties.length > 0)
              .map(set => ({
                id: set.id || `propset_sync_${sessionId}_${Date.now()}`,
                properties: set.properties,
                timestamp: set.timestamp || set.created_at || payload.new.updated_at,
                session_id: sessionId
              }))
              .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
            
            setPropertySets(prevSets => {
              // Mantener sets de OTRAS sesiones, actualizar solo la actual
              const otherSessionSets = prevSets.filter(s => s.session_id !== sessionId)
              const merged = [...otherSessionSets, ...serverPropertySets]
              merged.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
              console.log(`🔄 Updated property sets for session ${sessionId}`)
              return merged
            })
            console.log(`🔄 Synced ${serverPropertySets.length} property sets from server`)
          }
        }
      )
      .subscribe((status) => {
        console.log('🔄 Chat session subscription status:', status)
      })
  
    // Cleanup
    return () => {
      console.log('🔄 Cleaning up chat_sessions subscription')
      supabase.removeChannel(channel)
    }
  }, [sessionId, supabase])

  // Procesar nuevos callbacks
  useEffect(() => {
    if (callbacks.length > 0) {
      const latestCallback = callbacks[callbacks.length - 1]
      processCallback(latestCallback)
    }
  }, [callbacks])

  const processCallback = async (callback) => {
    // Desactivar estado de espera cuando llega cualquier callback
    setIsWaitingForCallback(false)
    
    try {
      const payload = callback.payload
      console.log('Processing callback:', payload)
      
      if (payload.type === 'assistant_message') {
        addMessage(payload.message, 'assistant')
      } 
      else if (payload.type === 'properties_search_completed') {
        const propertiesFound = callback.properties || []
        
        console.log(`🏠 Processing ${propertiesFound.length} properties`)
        
        if (propertiesFound.length > 0) {
          const newPropertySet = {
            id: Date.now(),
            properties: propertiesFound,
            timestamp: new Date().toISOString()
          }
          await savePropertySetToCurrentSession(newPropertySet)
          addMessage(`¡Perfecto! He encontrado ${propertiesFound.length} propiedades que coinciden con tus criterios:`, 'assistant')
        } else {
          addMessage('No he encontrado propiedades que coincidan exactamente con tus criterios. ¿Quieres que ajuste los filtros de búsqueda?', 'assistant')
        }
        
        setIsLoading(false)
      } 
      else if (payload.type === 'search_started') {
        addMessage('Entendido, estoy buscando propiedades que coincidan con tus criterios. Esto puede tomar unos momentos...', 'assistant')
      }
      else if (payload.properties && Array.isArray(payload.properties)) {
        console.log(`🏠 N8N Real Format: Processing ${payload.properties.length} properties`)
        
        if (payload.message) {
          addMessage(payload.message, 'assistant')
        }
        
        // Crear y normalizar nuevo conjunto de propiedades
        const newPropertySet = {
          id: Date.now(),
          properties: payload.properties,
          timestamp: new Date().toISOString()
        }
        
        // La función ahora actualiza el estado local automáticamente
        await savePropertySetToCurrentSession(newPropertySet)
        setIsLoading(false)
      }
      else {
        console.log('Unknown callback type. Payload:', payload)
        
        if (payload.message) {
          addMessage(payload.message, 'assistant')
        }
        
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error processing callback:', error)
      addMessage('Error procesando respuesta', 'error')
      setIsLoading(false)
      setIsWaitingForCallback(false)
    }
  }

  const addMessage = async (content, type = 'user') => {
    if (!content || !content.trim()) {
      console.warn('Attempted to add empty message')
      return
    }
  
    const trimmed = content.trim()
    console.log(`📝 addMessage called: type="${type}", content="${trimmed.substring(0, 50)}..."`)
    
    const newMessage = {
      id: `msg_${sessionId || 'anon'}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      content: trimmed,
      type,                                     
      timestamp: new Date().toISOString(),
      session_id: sessionId,                    
      created_at: new Date().toISOString(),     
    }
  
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage]
      console.log(`📝 Previous length: ${prevMessages.length}, New length: ${updatedMessages.length}`)
  
      clearTimeout(window.saveTimeout)
      window.saveTimeout = setTimeout(() => {
        saveConversation(updatedMessages)
        // Limpiar el borrador si el mensaje se envió
        if (type === 'user' && sessionId) {
          try { 
            sessionStorage.removeItem(`draft_${sessionId}`)  
          } catch {}
        }
      }, 1000)
  
      return updatedMessages
    })
  
    setShowWelcome(false)
  }

  const saveConversation = async (updatedMessages) => {
    if (!supabase) return // Guard
    
    try {
      console.log('💾 Saving conversation with', updatedMessages.length, 'messages')
      console.log('💾 Messages to save:', updatedMessages)
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          conversations: updatedMessages,
          device_id: window?.deviceId || null,
          topic: 'Buscar propiedades para comprar',
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
      
      if (error) {
        console.log('💾 Update failed, trying upsert:', error)
        
        const { data: upsertData, error: upsertError } = await supabase
          .from('chat_sessions')
          .upsert({
            session_id: sessionId,
            conversations: updatedMessages,
            device_id: window?.deviceId || null,
            topic: 'Buscar propiedades para comprar',
            updated_at: new Date().toISOString()
          })
        
        if (upsertError) {
          throw upsertError
        }
      }
        
      console.log('💾 Conversation saved successfully')
    } catch (error) {
      console.error('💾 Error saving conversation:', error)
    }
  }

  // CAMBIO: Mejorar savePropertySetToCurrentSession con verificación de duplicados
  const savePropertySetToCurrentSession = async (incomingSet) => {
    if (!sessionId || !incomingSet || !supabase) return null

    try {
      // Normalizar completamente el set
      const normalizedSet = {
        id: incomingSet.id || `propset_${sessionId}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
        properties: Array.isArray(incomingSet.properties) ? incomingSet.properties : [],
        timestamp: incomingSet.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
        session_id: sessionId,
        type: 'properties',
      }

      // Verificar si ya existe este set antes de agregarlo
      setPropertySets(prev => {
        // Verificar si ya existe por ID
        if (prev.some(set => set.id === normalizedSet.id)) {
          console.log('⚠️ Property set already exists, skipping:', normalizedSet.id)
          return prev
        }
        
        // Verificar si es un duplicado por timestamp cercano (dentro de 2 segundos)
        const recentDuplicate = prev.find(set => {
          const timeDiff = Math.abs(new Date(set.timestamp) - new Date(normalizedSet.timestamp))
          return timeDiff < 2000 && set.session_id === sessionId
        })
        
        if (recentDuplicate) {
          console.log('⚠️ Recent duplicate property set detected, skipping')
          return prev
        }
        
        // Agregar el nuevo set
        const updated = [...prev, normalizedSet]
        
        // Guardar en Supabase de forma asíncrona
        supabase
          .from('chat_sessions')
          .select('property_sets')
          .eq('session_id', sessionId)
          .single()
          .then(({ data: currentData }) => {
            const currentSets = currentData?.property_sets || []
            
            // Verificar que no esté duplicado en DB
            if (!currentSets.some(s => s.id === normalizedSet.id)) {
              currentSets.push(normalizedSet)
              
              return supabase
                .from('chat_sessions')
                .update({
                  property_sets: currentSets,
                  last_properties: normalizedSet.properties,
                  device_id: window?.deviceId || null,
                  topic: 'Buscar propiedades para comprar',
                  updated_at: new Date().toISOString()
                })
                .eq('session_id', sessionId)
            }
          })
          .catch(error => {
            console.error('💾 Error saving property set:', error)
          })
        
        return updated
      })
      
      console.log('💾 Property set processed')
      return normalizedSet
    } catch (error) {
      console.error('💾 Error in savePropertySetToCurrentSession:', error)
      return null
    }
  }

  const savePropertySetsToSession = async (propertySets) => {
    if (!sessionId || !propertySets || propertySets.length === 0 || !supabase) return // Guard
    
    try {
      console.log('💾 Saving property sets to session:', propertySets.length)
      
      await supabase
        .from('chat_sessions')
        .update({
          property_sets: propertySets,
          last_properties: propertySets[propertySets.length - 1]?.properties || [],
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        
      console.log('💾 Property sets saved to session successfully')
    } catch (error) {
      console.error('💾 Error saving property sets to session:', error)
    }
  }

  const sendVoiceMessage = async (audioBlob, duration) => {
    try {
      console.log('🎤 Sending voice message with duration:', duration)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1]
        
        addMessage(`🎤 Nota de voz (${duration}s)`, "user")
        setIsLoading(true)
        
        try {
          console.log('🎤 Sending to API with audio data length:', base64Audio.length)
          const result = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `🎤 Nota de voz (${duration}s)`,
              message_type: "voice",
              audio_data: base64Audio,
              audio_duration: duration,
              session_id: sessionId,
              device_id: window?.deviceId || null,
              topic: 'Buscar propiedades para comprar',
              timestamp: new Date().toISOString(),
              source: "web"
            })
          })
          
          const data = await result.json()
          console.log('🎤 Voice API Response:', data)
          
          if (result.ok) {
            if (data.assistant_reply) {
              setTimeout(() => {
                addMessage(data.assistant_reply, "assistant")
                
                if (data.search_started) {
                  setIsWaitingForCallback(true)
                  setIsLoading(false)
                } else {
                  setIsLoading(false)
                }
              }, 500)
            } else {
              setIsLoading(false)
            }
          } else {
            console.error('🎤 Voice API Error:', data)
            setIsLoading(false)
          }
        } catch (error) {
          console.error("Error sending voice message:", error)
          setIsLoading(false)
        }
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error("Error processing voice message:", error)
    }
  }

  // Helper para verificar si hay sesión activa
  const getIsLoggedIn = async () => {
    if (user) return true
    try {
      const sb = supabase || getSupabase()
      if (!sb) return false
      const { data } = await sb.auth.getUser() // getUser es más confiable que getSession
      return !!data?.user
    } catch {
      return false
    }
  }
  
  // FUNCIÓN MEJORADA: sendMessage sin agregar mensaje prematuramente
  const sendMessage = async (overrideText) => {
    // BLOQUEAR TODO en modo demo
   if (isDemoActive) {
    // NO loaders, NO toasts, NO llamadas
    setIsLoading(false)
    setIsPreparing(false)
    setIsRecording(false)
    
    // Simular mensaje del usuario
    const userMessage = { 
      content: inputText || 'Un piso en Madrid, de al menos 3 habitaciones, en una zona cercana a un metro por menos de 450k€.', 
      type: 'user', 
      timestamp: new Date().toISOString(),
      id: `demo-user-${Date.now()}`
    }
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setShowWelcome(false)
    
    // Simular respuesta después de 2 segundos
    setTimeout(() => {
      const botMessage = {
        content: '¡Perfecto! He encontrado 36 propiedades que encajan con tus criterios en Madrid.',
        type: 'assistant',
        timestamp: new Date().toISOString(),
        id: `demo-bot-${Date.now()}`
      }
      setMessages(prev => [...prev, botMessage])
      
      // Agregar 5 propiedades de ejemplo con imágenes
      setTimeout(() => {
        const demoProperties = [
          {
            property_id: 'demo1',
            title: 'Piso luminoso en Chamberí',
            location: 'Calle Fuencarral, Madrid',
            neighborhood: 'Chamberí',
            municipality: 'Madrid',
            price: 425000,
            pricePerSqm: 4473,
            bedrooms: 3,
            bathrooms: 2,
            builtArea: 95,
            usefulArea: 85,
            lat: 40.4268,
            lng: -3.7038,
            thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
            images: [
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
              'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800'
            ]
          },
          {
            property_id: 'demo2',
            title: 'Ático con terraza en Retiro',
            location: 'Calle Alcalá, Madrid',
            neighborhood: 'Retiro',
            municipality: 'Madrid',
            price: 445000,
            pricePerSqm: 4222,
            bedrooms: 3,
            bathrooms: 2,
            builtArea: 105,
            usefulArea: 95,
            lat: 40.4150,
            lng: -3.6823,
            thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
            images: [
              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
              'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
              'https://images.unsplash.com/photo-1558442086-8ea19a79cd4d?w=800'
            ]
          },
          {
            property_id: 'demo3',
            title: 'Dúplex reformado en Malasaña',
            location: 'Calle San Bernardo, Madrid',
            neighborhood: 'Malasaña',
            municipality: 'Madrid',
            price: 395000,
            pricePerSqm: 4388,
            bedrooms: 3,
            bathrooms: 2,
            builtArea: 90,
            usefulArea: 82,
            lat: 40.4265,
            lng: -3.7055,
            thumbnail: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=300&fit=crop',
            images: [
              'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800',
              'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
              'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'
            ]
          },
          {
            property_id: 'demo4',
            title: 'Piso exterior en Salamanca',
            location: 'Calle Serrano, Madrid',
            neighborhood: 'Salamanca',
            municipality: 'Madrid',
            price: 520000,
            pricePerSqm: 5200,
            bedrooms: 3,
            bathrooms: 2,
            builtArea: 100,
            usefulArea: 90,
            lat: 40.4305,
            lng: -3.6845,
            thumbnail: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
            images: [
              'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
              'https://images.unsplash.com/photo-1522444121501-72a29d632e31?w=800'
            ]
          },
          {
            property_id: 'demo5',
            title: 'Apartamento moderno en Chueca',
            location: 'Plaza de Chueca, Madrid',
            neighborhood: 'Chueca',
            municipality: 'Madrid',
            price: 410000,
            pricePerSqm: 4555,
            bedrooms: 3,
            bathrooms: 2,
            builtArea: 90,
            usefulArea: 80,
            lat: 40.4226,
            lng: -3.6977,
            thumbnail: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400&h=300&fit=crop',
            images: [
              'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800',
              'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
              'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800'
            ]
          }
        ]
        
        setPropertySets(prev => [...prev, {
          id: `demo-set-${Date.now()}`,
          properties: demoProperties,
          timestamp: new Date().toISOString()
        }])
        
        // Marcar el carousel como data-demo para el siguiente paso
        setTimeout(() => {
          const carousel = document.querySelector('.flex.overflow-x-auto')
          if (carousel) {
            carousel.setAttribute('data-demo', 'properties-carousel')
          }
        }, 100)
      }, 1000)
    }, 2000)
    
    return // NO EJECUTAR NADA MÁS
  }
    const text = (overrideText ?? inputText).trim()
    if (!text || isLoading) return
    
    console.log('🚀 sendMessage called with:', text)
    console.log('🚀 Current state:', {
      propertySets: propertySets.length,
      user: !!user,
      sessionId
    })
    
    // Verificar sesión PRIMERO, antes de agregar el mensaje
    const loggedIn = await getIsLoggedIn()
    console.log('🚀 Login status:', loggedIn)
    console.log('🚀 Should require auth?', propertySets.length > 0 && !loggedIn)
    
    // Si ya hubo búsquedas y NO hay login, guardamos para después del auth
    if (propertySets.length > 0 && !loggedIn) {
      console.log('🚀 Checking auth requirements...')
      
      // NUEVO: Evitar pedir login si acabas de autenticarte hace < 3s (rehidratación lenta)
      if (window.justAuthedAt && Date.now() - window.justAuthedAt < 3000) {
        console.log('🚀 Just authenticated, retrying in a moment...')
        setTimeout(() => sendMessage(text), 600)
        return
      }
      
      console.log('🚀 Triggering auth flow...')
      
      // Guardar el mensaje pendiente y el draft actual
      const action = {
        type: 'send_draft',
        sessionId: sessionId,
        draft: text,
        timestamp: Date.now()
      }
      sessionStorage.setItem('after_login_action', JSON.stringify(action))
      sessionStorage.setItem(`draft_${sessionId}`, text)
      
      // NO limpiar el input todavía (para que el usuario vea su mensaje)
      // NO agregar el mensaje todavía
      
      // Mostrar auth modal
      if (typeof window !== 'undefined' && window.requireAuth) {
        console.log('🚀 Calling window.requireAuth')
        window.requireAuth('Inicia sesión para continuar la conversación')
      } else {
        console.error('🚀 window.requireAuth not found!')
        addMessage('Error: Sistema de autenticación no disponible. Recarga la página.', 'assistant')
      }
      return
    }
    
    console.log('🚀 No auth needed, sending message directly...')
    
    // Si llegamos aquí, podemos enviar el mensaje
    setInputText('')
    addMessage(text, 'user')
    setIsLoading(true)
    
    try {
      const result = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          message_type: "text",
          session_id: sessionId,
          device_id: window?.deviceId || null,
          topic: 'Buscar propiedades para comprar',
          timestamp: new Date().toISOString(),
          source: 'web'
        })
      })
      
      const data = await result.json()
      console.log('API Response:', data)
      
      if (result.ok) {
        console.log('✅ Message sent successfully')
        
        if (data.assistant_reply) {
          setTimeout(() => {
            addMessage(data.assistant_reply, 'assistant')
            
            if (data.search_started) {
              setIsWaitingForCallback(true)
            }
            setIsLoading(false)
          }, 500)
        } else {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
        addMessage('Lo siento, hubo un problema. Intenta de nuevo.', 'assistant')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
      addMessage('Error al enviar el mensaje. Por favor intenta de nuevo.', 'assistant')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleRecording = async () => {
    if (!isRecording && !isPreparing) {
      setIsPreparing(true)
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
        })
        
        const chunks = []
        let startTime = null
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        
        recorder.onstart = () => {
          startTime = Date.now()
          setIsPreparing(false)
          setIsRecording(true)
          setRecordingDuration(1)
          console.log('🎤 Recording actually started')
          
          const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000) + 1
            setRecordingDuration(elapsed)
            
            if (elapsed >= 60) {
              recorder.stop()
              setIsRecording(false)
              clearInterval(interval)
              setRecordingInterval(null)
            }
          }, 1000)
          setRecordingInterval(interval)
        }
        
        recorder.onstop = () => {
          const actualDuration = startTime ? Math.floor((Date.now() - startTime) / 1000) : recordingDuration
          console.log('🎤 Recording stopped. Actual duration:', actualDuration)
          
          const audioBlob = new Blob(chunks, { type: recorder.mimeType })
          const audioUrl = URL.createObjectURL(audioBlob)
          setRecordedAudio({ blob: audioBlob, url: audioUrl, duration: actualDuration })
          setShowAudioPreview(true)
          setShowWelcome(false)
          
          setIsRecording(false)
          setIsPreparing(false)
          setRecordingDuration(0)
          
          stream.getTracks().forEach(track => track.stop())
        }
        
        setMediaRecorder(recorder)
        recorder.start()
        
      } catch (error) {
        console.error("Error accessing microphone:", error)
        setIsPreparing(false)
        addMessage("No se pudo acceder al micrófono. Verifica los permisos.", "error")
      }
    } else {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop()
      }
      if (recordingInterval) {
        clearInterval(recordingInterval)
        setRecordingInterval(null)
      }
      setIsRecording(false)
      setIsPreparing(false)
    }
  }

  const playPreview = () => {
    if (audioPreviewRef.current) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause()
        setIsPlayingPreview(false)
      } else {
        audioPreviewRef.current.play()
        setIsPlayingPreview(true)
      }
    }
  }

  const sendAudioMessage = () => {
    if (recordedAudio) {
      sendVoiceMessage(recordedAudio.blob, recordedAudio.duration)
      cancelAudioMessage()
    }
  }

  const cancelAudioMessage = () => {
    setShowAudioPreview(false)
    setRecordedAudio(null)
    setIsPlayingPreview(false)
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url)
    }
  }

  const [selectedProperty, setSelectedProperty] = useState(null)

  useEffect(() => {
    console.log('🆔 SessionId changed:', sessionId)
    console.log('🆔 SavedProperties:', Array.from(savedProperties || []))
  }, [sessionId, savedProperties])

  const handlePropertyClick = (property) => {
    setSelectedProperty({
      ...property,
      images_count: property.images?.length ?? 0,
      images: property.images,
      thumbnail: property.thumbnail,
      full_property: property
    })
  }

  const handleClosePropertyDetail = () => {
    setSelectedProperty(null)
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      }
    }, 50)
  }

  const handlePropertyMessage = (message) => {
    setSelectedProperty(null)
    addMessage(message, 'user')
  }

  const getCombinedItems = () => {
    const items = []
    
    messages.forEach(message => {
      items.push({ type: 'message', data: message, timestamp: message.timestamp })
    })
    
    propertySets.forEach((propertySet, index) => {
      items.push({ 
        type: 'properties', 
        data: propertySet.properties, 
        timestamp: propertySet.timestamp,
        id: `properties-${propertySet.id}`
      })
    })
    
    return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  const getPlaceholderText = () => {
    if (isPreparing) return "Preparando micrófono..."
    if (isRecording) return `Grabando... ${recordingDuration}s`
    return "Escribe o mantén pulsado para hablar"
  }

  const getButtonColor = () => {
    if (isPreparing) return "#f59e0b"
    if (isRecording) return "#ef4444"
    return inputText.trim() ? "#0A0A23" : "#D1D5DB"
  }

  if (selectedProperty) {
    return (
      <PropertyDetailView
        property={selectedProperty}
        onClose={handleClosePropertyDetail}
        onSendMessage={handlePropertyMessage}
        savedProperties={savedProperties}
        onToggleSave={onToggleSave} 
      />
    )
  }

  if (showWelcome && !(showAudioPreview && recordedAudio)) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-8 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#0A0A23] mb-2">
              Hola, soy Luci
            </h2>
            <p className="text-gray-600 mb-8">
              Tu asistente personal. Dime, ¿qué buscas?
            </p>
          </div>
        </div>

        <div className="px-8 pb-4">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isListening ? 'Conectado' : 'Conectando...'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-2.5 gap-2">
            <input
              data-demo="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-[#0A0A23]"
              disabled={isLoading || isPreparing || isRecording}
            />
            <button
              data-demo="send-button"
              onClick={() => inputText.trim() ? sendMessage() : toggleRecording()}
              disabled={isLoading}
              className={`min-w-[52px] min-h-[52px] w-13 h-13 rounded-full text-white flex items-center justify-center transition-colors disabled:bg-gray-300 active:scale-95 ${
                (isPreparing || isRecording) ? "animate-pulse" : ""
              }`}
              style={{ backgroundColor: getButtonColor() }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : inputText.trim() ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L12 22M12 2L5 9M12 2L19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (isPreparing || isRecording) ? (
                <MicOff size={18} />
              ) : (
                <Mic size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render principal del chat
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {getCombinedItems().map((item, index) => {
            if (item.type === 'message') {
              const message = item.data
              // Guard para no renderizar mensajes vacíos
              if (!message?.content?.trim()) return null
              const key = message.id || `msg-${index}`
              
              return (
                <div
                  key={key}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    data-demo="chat-message"
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gray-200 text-[#0A0A23] rounded-br-md from-user'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-white text-[#0A0A23] border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              )
            } else if (item.type === 'properties') {
              // Guard para no renderizar si no hay propiedades
              if (!Array.isArray(item.data) || item.data.length === 0) return null
              
              return (
                <div key={item.id} className="-mx-4">
                  <PropertyResults 
                    properties={item.data} 
                    onPropertyClick={handlePropertyClick}
                    savedProperties={savedProperties}
                    onToggleSave={onToggleSave}
                  />
                </div>
              )
            }
            return null
          })}
          
          {/* Typing normal cuando esperamos respuesta del webhook */}
          {isLoading && !isWaitingForCallback && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Animación de búsqueda cuando esperamos callback */}
          {isWaitingForCallback && (
            <div className="flex justify-start">
              <SearchingAnimation />
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {showAudioPreview && recordedAudio && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={playPreview}
                className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center hover:bg-yellow-600 transition-colors"
              >
                {isPlayingPreview ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">Nota de voz ({recordedAudio.duration}s)</p>
                <p className="text-xs text-gray-600">Toca play para escuchar</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={cancelAudioMessage}
                className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
              <button
                onClick={sendAudioMessage}
                className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Check size={20} />
              </button>
            </div>
          </div>
          <audio
            ref={audioPreviewRef}
            src={recordedAudio?.url}
            onEnded={() => setIsPlayingPreview(false)}
            style={{ display: 'none' }}
          />
        </div>
      )}

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-2.5 gap-2">
          <input
            data-demo="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            className="flex-1 bg-transparent px-4 py-3 outline-none text-[#0A0A23]"
            disabled={isLoading || isPreparing || isRecording || showAudioPreview}
          />
          <button
            data-demo="send-button"
            onClick={() => inputText.trim() ? sendMessage() : toggleRecording()}
            disabled={isLoading || showAudioPreview}
            className={`min-w-[52px] min-h-[52px] w-13 h-13 rounded-full text-white flex items-center justify-center hover:bg-gray-700 transition-all active:scale-95 ${
              (isPreparing || isRecording) ? "animate-pulse" : ""
            }`}
            style={{ backgroundColor: getButtonColor() }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : inputText.trim() ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L12 22M12 2L5 9M12 2L19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (isPreparing || isRecording) ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
