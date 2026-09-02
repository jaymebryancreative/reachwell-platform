import { supabase } from './supabaseClient'
import type { FollowUpRecord } from './reachwellApi'

export async function listFollowUps(organizationId: string) {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('id,organization_id,household_id,person_id,assignment_id,title,description,due_at,priority,status,assigned_to,completed_at,completed_by,created_at')
    .eq('organization_id', organizationId)
    .neq('status', 'completed')
    .order('due_at', { ascending: true, nullsFirst: false })

  if (error) throw error
  return (data ?? []) as FollowUpRecord[]
}

export async function completeFollowUp(followUpId: string, userId: string) {
  const { data, error } = await supabase
    .from('follow_ups')
    .update({ status: 'completed', completed_at: new Date().toISOString(), completed_by: userId })
    .eq('id', followUpId)
    .select('id,organization_id,household_id,person_id,assignment_id,title,description,due_at,priority,status,assigned_to,completed_at,completed_by,created_at')
    .single()

  if (error) throw error
  return data as FollowUpRecord
}
