import { useState } from 'react'
import { Bell, CalendarDays, ChevronDown, FolderKanban, Home, Menu, MessageCircle, ShieldCheck, Users, X } from 'lucide-react'
import { MissionMode } from '../features/mission/MissionMode'
import { ProjectsWorkspace } from '../features/projects/ProjectsWorkspace'
import { TeamsWorkspace } from '../features/teams/TeamsWorkspace'
import './app.css'

type View = 'home' | 'mission' | 'projects' | 'teams' | 'events' | 'communication' | 'admin'

const navigation: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'mission', label: 'Mission Mode', icon: ShieldCheck },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'admin', label: 'Administration', icon: ShieldCheck },
]

export function AppShell() {
  const [view, setView] = useState<View>('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const selectView = (next: View) => { setView(next); setMobileOpen(false) }

  return <div className="rw-app-shell">
    <aside className={`rw-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
      <div className="rw-brand"><span className="rw-brand-mark">R</span><span>reachwell</span></div>
      <nav>{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`rw-nav-item ${view === id ? 'is-active' : ''}`} onClick={() => selectView(id)}><Icon size={19} strokeWidth={2.1}/><span>{label}</span></button>)}</nav>
      <div className="rw-sidebar-footer">Built for people who show up.</div>
    </aside>
    {mobileOpen && <button className="rw-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <main className="rw-main">
      <header className="rw-topbar">
        <button className="rw-icon-button rw-mobile-menu" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle navigation">{mobileOpen ? <X size={21}/> : <Menu size={21}/>}</button>
        <div className="rw-context"><span className="rw-eyebrow">Organization workspace</span><strong>{navigation.find(n => n.id === view)?.label}</strong></div>
        <div className="rw-topbar-actions"><button className="rw-icon-button" aria-label="Notifications"><Bell size={19}/></button><button className="rw-user-menu"><span className="rw-avatar">JB</span><span className="rw-user-copy"><strong>Jordan Bryan</strong><small>Organization Owner</small></span><ChevronDown size={16}/></button></div>
      </header>
      <section className="rw-content">
        {view === 'home' && <Overview onNavigate={selectView}/>}
        {view === 'mission' && <MissionMode/>}
        {view === 'projects' && <ProjectsWorkspace/>}
        {view === 'teams' && <TeamsWorkspace/>}
        {view === 'events' && <ComingSoon title="Events" description="Event planning, event-specific teams, attendance, assignments, and field workflows are next in the clean rebuild."/>}
        {view === 'communication' && <ComingSoon title="Communication" description="Organization announcements, team channels, event channels, and assignment discussions will live here."/>}
        {view === 'admin' && <ComingSoon title="Administration" description="Roles, granular permissions, organization settings, security, and audit controls will live here."/>}
      </section>
    </main>
  </div>
}

function Overview({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <div className="rw-overview">
    <div className="rw-hero"><div><span className="rw-eyebrow">Ready to serve</span><h1>One place to organize the work that matters.</h1><p>Reachwell brings people, teams, projects, events, communication, and field operations into one connected workspace.</p></div><button className="rw-primary-button" onClick={() => onNavigate('mission')}>Enter Mission Mode</button></div>
    <div className="rw-overview-grid">
      <button className="rw-feature-card" onClick={() => onNavigate('projects')}><FolderKanban size={22}/><strong>Organize the work</strong><span>Plan projects, assign simple responsibilities, and see progress without project-management jargon.</span></button>
      <button className="rw-feature-card" onClick={() => onNavigate('teams')}><Users size={22}/><strong>Build your teams</strong><span>Create custom teams, appoint leaders, and organize the people serving with you.</span></button>
      <button className="rw-feature-card" onClick={() => onNavigate('communication')}><MessageCircle size={22}/><strong>Keep teams connected</strong><span>Communication stays connected to the organization, team, event, project, or assignment where it belongs.</span></button>
    </div>
  </div>
}

function ComingSoon({ title, description }: { title: string; description: string }) { return <div className="rw-empty-state"><span className="rw-eyebrow">Clean rebuild in progress</span><h1>{title}</h1><p>{description}</p></div> }
