import { supabase } from './supabaseClient'

export type SignInAttendanceStatus = 'present' | 'absent' | 'late' | 'other'

export async function updateAttendance(participantId: string, attendanceStatus: SignInAttendanceStatus, reason?: string | null) {
  const checkedIn = attendanceStatus === 'present' || attendanceStatus === 'late' ? new Date().toISOString() : null
  const absenceReason = attendanceStatus === 'absent' || attendanceStatus === 'other' ? (reason ?? null) : null
  const { data, error } = await supabase.from('event_participants').update({ attendance_status: attendanceStatus, checked_in_at: checkedIn, absence_reason: absenceReason, updated_at: new Date().toISOString() }).eq('id', participantId).select('id, event_id, person_id, user_id, team_id, role, attendance_status, checked_in_at, absence_reason, person:people(id, first_name, last_name, preferred_name)').single()
  if (error) throw error
  const person = Array.isArray(data.person) ? (data.person[0] ?? null) : data.person
  return { ...data, person }
}
