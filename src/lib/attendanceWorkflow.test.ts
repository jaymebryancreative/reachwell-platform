import { describe, expect, it } from 'vitest'
import { ABSENCE_REASONS, attendanceSummary, isCustomAbsenceReason, normalizeAbsenceReason } from './attendanceWorkflow'

describe('attendance workflow invariants', () => {
  it('uses the exact field absence reasons', () => {
    expect(ABSENCE_REASONS).toEqual([
      'Illness',
      'Family emergency',
      'Work conflict',
      'Transportation',
      'Personal conflict',
      'Custom Answer',
    ])
  })

  it('clears an absence reason when a person is marked present', () => {
    expect(normalizeAbsenceReason('present', 'Illness')).toBeNull()
  })

  it('preserves a selected reason for an absent person', () => {
    expect(normalizeAbsenceReason('absent', ' Family emergency ')).toBe('Family emergency')
  })

  it('recognizes the custom-answer state', () => {
    expect(isCustomAbsenceReason('Custom Answer')).toBe(true)
    expect(isCustomAbsenceReason('Illness')).toBe(false)
  })

  it('summarizes present, absent, and unmarked people', () => {
    expect(attendanceSummary(['present', 'absent', 'not_marked', 'present'])).toEqual({ present: 2, absent: 1, unmarked: 1 })
  })
})
