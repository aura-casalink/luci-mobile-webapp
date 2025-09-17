'use client'
import { useEffect, useState } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import BottomNavigation from './components/layout/BottomNavigation'
import TopNavigation from './components/layout/TopNavigation'
import ChatInterface from './components/chat/ChatInterface'
import SavedPropertiesContainer from './components/saved/SavedPropertiesContainer'
import NearbyContainer from './components/nearby/NearbyContainer'
import ExploreContainer from './components/explore/ExploreContainer'
import AuthModal from './components/auth/AuthModal'
import LandingPage from './components/landing/LandingPage'
import { useSavedProperties } from './hooks/useSavedProperties'
import { getSupabase } from '@/lib/supabase-browser'

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState('chat')
  const [sessionId, setSessionId] = useState('')
  const [consent, setConsent] = useState(false)
  const [showLanding, setShowLanding] = useState(() => {
    // Inicializar desde localStorage para evitar el flash
    if (typeof window !== 'undefined') {
      return localStorage.getItem('landing_seen') !== 'true'
    }
    return true
  })
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [isStreetViewActive, setIsStreetViewActive] = useState(false)
  const [hasUnvisitedSaves, setHasUnvisitedSaves] = useState(false)
  const [previousSavedCount, setPreviousSavedCount] = useState(0)
  
  const { savedProperties, toggleSaveProperty } = useSavedProperties(sessionId)
  
  // Generar sessionId y deviceId
  useEffect(() => {
    const generateSessionId = () => {
      const stored = localStorage.getItem('luci_session_id')
      const storedTime = localStorage.getItem('luci_session_time')
      const oneHour = 60 * 60 * 1000
      
      if (stored && storedTime && (Date.now() - parseInt(storedTime) < oneHour)) {
        setSessionId(stored)
        if (typeof window !== 'undefined') window.sessionId = stored
      } else {
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('luci_session_id', newId)
        localStorage.setItem('luci_session_time', Date.now().toString())
        setSessionId(newId)
        if (typeof window !== 'undefined') window.sessionId = newId
      }
    }
    
    // Generar o recuperar deviceId único por dispositivo
    const generateDeviceId = () => {
      let deviceId = localStorage.getItem('luci_device_id')
      
      if (!deviceId) {
        // Crear fingerprint básico del navegador
        const nav = window.navigator
        const screen = window.screen
        
        const fingerprint = [
          nav.userAgent,
          nav.language,
          screen.height,
          screen.width,
          screen.pixelDepth,
          new Date().getTimezoneOffset(),
          nav.hardwareConcurrency || 0,
          nav.maxTouchPoints || 0
        ].join('|')
        
        // Generar hash simple del fingerprint
        let hash = 0
        for (let i = 0; i < fingerprint.length; i++) {
          const char = fingerprint.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32bit integer
        }
        
        deviceId = `device_${Math.abs(hash)}_${Date.now().toString(36)}`
        localStorage.setItem('luci_device_id', deviceId)
        console.log('🔧 Generated new device ID:', deviceId)
      } else {
        console.log('🔧 Using existing device ID:', deviceId)
      }
      
      if (typeof window !== 'undefined') {
        window.deviceId = deviceId
      }
      
      return deviceId
    }
    
    // Llamar ambas funciones
    generateSessionId()
    generateDeviceId()

    if (localStorage.getItem('geo_consent') === 'true') {
      console.log('🌍 Forcing geolocation tracking due to existing consent')
      // Limpiar marca de sessionStorage para forzar nuevo tracking
      if (typeof sessionStorage !== 'undefined') {
        const keys = Object.keys(sessionStorage)
        keys.forEach(key => {
          if (key.startsWith('geo_tracked_')) {
            sessionStorage.removeItem(key)
          }
        })
      }
    }
    
    // Verificar consentimiento guardado
    setConsent(localStorage.getItem('geo_consent') === 'true')
  
  // Escuchar evento de consentimiento
  useEffect(() => {
    const handleConsent = () => {
      setConsent(true)
      // Re-ejecutar tracking con nuevo consentimiento
      sessionStorage.removeItem(`geo_tracked_${sessionId}`)
    }
    window.addEventListener('geo-consent-granted', handleConsent)
    return () => window.removeEventListener('geo-consent-granted', handleConsent)
  }, [sessionId])
  
  // Usar hook de geolocalización
  useGeolocation({ sessionId, consent })
  
  // Auth setup (mantener tu código existente)
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (typeof window !== 'undefined') {
        window.currentUser = session?.user ?? null
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (typeof window !== 'undefined') {
        window.currentUser = session?.user ?? null
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  
  useEffect(() => {
    // Restaurar tab pendiente después del login
    const pendingTab = localStorage.getItem('pending_tab')
    if (pendingTab && user) {
      setActiveTab(pendingTab)
      localStorage.removeItem('pending_tab')
    }
    
    // También exponer el tab actual para el modal
    if (typeof window !== 'undefined') {
      window.activeTab = activeTab
    }
  }, [user, activeTab])
  
  // Configurar función global de autenticación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.requireAuth = (message, callback) => {
        console.log('🔐 requireAuth called:', message)
        setAuthMessage(message || 'Inicia sesión para continuar')
        setShowAuthModal(true)
        
        // Guardar callback para ejecutar después del login
        window.pendingAuthCallback = callback
      }
      
      console.log('🔐 window.requireAuth configured')
    }
  }, [])

  const handleStartApp = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landing_seen', 'true')
    }
    setShowLanding(false)
  }

  const handleTabChange = (tabId) => {
    if (tabId === 'saved') {
      if (!user && savedProperties && savedProperties.size > 0) {
        if (typeof window !== 'undefined' && window.requireAuth) {
          window.requireAuth('Accede para ver tus Guardados', () => setActiveTab('saved'))
        }
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
            user={user}
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
            user={user}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
            onStreetViewChange={setIsStreetViewActive}
          />
        )
    }
  }

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />
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
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setUser(user)
          setShowAuthModal(false)
          if (typeof window !== 'undefined' && window.pendingAuthCallback) {
            window.pendingAuthCallback()
          }
        }}
        message={authMessage}
      />
    </div>
  )
}
