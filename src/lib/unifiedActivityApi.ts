import { supabase } from './supabaseClient'
import type { RelationshipTimelineRecord } from './relationshipTimeline'

export type UnifiedActivityRecord = RelationshipTimelineRecord & { scope: 'person' | 'household' | 'organization' }

export async function listUnifiedActivity(organizationId: string, options: { personId?: string; householdId?: string; limit?: number } = {}) {
  const limit = options.limit ?? 75
  let query = supabase.from('relationship_timeline').select('*').eq('organization_id', organizationId).order('occurred_at', { ascending: false }).limit(limit)
  if (options.personId) query = query.eq('person_id', options.personId)
  else if (options.householdId) query = query.eq('household_id', options.householdId)
  const { data, error } = await query
  if (error) throw error
  const scope = options.personId ? 'person' : options.householdId ? 'household' : 'organization'
  return ((data ?? []) as RelationshipTimelineRecord[]).map(record => ({ ...record, scope })) as UnifiedActivityRecord[]
}

export function activityTitle(record: Pick<UnifiedActivityRecord, 'title' | 'activity_kind'>) {
  if (record.title?.trim()) return record.title.trim()
  const labels: Record<UnifiedActivityRecord['activity_kind'], string> = { assignment: 'Outreach assignment', visit: 'Outreach visit', note: 'Field note', need: 'Need', prayer: 'Prayer request', follow_up: 'Follow-up' }
  return labels[record.activity_kind]
}
