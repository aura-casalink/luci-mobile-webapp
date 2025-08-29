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
import LandingPage from './components/landing/LandingPage'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [sessionId, setSessionId] = useState('')
  const [isStreetViewActive, setIsStreetViewActive] = useState(false)
  const [hasUnvisitedSaves, setHasUnvisitedSaves] = useState(false)
  const [previousSavedCount, setPreviousSavedCount] = useState(0)
  
  // Estado para mostrar/ocultar landing con persistencia
  const [showLanding, setShowLanding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('landing_seen')
    }
    return true
  })
  
  // Estados para auth
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const supabaseAuth = createBrowserSupabaseClient()
  
  // UN SOLO HOOK CENTRAL - todos los componentes usarán estas props
  const { savedProperties, toggleSaveProperty } = useSavedProperties(sessionId)
  
  // Verificar sesión al cargar
  useEffect(() => {
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      window.currentUser = session?.user ?? null
    })

    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      window.currentUser = session?.user ?? null
    })

    return () => subscription.unsubscribe()
  }, [])

  // Ejecutar callback pendiente si el usuario se loguea
  useEffect(() => {
    if (user && window.pendingAuthCallback) {
      window.pendingAuthCallback()
      window.pendingAuthCallback = null
    }
  }, [user])

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

  // Recuperar sessionId de URL si viene del callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sidFromUrl = urlParams.get('sid');
    
    if (sidFromUrl) {
      localStorage.setItem('luci_session_id', sidFromUrl);
      setSessionId(sidFromUrl);
      
      // Limpiar URL
      urlParams.delete('sid');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
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

  // Función para manejar inicio de la app desde landing
  const handleStartApp = () => {
    localStorage.setItem('landing_seen', 'true')
    setShowLanding(false)
  }

  // Función para manejar envío de mensajes
  const handleSendMessage = (message) => {
    console.log('Mensaje enviado:', message)
  }

  // Función para manejar cambio de pestañas
  const handleTabChange = (tabId) => {
    if (tabId === 'saved') {
      // Solo pedir login si NO hay usuario Y hay guardados
      if (!user && savedProperties && savedProperties.size > 0) {
        window.requireAuth?.('Accede para ver tus Guardados', () => setActiveTab('saved'))
        return
      }
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

  // Mostrar landing page si es la primera vez
  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />
  }

  // Mostrar app principal
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
    </div>
  )
}
