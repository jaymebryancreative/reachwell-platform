import { createClient } from '@supabase/supabase-js'

// These are public Supabase connection values. Environment variables take precedence
// so staging/alternate deployments can override them without changing application code.
const defaultSupabaseUrl = 'https://qxjbzajxgeyqcarnxkkr.supabase.co'
const defaultSupabasePublishableKey = 'sb_publishable_6bhJ7zF710vD0TTS3eX1Nw_8GUNu1Yl'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || defaultSupabasePublishableKey

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
