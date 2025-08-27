'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Mic, MicOff, Play, Pause, X, Check } from 'lucide-react'
import { useCallbacks } from '../../hooks/useCallbacks'
import PropertyResults from '../properties/PropertyResults'
import PropertyDetailView from '@/app/components/properties/PropertyDetailView'
import SearchingAnimation from './SearchingAnimation'

export default function ChatInterface({ sessionId, savedProperties, onToggleSave }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Nuevo estado para esperar callbacks
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
  }, [messages, propertySets])

  // Cargar mensajes existentes de la sesión
  useEffect(() => {
    if (sessionId) {
      loadExistingMessages()
      // Verificar callbacks pendientes al cargar
      setTimeout(checkPendingCallbacks, 1000)
    }
  }, [sessionId])

  // Procesar nuevos callbacks
  useEffect(() => {
    if (callbacks.length > 0) {
      const latestCallback = callbacks[callbacks.length - 1]
      processCallback(latestCallback)
    }
  }, [callbacks])

  const loadExistingMessages = async () => {
    try {
      console.log('📄 loadExistingMessages called for session:', sessionId)
      
      const { data: currentSession } = await supabase
        .from('chat_sessions')
        .select('conversations, property_sets, last_properties, ip')
        .eq('session_id', sessionId)
        .single()
      
      if (currentSession?.ip && currentSession.ip !== 'unknown' && currentSession.ip !== 'web-app') {
        // Cargar TODAS las sesiones con esta IP
        const { data: allSessions } = await supabase
          .from('chat_sessions')
          .select('conversations, property_sets, session_id, created_at')
          .eq('ip', currentSession.ip)
          .order('created_at', { ascending: true })
        
        if (allSessions && allSessions.length > 0) {
          // Combinar todas las conversaciones
          const allConversations = []
          const allPropertySets = []
          
          allSessions.forEach(session => {
            // Agregar conversaciones
            if (session.conversations && Array.isArray(session.conversations)) {
              allConversations.push(...session.conversations)
            }
            
            // Agregar property_sets
            if (session.property_sets && Array.isArray(session.property_sets)) {
              allPropertySets.push(...session.property_sets)
            }
          })
          
          // Ordenar conversaciones por timestamp
          allConversations.sort((a, b) => 
            new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
          )
          
          // Ordenar property_sets por timestamp
          allPropertySets.sort((a, b) => 
            new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
          )
          
          console.log(`📄 Loading from IP ${currentSession.ip}:`)
          console.log(`   - ${allConversations.length} messages from ${allSessions.length} sessions`)
          console.log(`   - ${allPropertySets.length} property sets`)
          
          setMessages(allConversations)
          setPropertySets(allPropertySets)
          setShowWelcome(allConversations.length === 0)
        }
      } else if (currentSession?.conversations) {
        // Fallback: solo sesión actual si no hay IP válida
        console.log('📄 Loading session only (no valid IP)')
        setMessages(currentSession.conversations || [])
        setPropertySets(currentSession.property_sets || [])
        setShowWelcome(!currentSession.conversations || currentSession.conversations.length === 0)
      }
    } catch (error) {
      console.log('📄 Error loading existing data:', error)
    }
  }

  const processCallback = (callback) => {
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
          setPropertySets(prev => [...prev, newPropertySet])
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
        
        // Crear nuevo conjunto de propiedades con timestamp actual
        const newPropertySet = {
          id: Date.now(),
          properties: payload.properties,
          timestamp: new Date().toISOString()
        }
        
        setPropertySets(prev => [...prev, newPropertySet])
        savePropertySetToCurrentSession(newPropertySet)
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
    console.log(`📝 addMessage called: type="${type}", content="${content?.substring(0, 50)}..."`)
    
    const newMessage = {
      id: `msg_${Date.now()}_${messages.length}`,
      content,
      type,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage]
      console.log(`📝 Using updater function. Previous length: ${prevMessages.length}, New length: ${updatedMessages.length}`)
      
      clearTimeout(window.saveTimeout)
      window.saveTimeout = setTimeout(() => {
        saveConversation(updatedMessages)
      }, 1000)
      
      return updatedMessages
    })
    
    setShowWelcome(false)
  }

  const saveConversation = async (updatedMessages) => {
    try {
      console.log('💾 Saving conversation with', updatedMessages.length, 'messages')
      console.log('💾 Messages to save:', updatedMessages)
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          conversations: updatedMessages,
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
            updated_at: new Date().toISOString(),
            device_id: sessionId,
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

  const savePropertySetToCurrentSession = async (newPropertySet) => {
    if (!sessionId || !newPropertySet) return
    
    try {
      // Primero obtener los property_sets actuales de SOLO esta sesión
      const { data: currentData } = await supabase
        .from('chat_sessions')
        .select('property_sets')
        .eq('session_id', sessionId)
        .single()
      
      const currentSessionSets = currentData?.property_sets || []
      currentSessionSets.push(newPropertySet)
      
      console.log('💾 Saving new property set to current session only')
      
      await supabase
        .from('chat_sessions')
        .update({
          property_sets: currentSessionSets,
          last_properties: newPropertySet.properties,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
    } catch (error) {
      console.error('💾 Error saving property set:', error)
    }
  }

  const savePropertySetsToSession = async (propertySets) => {
    if (!sessionId || !propertySets || propertySets.length === 0) return
    
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

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return
    
    const message = inputText.trim()
    setInputText('')
    
    addMessage(message, 'user')
    setIsLoading(true)
    
    try {
      const result = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          message_type: "text",
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          source: 'web'
        })
      })
      
      const data = await result.json()
      console.log('API Response:', data)
      
      if (result.ok) {
        console.log('✅ Message sent successfully')
        console.log('✅ result.assistant_reply:', data.assistant_reply)
        console.log('✅ result.search_started:', data.search_started)
        
        if (data.assistant_reply) {
          setTimeout(() => {
            addMessage(data.assistant_reply, 'assistant')
            
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
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
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
      images_count: property.images?.length,
      images: property.images,
      thumbnail: property.thumbnail,
      full_property: property
    })
    setSelectedProperty(property)
  }

  const handleClosePropertyDetail = () => {
    setSelectedProperty(null)
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'instant' })
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

  if (showWelcome) {
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
          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-[#0A0A23]"
              disabled={isLoading || isPreparing || isRecording}
            />
            <button
              onClick={() => inputText.trim() ? sendMessage() : toggleRecording()}
              disabled={isLoading}
              className={`w-12 h-12 rounded-full text-white flex items-center justify-center transition-colors disabled:bg-gray-300 ${
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {getCombinedItems().map((item, index) => {
            if (item.type === 'message') {
              const message = item.data
              return (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gray-200 text-[#0A0A23] rounded-br-md'
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
        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            className="flex-1 bg-transparent px-4 py-3 outline-none text-[#0A0A23]"
            disabled={isLoading || isPreparing || isRecording || showAudioPreview}
          />
          <button
            onClick={() => inputText.trim() ? sendMessage() : toggleRecording()}
            disabled={isLoading || showAudioPreview}
            className={`w-12 h-12 rounded-full text-white flex items-center justify-center hover:bg-gray-700 transition-colors ${
              (isPreparing || isRecording) ? "animate-pulse" : ""
            }`}
            style={{ backgroundColor: getButtonColor() }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : inputText.trim() ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
