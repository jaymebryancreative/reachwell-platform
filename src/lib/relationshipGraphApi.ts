import { supabase } from './supabaseClient'

export type RelationshipGraphEdge = {
  organization_id: string
  source_type: 'person' | 'household' | 'team' | 'event' | 'assignment'
  source_id: string
  target_type: 'person' | 'household' | 'team' | 'event' | 'assignment'
  target_id: string
  relationship: 'household_member' | 'team_member' | 'event_participant' | 'assignment_person' | 'assignment_household' | 'assignment_team'
  role: string | null
  status: string | null
}

export async function listPersonRelationshipGraph(organizationId: string, personId: string) {
  const [person, teams, events, assignments] = await Promise.all([
    supabase.from('people').select('id,household_id').eq('organization_id', organizationId).eq('id', personId).single(),
    supabase.from('people_team_memberships').select('team_id,role,is_leader,ended_at').eq('organization_id', organizationId).eq('person_id', personId),
    supabase.from('event_participants').select('event_id,team_id,role,attendance_status').eq('person_id', personId),
    supabase.from('assignments').select('id,household_id,assigned_team_id,status').eq('organization_id', organizationId).eq('person_id', personId),
  ])

  if (person.error) throw person.error
  if (teams.error) throw teams.error
  if (events.error) throw events.error
  if (assignments.error) throw assignments.error

  const edges: RelationshipGraphEdge[] = []
  const householdId = person.data?.household_id ?? null

  if (householdId) edges.push({ organization_id: organizationId, source_type: 'person', source_id: personId, target_type: 'household', target_id: householdId, relationship: 'household_member', role: null, status: 'active' })
  for (const row of teams.data ?? []) {
    if (row.ended_at) continue
    edges.push({ organization_id: organizationId, source_type: 'person', source_id: personId, target_type: 'team', target_id: row.team_id, relationship: 'team_member', role: row.is_leader ? 'leader' : row.role ?? 'member', status: 'active' })
  }
  for (const row of events.data ?? []) {
    edges.push({ organization_id: organizationId, source_type: 'person', source_id: personId, target_type: 'event', target_id: row.event_id, relationship: 'event_participant', role: row.role ?? null, status: row.attendance_status ?? null })
  }
  for (const row of assignments.data ?? []) {
    edges.push({ organization_id: organizationId, source_type: 'person', source_id: personId, target_type: 'assignment', target_id: row.id, relationship: 'assignment_person', role: null, status: row.status ?? null })
    if (row.household_id) edges.push({ organization_id: organizationId, source_type: 'assignment', source_id: row.id, target_type: 'household', target_id: row.household_id, relationship: 'assignment_household', role: null, status: row.status ?? null })
    if (row.assigned_team_id) edges.push({ organization_id: organizationId, source_type: 'assignment', source_id: row.id, target_type: 'team', target_id: row.assigned_team_id, relationship: 'assignment_team', role: null, status: row.status ?? null })
  }
  return edges
}
