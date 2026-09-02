export const ABSENCE_REASONS = [
  'Illness',
  'Family emergency',
  'Work conflict',
  'Transportation',
  'Personal conflict',
  'Custom Answer',
] as const

export type AttendanceStatus = 'present' | 'absent'

export function normalizeAbsenceReason(status: AttendanceStatus, reason: string | null | undefined) {
  if (status === 'present') return null
  return reason?.trim() || null
}

export function isCustomAbsenceReason(reason: string | null | undefined) {
  return reason === 'Custom Answer'
}

export function attendanceSummary(statuses: string[]) {
  const present = statuses.filter(status => status === 'present').length
  const absent = statuses.filter(status => status === 'absent').length
  return { present, absent, unmarked: Math.max(0, statuses.length - present - absent) }
}
