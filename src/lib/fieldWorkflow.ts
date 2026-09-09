export type AssignmentWorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'

export type FieldAssignmentLike = {
  status: string
  completed_at?: string | null
}

export type MissionModeState = {
  enabled: boolean
  selectedAssignmentId: string | null
}

export const ACTIVE_ASSIGNMENT_STATUSES: readonly AssignmentWorkflowStatus[] = ['pending', 'in_progress']
export const TERMINAL_ASSIGNMENT_STATUSES: readonly AssignmentWorkflowStatus[] = ['completed', 'skipped', 'cancelled']

export function createMissionModeState(): MissionModeState {
  return { enabled: false, selectedAssignmentId: null }
}

export function enterMissionMode(): MissionModeState {
  return { enabled: true, selectedAssignmentId: null }
}

export function exitMissionMode(): MissionModeState {
  return createMissionModeState()
}

export function selectMissionAssignment(state: MissionModeState, assignmentId: string): MissionModeState {
  if (!state.enabled) return state
  return { ...state, selectedAssignmentId: assignmentId }
}

export function isActiveAssignment(status: string): boolean {
  return ACTIVE_ASSIGNMENT_STATUSES.includes(status as AssignmentWorkflowStatus)
}

export function getAssignmentProgress(assignments: FieldAssignmentLike[]) {
  const total = assignments.length
  const completed = assignments.filter((assignment) => assignment.status === 'completed' || Boolean(assignment.completed_at)).length
  const active = assignments.filter((assignment) => assignment.status === 'in_progress').length
  const pending = assignments.filter((assignment) => assignment.status === 'pending').length
  const skipped = assignments.filter((assignment) => assignment.status === 'skipped').length
  const cancelled = assignments.filter((assignment) => assignment.status === 'cancelled').length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return { total, completed, active, open: pending, skipped, cancelled, percent }
}

export function isTerminalAssignment(status: string): status is 'completed' {
  return status === 'completed'
}
