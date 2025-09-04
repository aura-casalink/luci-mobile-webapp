'use client'
import { useState } from 'react'
import { getSupabase } from '@/lib/supabase-browser'
import { X } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onSuccess, message }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // REEMPLAZAR TODA LA FUNCIÓN makeRedirect() con:
  const makeRedirect = () => {
    // CRÍTICO: usar window.location.origin para mantener mismo dominio
    const url = new URL('/auth/callback', window.location.origin)
    
    // Guardar la ruta actual para volver después
    const currentPath = window.location.pathname + window.location.search
    url.searchParams.set('next', currentPath)
    
    // Mantener sessionId si existe
    const sid = window.sessionId || localStorage.getItem('luci_session_id')
    if (sid) url.searchParams.set('sid', sid)
    
    return url.toString()
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    const supabase = getSupabase() // obtener instancia
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}&sid=${window.sessionId || localStorage.getItem('luci_session_id')}` 
      }
    })
  }

  const signInWithMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    const supabase = getSupabase() // obtener instancia
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}&sid=${window.sessionId || localStorage.getItem('luci_session_id')}`
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: redirectUrl 
      }
    })
    if (!error) alert('Te hemos enviado un enlace. Revisa tu email.')
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white text-[#0A0A23] rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold leading-7">Continúa tu experiencia</h2>
            <p className="mt-1 text-sm text-gray-700">
              {message || 'Crea tu cuenta para desbloquear todas las funciones'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC900]"
            aria-label="Cerrar"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          type="button"
          className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3
                     text-[15px] font-medium text-[#0A0A23] hover:bg-gray-50 hover:border-gray-400
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC900] disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-700">o</span>
          </div>
        </div>

        <form onSubmit={signInWithMagicLink} className="space-y-3">
          <label className="block text-sm font-medium text-[#0A0A23]">
            Tu email
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white
                         px-4 py-3 text-[15px] text-[#0A0A23] placeholder-gray-500 caret-[#0A0A23]
                         focus:border-[#0A0A23] focus:ring-2 focus:ring-[#0A0A23]/20
                         disabled:opacity-60"
              disabled={loading}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0A0A23] text-white py-3 text-[15px] font-semibold
                       hover:bg-[#0A0A23]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC900]
                       disabled:opacity-60"
          >
            Recibir enlace por email
          </button>
        </form>
      </div>
    </div>
  )
}
