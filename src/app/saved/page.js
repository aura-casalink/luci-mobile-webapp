'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SavedPropertiesContainer from '@/app/components/saved/SavedPropertiesContainer'
import BottomNavigation from '@/app/components/layout/BottomNavigation'
import TopNavigation from '@/app/components/layout/TopNavigation'
import AuthModal from '@/app/components/auth/AuthModal'
import { useSavedProperties } from '@/app/hooks/useSavedProperties'
import { getSupabase } from '@/lib/supabase-browser'

export default function SavedPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState('')
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  
  const { savedProperties, toggleSaveProperty } = useSavedProperties(sessionId)

  // Generar sessionId
  useEffect(() => {
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

  // Verificar autenticación al montar
  useEffect(() => {
    if (!user && savedProperties && savedProperties.size > 0) {
      // Si hay propiedades guardadas pero no está loggeado, pedir login
      setAuthMessage('Accede para ver tus Guardados')
      setShowAuthModal(true)
    }
  }, [user, savedProperties])

  const handleTabChange = (tabId) => {
    // Navegar a la nueva ruta según la pestaña
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
      <TopNavigation activeTab="saved" onTabChange={handleTabChange} />
      
      <main className="flex-1 overflow-hidden pt-20 pb-20">
        <SavedPropertiesContainer 
          sessionId={sessionId}
          savedProperties={savedProperties}
          onToggleSave={toggleSaveProperty}
        />
      </main>
      
      <BottomNavigation 
        activeTab="saved"
        onTabChange={handleTabChange}
        savedCount={savedProperties.size}
        hasUnvisitedSaves={false}
      />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setUser(user)
          setShowAuthModal(false)
        }}
        message={authMessage}
      />
    </div>
  )
}
