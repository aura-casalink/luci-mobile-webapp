'use client'
import { useState, useEffect } from 'react'
import BottomNavigation from './components/layout/BottomNavigation'
import TopNavigation from './components/layout/TopNavigation'
import ChatInterface from './components/chat/ChatInterface'
import SavedPropertiesContainer from './components/saved/SavedPropertiesContainer'
import { useSavedProperties } from './hooks/useSavedProperties'
import NearbyContainer from './components/nearby/NearbyContainer'
import ExploreContainer from './components/explore/ExploreContainer'
import AuthModal from './components/auth/AuthModal'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

// Dentro del componente, después de los estados existentes:
const [user, setUser] = useState(null)
const [showAuthModal, setShowAuthModal] = useState(false)
const [authMessage, setAuthMessage] = useState('')
const supabaseAuth = createBrowserSupabaseClient()

// Verificar sesión al cargar
useEffect(() => {
  supabaseAuth.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    // Hacer disponible globalmente
    window.currentUser = session?.user ?? null
  })

  const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
    window.currentUser = session?.user ?? null
  })

  return () => subscription.unsubscribe()
}, [])

// Función global para requerir auth
useEffect(() => {
  window.requireAuth = (message = '', callback) => {
    if (user) {
      callback?.()
    } else {
      setAuthMessage(message)
      setShowAuthModal(true)
      window.pendingAuthCallback = callback
    }
  }
}, [user])

// Al final del return, antes del último div:
<AuthModal 
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  onSuccess={(user) => {
    setUser(user)
    setShowAuthModal(false)
    window.pendingAuthCallback?.()
  }}
  message={authMessage}
/>

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [sessionId, setSessionId] = useState('')
  const [isStreetViewActive, setIsStreetViewActive] = useState(false)
  const [hasUnvisitedSaves, setHasUnvisitedSaves] = useState(false)
  const [previousSavedCount, setPreviousSavedCount] = useState(0)
  
  // UN SOLO HOOK CENTRAL - todos los componentes usarán estas props
  const { savedProperties, toggleSaveProperty } = useSavedProperties(sessionId)
  
  useEffect(() => {
    const generateSessionId = () => {
      const stored = localStorage.getItem('luci_session_id')
      const storedTime = localStorage.getItem('luci_session_time')
      const oneHour = 60 * 60 * 1000 // 1 hora en milisegundos
      
      if (stored && storedTime && (Date.now() - parseInt(storedTime) < oneHour)) {
        // Usar sessionId existente si no ha pasado 1 hora
        setSessionId(stored)
        console.log('Using existing sessionId:', stored)
      } else {
        // Generar nuevo sessionId si es la primera vez o ha pasado 1 hora
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('luci_session_id', newId)
        localStorage.setItem('luci_session_time', Date.now().toString())
        setSessionId(newId)
        console.log('Generated new sessionId:', newId)
      }
    }
    generateSessionId()
  }, [])

  // Detectar cambios en propiedades guardadas
  useEffect(() => {
    if (savedProperties.size > previousSavedCount) {
      setHasUnvisitedSaves(true)
    } else if (savedProperties.size < previousSavedCount) {
      // No cambiar hasUnvisitedSaves automáticamente cuando se quitan
    }
    setPreviousSavedCount(savedProperties.size)
  }, [savedProperties.size, previousSavedCount])

  // Función para manejar envío de mensajes
  const handleSendMessage = (message) => {
    console.log('Mensaje enviado:', message)
  }

  // Función para manejar cambio de pestañas
  const handleTabChange = (tabId) => {
    if (tabId === 'saved') {
      setHasUnvisitedSaves(false)
    }
    setActiveTab(tabId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterface 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
            onStreetViewChange={setIsStreetViewActive}
          />
        )
      case 'explore':
        return (
          <ExploreContainer 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
            onSendMessage={handleSendMessage}
          />
        )
      case 'saved':
        return (
          <SavedPropertiesContainer 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
          />
        )
      case 'nearby':
        return (
          <NearbyContainer 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
          />
        )
      default:
        return (
          <ChatInterface 
            sessionId={sessionId}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
            onStreetViewChange={setIsStreetViewActive}
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className={`flex-1 overflow-hidden ${activeTab === 'nearby' ? 'pt-0 pb-20' : 'pt-20 pb-20'}`}>
        {renderContent()}
      </main>
      
      {!isStreetViewActive && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          savedCount={savedProperties.size}
          hasUnvisitedSaves={hasUnvisitedSaves}
        />
      )}
    </div>
  )
}
