import { describe, expect, it } from 'vitest'
import {
  createMissionModeState,
  enterMissionMode,
  exitMissionMode,
  getAssignmentProgress,
  isActiveAssignment,
  isTerminalAssignment,
  selectMissionAssignment,
} from './fieldWorkflow'

describe('mission mode workflow invariants', () => {
  it('starts disabled with no stale assignment selection', () => {
    expect(createMissionModeState()).toEqual({ enabled: false, selectedAssignmentId: null })
  })

  it('entering and exiting mission mode resets transient selection state', () => {
    const entered = enterMissionMode()
    const selected = selectMissionAssignment(entered, 'assignment-1')
    expect(selected).toEqual({ enabled: true, selectedAssignmentId: 'assignment-1' })
    expect(exitMissionMode()).toEqual({ enabled: false, selectedAssignmentId: null })
  })

  it('does not select assignments while mission mode is off', () => {
    expect(selectMissionAssignment(createMissionModeState(), 'assignment-1')).toEqual(createMissionModeState())
  })

  it('recognizes only pending and in-progress work as active', () => {
    expect(isActiveAssignment('pending')).toBe(true)
    expect(isActiveAssignment('in_progress')).toBe(true)
    expect(isActiveAssignment('completed')).toBe(false)
    expect(isActiveAssignment('skipped')).toBe(false)
    expect(isActiveAssignment('cancelled')).toBe(false)
  })

  it('calculates completion progress from canonical assignment states', () => {
    expect(getAssignmentProgress([
      { status: 'completed' },
      { status: 'in_progress' },
      { status: 'pending' },
      { status: 'skipped' },
      { status: 'cancelled' },
    ])).toEqual({ total: 5, completed: 1, active: 1, open: 1, skipped: 1, cancelled: 1, percent: 20 })
  })

  it('counts completed_at as completed for resilient historical data', () => {
    expect(getAssignmentProgress([
      { status: 'pending', completed_at: '2026-09-02T12:00:00Z' },
      { status: 'pending' },
    ])).toEqual({ total: 2, completed: 1, active: 0, open: 1, skipped: 0, cancelled: 0, percent: 50 })
  })

  it('handles an empty assignment set deterministically', () => {
    expect(getAssignmentProgress([])).toEqual({ total: 0, completed: 0, active: 0, open: 0, skipped: 0, cancelled: 0, percent: 0 })
  })

  it('recognizes only completed as a terminal completion state', () => {
    expect(isTerminalAssignment('completed')).toBe(true)
    expect(isTerminalAssignment('in_progress')).toBe(false)
    expect(isTerminalAssignment('skipped')).toBe(false)
    expect(isTerminalAssignment('cancelled')).toBe(false)
  })
})
