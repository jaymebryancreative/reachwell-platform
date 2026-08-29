import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Circle, Clock3, LayoutGrid, List, Plus, Users, X } from 'lucide-react'

export type WorkStatus = 'not_started' | 'in_progress' | 'waiting' | 'completed'
type ViewMode = 'list' | 'board'
type ProjectTab = 'overview' | 'work' | 'team' | 'communication' | 'events' | 'impact'

type Task = { id: string; title: string; status: WorkStatus; assignee?: string; due?: string; team?: string }
type Project = { id: string; name: string; description: string; progress: number; owner: string; teams: string[]; tasks: Task[] }

const availableTeams = ['Outreach', 'Setup', 'Food Distribution', 'Prayer', 'Communications', 'Care']
const seedProjects: Project[] = [{ id: 'community-food-drive', name: 'Community Food Drive', description: 'Coordinate people, supplies, communication, budget, and the Saturday distribution event.', progress: 68, owner: 'Project Lead', teams: ['Outreach', 'Setup', 'Food Distribution', 'Prayer'], tasks: [
  { id: 't1', title: 'Confirm food supplier', status: 'not_started', assignee: 'Project Lead', due: 'Tomorrow', team: 'Food Distribution' },
  { id: 't2', title: 'Prepare distribution stations', status: 'in_progress', assignee: 'Setup Lead', due: 'Friday', team: 'Setup' },
  { id: 't3', title: 'Confirm volunteer coverage', status: 'waiting', assignee: 'Outreach Lead', due: 'Thursday', team: 'Outreach' },
  { id: 't4', title: 'Reserve community center', status: 'completed', assignee: 'Project Lead', team: 'Setup' },
]}]

const statusMeta: Record<WorkStatus, { label: string; icon: typeof Circle }> = { not_started: { label: 'Not Started', icon: Circle }, in_progress: { label: 'In Progress', icon: Clock3 }, waiting: { label: 'Waiting', icon: Clock3 }, completed: { label: 'Completed', icon: CheckCircle2 } }
const statusOrder: WorkStatus[] = ['not_started', 'in_progress', 'waiting', 'completed']

