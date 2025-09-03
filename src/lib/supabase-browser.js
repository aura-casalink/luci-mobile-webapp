'use client'
import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance

export function getSupabase() {
  if (typeof window === 'undefined') return null
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          // evita colisiones si hay más apps en el mismo dominio
          storageKey: 'luci-webapp-auth',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
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

export const supabase = typeof window !== 'undefined' ? getSupabase() : null
()
