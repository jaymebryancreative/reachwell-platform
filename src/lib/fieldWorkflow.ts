export type AssignmentWorkflowStatus = 'open' | 'in_progress' | 'completed'

export type FieldAssignmentLike = {
  status: string
  completed_at?: string | null
}

export type MissionModeState = {
  enabled: boolean
  selectedAssignmentId: string | null
}

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

export function getAssignmentProgress(assignments: FieldAssignmentLike[]) {
  const total = assignments.length
  const completed = assignments.filter((assignment) => assignment.status === 'completed' || Boolean(assignment.completed_at)).length
  const active = assignments.filter((assignment) => assignment.status === 'in_progress').length
  const open = Math.max(0, total - completed - active)
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, active, open, percent }
}

export function isTerminalAssignment(status: string): status is 'completed' {
  return status === 'completed'
}
