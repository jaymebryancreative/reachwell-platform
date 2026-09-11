import { supabase } from './supabaseClient'

export type NextAssignment = {
  id: string
  title: string
  address: string | null
}

/**
 * Completes an assignment and asks the database for the next actionable
 * assignment in the same event. The server-side function performs the
 * completion and next-assignment lookup in one transaction.
 */
export async function completeAssignmentAndGetNext(assignmentId: string, completionNote?: string | null): Promise<NextAssignment | null> {
  const { data, error } = await supabase.rpc('complete_assignment_and_get_next', {
    target_assignment: assignmentId,
    completion_note: completionNote ?? null,
  })

  if (error) throw error

  const next = Array.isArray(data) ? data[0] : data
  if (!next?.next_assignment_id) return null

  return {
    id: next.next_assignment_id,
    title: next.next_assignment_title,
    address: next.next_assignment_address ?? null,
  }
}
