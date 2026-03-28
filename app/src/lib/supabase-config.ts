/** Lightweight env-var check — does NOT import the Supabase SDK. */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when Supabase env vars are configured */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)
