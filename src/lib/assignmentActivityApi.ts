import { supabase } from './supabaseClient'

export type AssignmentActivityRecord = {
  id: string
  assignment_id: string
  actor_id: string | null
  activity_type: string
  metadata: Record<string, unknown>
  created_at: string
}

export type AssignmentActivityActor = {
  id: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
}

export async function listAssignmentActivity(organizationId: string, assignmentId: string, limit = 50) {
  const { data, error } = await supabase
    .from('assignment_activity')
    .select('id,assignment_id,actor_id,activity_type,metadata,created_at')
    .eq('organization_id', organizationId)
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const records = (data ?? []) as AssignmentActivityRecord[]
  const actorIds = [...new Set(records.map(record => record.actor_id).filter((id): id is string => Boolean(id)))]
  if (!actorIds.length) return { records, actors: [] as AssignmentActivityActor[] }

  const { data: actors, error: actorError } = await supabase
    .from('profiles')
    .select('id,full_name,first_name,last_name')
    .in('id', actorIds)

  if (actorError) throw actorError
  return { records, actors: (actors ?? []) as AssignmentActivityActor[] }
}
