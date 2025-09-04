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
          storageKey: 'luci-webapp-auth',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          // CRÍTICO: configuración de cookies para PKCE
          flowType: 'pkce',
          storage: {
            getItem: (key) => {
              if (typeof window === 'undefined') return null;
              return window.localStorage.getItem(key);
            },
            setItem: (key, value) => {
              if (typeof window === 'undefined') return;
              window.localStorage.setItem(key, value);
            },
            removeItem: (key) => {
              if (typeof window === 'undefined') return;
              window.localStorage.removeItem(key);
            },
          },
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
