import { supabase } from './supabaseClient'

export type RelationshipTimelineRecord = {
  organization_id: string
  person_id: string | null
  household_id: string | null
  assignment_id: string | null
  source_id: string
  activity_kind: 'assignment' | 'need' | 'prayer' | 'follow_up' | 'visit' | 'note'
  title: string
  detail: string | null
  occurred_at: string
  actor_id: string | null
  status: string
}

export async function listRelationshipTimeline(
  organizationId: string,
  target: { personId?: string; householdId?: string },
  limit = 50,
) {
  let query = supabase
    .from('relationship_timeline')
    .select('*')
    .eq('organization_id', organizationId)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (target.personId) query = query.eq('person_id', target.personId)
  else if (target.householdId) query = query.eq('household_id', target.householdId)
  else throw new Error('A person or household is required to load relationship history.')

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as RelationshipTimelineRecord[]
}

export function timelineLabel(kind: RelationshipTimelineRecord['activity_kind']) {
  switch (kind) {
    case 'assignment': return 'Assignment'
    case 'need': return 'Need'
    case 'prayer': return 'Prayer'
    case 'follow_up': return 'Follow-up'
    case 'visit': return 'Visit'
    case 'note': return 'Note'
  }
}
