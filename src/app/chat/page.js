'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatInterface from '@/app/components/chat/ChatInterface'
import BottomNavigation from '@/app/components/layout/BottomNavigation'
import TopNavigation from '@/app/components/layout/TopNavigation'
import AuthModal from '@/app/components/auth/AuthModal'
import { useSavedProperties } from '@/app/hooks/useSavedProperties'
import { getSupabase } from '@/lib/supabase-browser'

export default function ChatPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState('')
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [isStreetViewActive, setIsStreetViewActive] = useState(false)
  const [hasUnvisitedSaves, setHasUnvisitedSaves] = useState(false)
  
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
    
    const generateDeviceId = () => {
      let deviceId = localStorage.getItem('luci_device_id')
      
      if (!deviceId) {
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
        
        let hash = 0
        for (let i = 0; i < fingerprint.length; i++) {
          const char = fingerprint.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        
        deviceId = `device_${Math.abs(hash)}_${Date.now().toString(36)}`
        localStorage.setItem('luci_device_id', deviceId)
      }
      
      if (typeof window !== 'undefined') {
        window.deviceId = deviceId
      }
      
      return deviceId
    }
    
    generateSessionId()
    generateDeviceId()
  }, [])

  // Auth setup
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

  // Configurar window.requireAuth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.requireAuth = (message, callback) => {
        setAuthMessage(message || 'Inicia sesión para continuar')
        setShowAuthModal(true)
        window.pendingAuthCallback = callback
      }
    }
  }, [])

  // Ejecutar callback pendiente después del login
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.pendingAuthCallback) {
      setTimeout(() => {
        if (window.pendingAuthCallback) {
          window.pendingAuthCallback()
          window.pendingAuthCallback = null
        }
      }, 300)
    }
  }, [user])

  const handleTabChange = (tabId) => {
    if (tabId === 'chat') {
      router.push('/chat')
    } else if (tabId === 'explore') {
      router.push('/explore')
    } else if (tabId === 'saved') {
      router.push('/saved')
    } else if (tabId === 'nearby') {
      router.push('/map')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavigation activeTab="chat" onTabChange={handleTabChange} />
      
      <main className="flex-1 overflow-hidden pt-20 pb-20">
        <ChatInterface 
          sessionId={sessionId}
          user={user}
          savedProperties={savedProperties}
          onToggleSave={toggleSaveProperty}
          onStreetViewChange={setIsStreetViewActive}
        />
      </main>
      
      {!isStreetViewActive && (
        <BottomNavigation 
          activeTab="chat"
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
