import { supabase } from './supabaseClient'

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'normal' | 'high' | 'urgent'
export type WorkStatus = 'not_started' | 'in_progress' | 'waiting' | 'completed'

export type ProjectRecord = {
  id: string
  organization_id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: ProjectPriority
  owner_id: string | null
  start_date: string | null
  target_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type ProjectTaskRecord = {
  id: string
  organization_id: string
  project_id: string | null
  event_id: string | null
  milestone_id: string | null
  title: string
  description: string | null
  status: WorkStatus
  priority: ProjectPriority
  due_date: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ProjectTeamRecord = { project_id: string; team_id: string }
export type ProjectMemberRecord = { project_id: string; user_id: string; role: 'owner' | 'manager' | 'collaborator' | 'viewer'; created_at: string }

export async function listProjects(organizationId: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('organization_id', organizationId).neq('status', 'cancelled').order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ProjectRecord[]
}

export async function createProject(payload: Pick<ProjectRecord, 'organization_id' | 'name' | 'description' | 'priority' | 'start_date' | 'target_date'>) {
  const { data: user } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('projects').insert({ ...payload, owner_id: user.user?.id ?? null, status: 'active' }).select().single()
  if (error) throw error
  return data as ProjectRecord
}

export async function updateProject(projectId: string, values: Partial<Pick<ProjectRecord, 'name' | 'description' | 'status' | 'priority' | 'start_date' | 'target_date'>>) {
  const next = { ...values, updated_at: new Date().toISOString() }
  if (values.status === 'completed') next.completed_at = new Date().toISOString()
  if (values.status && values.status !== 'completed') next.completed_at = null
  const { data, error } = await supabase.from('projects').update(next).eq('id', projectId).select().single()
  if (error) throw error
  return data as ProjectRecord
}

export async function archiveProject(projectId: string) {
  return updateProject(projectId, { status: 'cancelled' })
}

export async function listProjectTasks(organizationId: string, projectId: string) {
  const { data, error } = await supabase.from('tasks').select('*').eq('organization_id', organizationId).eq('project_id', projectId).order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ProjectTaskRecord[]
}

export async function createProjectTask(payload: Pick<ProjectTaskRecord, 'organization_id' | 'project_id' | 'title' | 'description' | 'status' | 'priority' | 'due_date'>) {
  const { data: user } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('tasks').insert({ ...payload, created_by: user.user?.id ?? null }).select().single()
  if (error) throw error
  return data as ProjectTaskRecord
}

export async function updateProjectTask(taskId: string, values: Partial<Pick<ProjectTaskRecord, 'title' | 'description' | 'status' | 'priority' | 'due_date'>>) {
  const next = { ...values, updated_at: new Date().toISOString() }
  if (values.status === 'completed') next.completed_at = new Date().toISOString()
  if (values.status && values.status !== 'completed') next.completed_at = null
  const { data, error } = await supabase.from('tasks').update(next).eq('id', taskId).select().single()
  if (error) throw error
  return data as ProjectTaskRecord
}

export async function listProjectTeams(projectId: string) {
  const { data, error } = await supabase.from('project_teams').select('project_id, team_id, team:teams(id, name, description, active)').eq('project_id', projectId)
  if (error) throw error
  return data ?? []
}

export async function addProjectTeam(projectId: string, teamId: string) {
  const { data, error } = await supabase.from('project_teams').upsert({ project_id: projectId, team_id: teamId }, { onConflict: 'project_id,team_id' }).select().single()
  if (error) throw error
  return data as ProjectTeamRecord
}

export async function removeProjectTeam(projectId: string, teamId: string) {
  const { error } = await supabase.from('project_teams').delete().eq('project_id', projectId).eq('team_id', teamId)
  if (error) throw error
}

export async function listProjectMembers(projectId: string) {
  const { data, error } = await supabase.from('project_members').select('*').eq('project_id', projectId).order('created_at')
  if (error) throw error
  return (data ?? []) as ProjectMemberRecord[]
}

export async function upsertProjectMember(projectId: string, userId: string, role: ProjectMemberRecord['role']) {
  const { data, error } = await supabase.from('project_members').upsert({ project_id: projectId, user_id: userId, role }, { onConflict: 'project_id,user_id' }).select().single()
  if (error) throw error
  return data as ProjectMemberRecord
}

export async function listProjectEvents(projectId: string) {
  const { data, error } = await supabase.from('project_events').select('project_id, event_id, event:events(id, name, starts_at, status, location_name)').eq('project_id', projectId).order('event(starts_at)', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addProjectEvent(projectId: string, eventId: string) {
  const { data, error } = await supabase.from('project_events').upsert({ project_id: projectId, event_id: eventId }, { onConflict: 'project_id,event_id' }).select().single()
  if (error) throw error
  return data
}
