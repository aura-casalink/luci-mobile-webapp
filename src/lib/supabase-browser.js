'use client'
import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance

export function getSupabase() {
  if (typeof window === 'undefined') return null
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
