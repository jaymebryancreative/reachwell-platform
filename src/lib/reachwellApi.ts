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

export type TeamRecord = {
  id: string
  organization_id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
}

export type TeamMembershipRecord = {
  id: string
  person_id: string
  team_id: string
  role: string
  is_leader: boolean
  joined_at: string
  ended_at: string | null
  person: Pick<PersonRecord, 'id' | 'first_name' | 'last_name' | 'preferred_name'> | null
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

export async function listTeams(organizationId: string) {
  const { data, error } = await supabase.from('teams').select('*').eq('organization_id', organizationId).eq('active', true).order('name')
  if (error) throw error
  return (data ?? []) as TeamRecord[]
}

export async function createTeam(payload: Pick<TeamRecord, 'organization_id' | 'name' | 'description'>) {
  const { data, error } = await supabase.from('teams').insert({ ...payload, active: true }).select().single()
  if (error) throw error
  return data as TeamRecord
}

export async function listTeamMemberships(organizationId: string, teamId: string) {
  const { data, error } = await supabase
    .from('people_team_memberships')
    .select('id, person_id, team_id, role, is_leader, joined_at, ended_at, person:people(id, first_name, last_name, preferred_name)')
    .eq('organization_id', organizationId)
    .eq('team_id', teamId)
    .is('ended_at', null)
    .order('joined_at')
  if (error) throw error
  return (data ?? []) as TeamMembershipRecord[]
}

export async function addPersonToTeam(payload: { organization_id: string; person_id: string; team_id: string; role: string; is_leader: boolean }) {
  const { data, error } = await supabase.from('people_team_memberships').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function listPersonTeamMemberships(organizationId: string, personId: string) {
  const { data, error } = await supabase.from('people_team_memberships').select('id, role, is_leader, team:teams(id, name)').eq('organization_id', organizationId).eq('person_id', personId).is('ended_at', null)
  if (error) throw error
  return data ?? []
}
