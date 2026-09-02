import { describe, expect, it } from 'vitest'
import {
  createMissionModeState,
  enterMissionMode,
  exitMissionMode,
  getAssignmentProgress,
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

  it('calculates completion progress from terminal work, not active work', () => {
    expect(getAssignmentProgress([
      { status: 'completed' },
      { status: 'in_progress' },
      { status: 'open' },
      { status: 'completed', completed_at: '2026-09-02T12:00:00Z' },
    ])).toEqual({ total: 4, completed: 2, active: 1, open: 1, percent: 50 })
  })

  it('handles an empty assignment set deterministically', () => {
    expect(getAssignmentProgress([])).toEqual({ total: 0, completed: 0, active: 0, open: 0, percent: 0 })
  })

  it('recognizes only completed as a terminal assignment state', () => {
    expect(isTerminalAssignment('completed')).toBe(true)
    expect(isTerminalAssignment('in_progress')).toBe(false)
    expect(isTerminalAssignment('open')).toBe(false)
  })
})
