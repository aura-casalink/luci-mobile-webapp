'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Mic, MicOff, Play, Pause, X, Check } from 'lucide-react'
import { useCallbacks } from '../../hooks/useCallbacks'
import PropertyResults from '../properties/PropertyResults'
import PropertyDetailView from '@/app/components/properties/PropertyDetailView'

export default function ChatInterface({ sessionId, savedProperties, onToggleSave }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false) // Nuevo estado
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
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('conversations, property_sets, last_properties') 
        .eq('session_id', sessionId)
        .single()

      console.log('📄 Supabase response:', { data, error })

      if (data && data.conversations && data.conversations.length > 0) {
        console.log('📄 Loading existing messages:', data.conversations.length, 'messages')
        setMessages(data.conversations)
        setShowWelcome(false)
      }

      if (data && data.property_sets && data.property_sets.length > 0) {
        console.log('🏠 Loading property sets:', data.property_sets.length, 'sets')
        setPropertySets(data.property_sets)
      } else if (data && data.last_properties && data.last_properties.length > 0) {
        // Fallback para compatibilidad con formato anterior
        console.log('🏠 Loading existing properties (legacy):', data.last_properties.length, 'properties')
        const existingSet = {
          id: 'existing',
          properties: data.last_properties,
          timestamp: new Date(data.updated_at || Date.now()).toISOString()
        }
        setPropertySets([existingSet])
      }
    } catch (error) {
      console.log('📄 Error loading existing data:', error)
    }
  }

  const processCallback = (callback) => {
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
        
        setPropertySets(prev => {
          const newSets = [...prev, newPropertySet]
          savePropertySetsToSession(newSets) // Guardar todo el array
          return newSets
        })
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
            ip: 'web-app'
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

  const savePropertySetsToSession = async (propertySets) => {
    if (!sessionId || !propertySets || propertySets.length === 0) return
    
    try {
      console.log('💾 Saving property sets to session:', propertySets.length)
      
      await supabase
        .from('chat_sessions')
        .update({
          property_sets: propertySets, // Guardar TODOS los conjuntos
          last_properties: propertySets[propertySets.length - 1]?.properties || [], // Mantener compatibilidad
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
      // Convertir audio a base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1] // Remover "data:audio/...;base64,"
        
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
                if (!data.search_started) {
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
            
            if (!data.search_started) {
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
      // Empezar preparación
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
        
        // Cuando realmente empiece a grabar
        recorder.onstart = () => {
          startTime = Date.now()
          setIsPreparing(false) // Ya no preparando
          setIsRecording(true)  // Ahora sí grabando
          setRecordingDuration(1) // Empezar en 1 segundo
          console.log('🎤 Recording actually started')
          
          // Contador sincronizado
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
          
          // Limpiar estados
          setIsRecording(false)
          setIsPreparing(false)
          setRecordingDuration(0)
          
          // Parar stream
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
      // Parar grabación
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

  // Combinar mensajes y propiedades en orden cronológico
  const getCombinedItems = () => {
    const items = []
    
    // Añadir todos los mensajes
    messages.forEach(message => {
      items.push({ type: 'message', data: message, timestamp: message.timestamp })
    })
    
    // Añadir cada conjunto de propiedades
    propertySets.forEach((propertySet, index) => {
      items.push({ 
        type: 'properties', 
        data: propertySet.properties, 
        timestamp: propertySet.timestamp,
        id: `properties-${propertySet.id}`
      })
    })
    
    // Ordenar por timestamp
    return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  // Función para obtener texto del placeholder
  const getPlaceholderText = () => {
    if (isPreparing) return "Preparando micrófono..."
    if (isRecording) return `Grabando... ${recordingDuration}s`
    return "Escribe o mantén pulsado para hablar"
  }

  // Función para obtener color del botón
  const getButtonColor = () => {
    if (isPreparing) return "#f59e0b" // Amarillo/naranja
    if (isRecording) return "#ef4444" // Rojo
    return inputText.trim() ? "#0A0A23" : "#D1D5DB" // Azul oscuro o gris
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
          
          {isLoading && (
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
