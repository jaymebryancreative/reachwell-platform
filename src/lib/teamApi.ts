import { supabase } from './supabaseClient'

export async function updatePersonTeamMembership(membershipId: string, values: { role?: string; is_leader?: boolean }) {
  const { data, error } = await supabase.from('people_team_memberships').update(values).eq('id', membershipId).select().single()
  if (error) throw error
  return data
}

export async function endPersonTeamMembership(membershipId: string) {
  const { data, error } = await supabase.from('people_team_memberships').update({ ended_at: new Date().toISOString() }).eq('id', membershipId).select().single()
  if (error) throw error
  return data
}

export async function updateTeam(teamId: string, values: { name?: string; description?: string; active?: boolean }) {
  const { data, error } = await supabase.from('teams').update({ ...values, updated_at: new Date().toISOString() }).eq('id', teamId).select().single()
  if (error) throw error
  return data
}

export async function archiveTeam(teamId: string) {
  return updateTeam(teamId, { active: false })
}
