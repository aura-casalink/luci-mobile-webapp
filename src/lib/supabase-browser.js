import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern: una sola instancia del cliente
let supabaseInstance = null

export function createBrowserSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return supabaseInstance
}

// Export directo para uso más sencillo
export const supabase = createBrowserSupabaseClient()
