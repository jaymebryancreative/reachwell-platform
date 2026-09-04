import { supabase } from './supabaseClient'

export type PersonProfileValues = {
  first_name: string
  middle_name?: string | null
  last_name: string
  suffix?: string | null
  preferred_name?: string | null
  email?: string | null
  phone?: string | null
  birth_date?: string | null
  contact_preference?: 'phone' | 'text' | 'email' | 'none' | null
  marital_status?: 'single' | 'married' | 'separated' | 'divorced' | 'widowed' | 'other' | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state_region?: string | null
  postal_code?: string | null
  country?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
  preferred_language?: string | null
  occupation?: string | null
  notes?: string | null
  serving_notes?: string | null
  skills?: unknown
  availability?: unknown
  tags?: unknown
  communication_consent?: unknown
}

export async function createPersonProfile(organizationId: string, values: PersonProfileValues) {
  const { data: user } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('people').insert({ organization_id: organizationId, household_id: null, status: 'active', created_by: user.user?.id ?? null, skills: [], availability: {}, tags: [], communication_consent: {}, country: 'US', ...values }).select('*').single()
  if (error) throw error
  return data
}

export async function updatePersonProfile(personId: string, values: PersonProfileValues) {
  const { data, error } = await supabase.from('people').update({ ...values, updated_at: new Date().toISOString() }).eq('id', personId).select('*').single()
  if (error) throw error
  return data
}

export async function restorePerson(personId: string) {
  const { data, error } = await supabase.from('people').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', personId).select('*').single()
  if (error) throw error
  return data
}