export function ProjectsWorkspace() {
  const [projects, setProjects] = useState(seedProjects)
  const [selectedId, setSelectedId] = useState(seedProjects[0].id)
  const [mode, setMode] = useState<ViewMode>('list')
  const [tab, setTab] = useState<ProjectTab>('overview')
  const [teamPickerOpen, setTeamPickerOpen] = useState(false)
  const selected = projects.find(project => project.id === selectedId) ?? projects[0]
  const counts = useMemo(() => Object.fromEntries(statusOrder.map(status => [status, selected.tasks.filter(task => task.status === status).length])), [selected])
  const moveTask = (taskId: string, status: WorkStatus) => setProjects(current => current.map(project => project.id !== selected.id ? project : { ...project, tasks: project.tasks.map(task => task.id === taskId ? { ...task, status } : task) }))
  const toggleProjectTeam = (team: string) => setProjects(current => current.map(project => project.id !== selected.id ? project : { ...project, teams: project.teams.includes(team) ? project.teams.filter(item => item !== team) : [...project.teams, team] }))
  const removeProjectTeam = (team: string) => setProjects(current => current.map(project => project.id !== selected.id ? project : { ...project, teams: project.teams.filter(item => item !== team) }))
  const completeTask = (taskId: string) => moveTask(taskId, 'completed')
  const tabs: { id: ProjectTab; label: string }[] = [{ id:'overview',label:'Overview' },{ id:'work',label:'Work' },{ id:'team',label:'Teams' },{ id:'communication',label:'Communication' },{ id:'events',label:'Events' },{ id:'impact',label:'Impact' }]

  return <div className="rw-projects-workspace">
    <aside className="rw-project-list" aria-label="Projects"><div className="rw-project-list-header"><div><span className="rw-eyebrow">Connected work</span><h1>Projects</h1></div><button className="rw-icon-button" aria-label="Create project"><Plus size={19}/></button></div>{projects.map(project => <button key={project.id} className={`rw-project-select ${project.id === selected.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(project.id)}><strong>{project.name}</strong><span>{project.progress}% complete · {project.teams.length} teams</span></button>)}</aside>
    <section className="rw-project-detail"><header className="rw-project-header"><div><span className="rw-eyebrow">Project workspace</span><h1>{selected.name}</h1><p>{selected.description}</p></div><button className="rw-primary-button"><Plus size={18}/> Add task</button></header>
      <div className="rw-project-metrics"><div className="rw-project-progress"><span>Progress</span><strong>{selected.progress}%</strong><div className="rw-progress-track"><i style={{ width: `${selected.progress}%` }}/></div></div><div><Users size={18}/><span>Teams</span><strong>{selected.teams.length}</strong></div><div><CalendarDays size={18}/><span>Open work</span><strong>{selected.tasks.length - counts.completed}</strong></div></div>
      <div className="rw-project-tabs">{tabs.map(item => <button key={item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>
      {tab === 'team' ? <ProjectTeams teams={selected.teams} onToggle={toggleProjectTeam} onRemove={removeProjectTeam} open={teamPickerOpen} setOpen={setTeamPickerOpen}/> : <><div className="rw-project-team-strip"><span className="rw-eyebrow">Cross-functional project</span><div className="rw-tag-row">{selected.teams.map(team => <span key={team} className="rw-tag">{team}</span>)}<button className="rw-secondary-button rw-inline-add" onClick={() => setTeamPickerOpen(true)}><Plus size={16}/> Teams</button></div></div>{teamPickerOpen && <TeamPicker teams={selected.teams} onToggle={toggleProjectTeam} onClose={() => setTeamPickerOpen(false)}/>}<div className="rw-work-toolbar"><div><strong>Work</strong><span>Simple, connected responsibilities for this project.</span></div><div className="rw-view-switch"><button className={mode === 'list' ? 'is-active' : ''} onClick={() => setMode('list')}><List size={18}/></button><button className={mode === 'board' ? 'is-active' : ''} onClick={() => setMode('board')}><LayoutGrid size={18}/></button></div></div>{mode === 'list' ? <TaskList tasks={selected.tasks} onComplete={completeTask} onMove={moveTask}/> : <TaskBoard tasks={selected.tasks} onMove={moveTask}/>}</>}
    </section>
  </div>
}

function ProjectTeams({ teams, onToggle, onRemove, open, setOpen }: { teams: string[]; onToggle:(team:string)=>void; onRemove:(team:string)=>void; open:boolean; setOpen:(open:boolean)=>void }) { return <section className="rw-project-team-panel"><div><span className="rw-eyebrow">Shared responsibility</span><h2>Project teams</h2><p>A project can involve multiple teams. Each team keeps its identity while contributing to the same connected initiative.</p></div><div className="rw-project-team-list">{teams.map(team => <div key={team}><span className="rw-tag">{team}</span><button className="rw-icon-button" onClick={() => onRemove(team)} aria-label={`Remove ${team}`}><X size={16}/></button></div>)}</div><button className="rw-primary-button" onClick={() => setOpen(!open)}><Plus size={18}/> Manage teams</button>{open && <TeamPicker teams={teams} onToggle={onToggle} onClose={() => setOpen(false)}/>}</section> }
function TeamPicker({ teams, onToggle, onClose }: { teams:string[]; onToggle:(team:string)=>void; onClose:()=>void }) { return <div className="rw-modal-backdrop"><div className="rw-modal"><div className="rw-modal-header"><div><span className="rw-eyebrow">Cross-functional collaboration</span><h2>Assign teams</h2><p>Select every team involved in this project. A team can participate without being the sole owner.</p></div><button className="rw-icon-button" onClick={onClose}><X size={18}/></button></div><div className="rw-team-picker-list">{availableTeams.map(team => <label key={team}><input type="checkbox" checked={teams.includes(team)} onChange={() => onToggle(team)}/><span>{team}</span></label>)}</div><div className="rw-modal-actions"><button className="rw-primary-button" onClick={onClose}>Done</button></div></div></div> }
function TaskList({ tasks, onComplete, onMove }: { tasks: Task[]; onComplete:(id:string)=>void; onMove:(id:string,status:WorkStatus)=>void }) { return <div className="rw-task-list">{tasks.map(task => { const Icon=statusMeta[task.status].icon; return <article className={`rw-task-row status-${task.status}`} key={task.id}><button className="rw-task-check" onClick={() => task.status === 'completed' ? onMove(task.id,'not_started') : onComplete(task.id)}><Icon size={20}/></button><div className="rw-task-main"><strong>{task.title}</strong><span>{task.team && `${task.team} • `}{task.assignee ?? 'Unassigned'}</span></div>{task.due && <span className="rw-task-due">{task.due}</span>}<select value={task.status} onChange={event => onMove(task.id,event.target.value as WorkStatus)}>{statusOrder.map(status => <option key={status} value={status}>{statusMeta[status].label}</option>)}</select></article> })}</div> }
function TaskBoard({ tasks, onMove }: { tasks:Task[]; onMove:(id:string,status:WorkStatus)=>void }) { return <div className="rw-task-board">{statusOrder.map(status => <section className="rw-board-column" key={status}><header><strong>{statusMeta[status].label}</strong><span>{tasks.filter(task=>task.status===status).length}</span></header>{tasks.filter(task=>task.status===status).map(task => <article className="rw-board-task" key={task.id}><strong>{task.title}</strong><span>{task.team ?? 'No team assigned'}</span><select value={task.status} onChange={event=>onMove(task.id,event.target.value as WorkStatus)}>{statusOrder.map(option=><option key={option} value={option}>{statusMeta[option].label}</option>)}</select></article>)}</section>)}</div> }
