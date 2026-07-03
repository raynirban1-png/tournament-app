import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Doesn't throw — lets the UI render a clear message instead of a blank screen.
  console.warn(
    'Supabase environment variables are missing. Copy .env.example to .env (local dev) ' +
    'or set repo secrets VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (GitHub Actions).'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
