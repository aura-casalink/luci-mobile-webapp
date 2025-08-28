'use client'
import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { X } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onSuccess, message }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const signInWithGoogle = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const signInWithMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (!error) {
      alert('Te hemos enviado un enlace. Revisa tu email.')
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0A0A23]">
              Continúa tu experiencia
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {message || 'Crea tu cuenta para desbloquear todas las funciones'}
            </p>
          </div>
          <button onClick={onClose} className="p-2">
            <X size={20} />
          </button>
        </div>

        <button 
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-200 rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        <form onSubmit={signInWithMagicLink} className="space-y-3">
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A23] text-white py-3 rounded-lg hover:bg-opacity-90"
          >
            Recibir enlace por email
          </button>
        </form>
      </div>
    </div>
  )
}
