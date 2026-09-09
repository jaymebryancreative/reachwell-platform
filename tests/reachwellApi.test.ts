import { describe, expect, it } from 'vitest'
import { normalizeEventParticipants, normalizeTeamMemberships, sortFollowUps, type FollowUpRecord } from '../src/lib/reachwellApi'
import { createMissionModeState, enterMissionMode, exitMissionMode, getAssignmentProgress, isActiveAssignment, isTerminalAssignment, selectMissionAssignment } from '../src/lib/fieldWorkflow'

describe('relationship normalization', () => {
  it('normalizes Supabase joined people records to a single person per membership', () => {
    const records = normalizeTeamMemberships([{
      id: 'membership-1', person_id: 'person-1', team_id: 'team-1', role: 'coordinator', is_leader: true,
      joined_at: '2026-08-31T00:00:00.000Z', ended_at: null,
      person: [{ id: 'person-1', first_name: 'Ada', last_name: 'Lovelace', preferred_name: null }],
    }])
    expect(records).toEqual([expect.objectContaining({ person: { id: 'person-1', first_name: 'Ada', last_name: 'Lovelace', preferred_name: null }, role: 'coordinator', is_leader: true })])
  })

  it('keeps an unlinked membership readable rather than throwing', () => {
    const records = normalizeTeamMemberships([{
      id: 'membership-2', person_id: 'removed-person', team_id: 'team-1', role: 'member', is_leader: false,
      joined_at: '2026-08-31T00:00:00.000Z', ended_at: null, person: [],
    }])
    expect(records[0].person).toBeNull()
  })

  it('normalizes event participants whether Supabase returns one person or an array', () => {
    const records = normalizeEventParticipants([{
      id: 'participant-1', event_id: 'event-1', person_id: 'person-1', user_id: null, team_id: null,
      role: 'volunteer', attendance_status: 'present', absence_reason: null, checked_in_at: '2026-09-01T12:00:00.000Z',
      person: [{ id: 'person-1', first_name: 'Ada', last_name: 'Lovelace', preferred_name: null }],
    }])
    expect(records[0].person?.first_name).toBe('Ada')
    expect(records[0].attendance_status).toBe('present')
    expect(records[0].absence_reason).toBeNull()
  })
})

describe('sortFollowUps', () => {
  const followUp = (id: string, due_at: string | null): FollowUpRecord => ({ id, organization_id: 'org-1', household_id: null, person_id: null, assignment_id: null, title: id, description: null, due_at, priority: 'normal', status: 'open', assigned_to: null, completed_at: null, completed_by: null, created_at: '2026-09-01T00:00:00.000Z' })

  it('puts dated follow-ups first in due-date order and undated work last', () => {
    const sorted = sortFollowUps([followUp('undated', null), followUp('later', '2026-09-03T12:00:00.000Z'), followUp('soon', '2026-09-02T12:00:00.000Z')])
    expect(sorted.map(item => item.id)).toEqual(['soon', 'later', 'undated'])
  })
})

describe('mission workflow state', () => {
  it('starts disabled, enters cleanly, and exits without stale assignment state', () => {
    expect(createMissionModeState()).toEqual({ enabled: false, selectedAssignmentId: null })
    expect(enterMissionMode()).toEqual({ enabled: true, selectedAssignmentId: null })
    expect(exitMissionMode()).toEqual({ enabled: false, selectedAssignmentId: null })
  })

  it('does not select an assignment while mission mode is disabled', () => {
    const state = createMissionModeState()
    expect(selectMissionAssignment(state, 'assignment-1')).toEqual(state)
  })

  it('selects an assignment only while mission mode is active', () => {
    expect(selectMissionAssignment(enterMissionMode(), 'assignment-1')).toEqual({ enabled: true, selectedAssignmentId: 'assignment-1' })
  })
})

describe('assignment workflow semantics', () => {
  it('only treats pending and in-progress work as active', () => {
    expect(isActiveAssignment('pending')).toBe(true)
    expect(isActiveAssignment('in_progress')).toBe(true)
    expect(isActiveAssignment('completed')).toBe(false)
    expect(isActiveAssignment('skipped')).toBe(false)
    expect(isActiveAssignment('cancelled')).toBe(false)
  })

  it('treats completed, skipped, and cancelled as terminal states', () => {
    expect(isTerminalAssignment('completed')).toBe(true)
    expect(isTerminalAssignment('skipped')).toBe(true)
    expect(isTerminalAssignment('cancelled')).toBe(true)
    expect(isTerminalAssignment('pending')).toBe(false)
    expect(isTerminalAssignment('in_progress')).toBe(false)
  })

  it('excludes skipped and cancelled work from the completion denominator', () => {
    expect(getAssignmentProgress([
      { status: 'completed' },
      { status: 'pending' },
      { status: 'in_progress' },
      { status: 'skipped' },
      { status: 'cancelled' },
    ])).toEqual({ total: 5, completed: 1, active: 1, open: 1, skipped: 1, cancelled: 1, percent: 50 })
  })
})
