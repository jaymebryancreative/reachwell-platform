import { supabase } from '../../lib/supabaseClient'

export type EventTeamRecord = {
  id: string
  event_id: string
  team_id: string
  created_at: string
  team: { id: string; name: string } | null
}

export async function listEventTeams(eventId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('event_teams')
    .select('id, event_id, team_id, created_at, team:teams(id, name)')
    .eq('event_id', eventId)
    .order('created_at')
  if (error) throw error
  return (data ?? []).map(row => ({
    ...row,
    team: Array.isArray(row.team) ? (row.team[0] ?? null) : row.team,
  })) as EventTeamRecord[]
}

export async function addTeamToEvent(payload: { event_id: string; team_id: string }) {
  const { data, error } = await supabase
    .from('event_teams')
    .insert(payload)
    .select('id, event_id, team_id, created_at, team:teams(id, name)')
    .single()
  if (error) throw error
  return {
    ...data,
    team: Array.isArray(data.team) ? (data.team[0] ?? null) : data.team,
  } as EventTeamRecord
}

export async function listEventAssignments(eventId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('id, title, assignment_type, status, assigned_team_id, assigned_user_id, household_id, person_id, address_label, sequence_number')
    .eq('organization_id', organizationId)
    .eq('event_id', eventId)
    .order('sequence_number', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}
