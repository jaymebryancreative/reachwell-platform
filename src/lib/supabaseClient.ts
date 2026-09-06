import { createClient } from '@supabase/supabase-js'

// Public client values only. Environment variables override these defaults for
// alternate deployments, while the production fallback prevents a missing Vercel
// build-time variable from silently disconnecting authentication.
const defaultSupabaseUrl = 'https://qxjbzajxgeyqcarnxkkr.supabase.co'
const defaultSupabasePublishableKey = 'sb_publishable_6bhJ7zF710vD0TTS3eX1Nw_8GUNu1Yl'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || defaultSupabaseUrl
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || defaultSupabasePublishableKey

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
