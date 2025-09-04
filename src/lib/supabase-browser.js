'use client'
import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance = null

export function getSupabase() {
  if (typeof window === 'undefined') return null
  
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'luci-webapp-auth' // consistente con el actual
        }
      }
    )
  }
  
  return supabaseInstance
}

export function useSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('useSupabase solo puede ser usado en el cliente')
  }
  return getSupabase()
}

// Exportación temporal para compatibilidad - TODO: migrar todos los imports a getSupabase()
export const supabase = typeof window !== 'undefined' ? getSupabase() : null
