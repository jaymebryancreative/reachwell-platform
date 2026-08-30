import { supabase } from './supabaseClient'

export type PersonRecord = {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  preferred_name: string | null
  email: string | null
  phone: string | null
  status: 'active' | 'archived'
  created_at: string
}

export async function listPeople(organizationId: string) {
  const { data, error } = await supabase.from('people').select('*').eq('organization_id', organizationId).eq('status', 'active').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as PersonRecord[]
}

export async function createPerson(payload: Omit<PersonRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('people').insert(payload).select().single()
  if (error) throw error
  return data as PersonRecord
}

export async function archivePerson(personId: string) {
  const { data, error } = await supabase.from('people').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', personId).select().single()
  if (error) throw error
  return data as PersonRecord
}

export async function listPersonTeamMemberships(organizationId: string, personId: string) {
  const { data, error } = await supabase.from('people_team_memberships').select('id, role, is_leader, team:teams(id, name)').eq('organization_id', organizationId).eq('person_id', personId).is('ended_at', null)
  if (error) throw error
  return data ?? []
}
