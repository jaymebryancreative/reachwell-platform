import { useState } from 'react'
import { Bell, CalendarDays, ChevronDown, FolderKanban, Home, Menu, MessageCircle, ShieldCheck, Users, X } from 'lucide-react'
import { MissionMode } from '../features/mission/MissionMode'
import { ProjectsWorkspace } from '../features/projects/ProjectsWorkspace'
import { TeamsWorkspace } from '../features/teams/TeamsWorkspace'
import { PeopleWorkspace } from '../features/people/PeopleWorkspace'
import { useReachWellContext } from '../lib/reachwellContext'
import './app.css'

type View = 'home' | 'people' | 'mission' | 'projects' | 'teams' | 'events' | 'communication' | 'admin'

const navigation: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'people', label: 'People', icon: Users },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'mission', label: 'Mission Mode', icon: ShieldCheck },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'admin', label: 'Administration', icon: ShieldCheck },
]

export function AppShell() {
  const { user, organizationName, organizationRole, loading: contextLoading, error: contextError } = useReachWellContext()
  const [view, setView] = useState<View>('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const selectView = (next: View) => { setView(next); setMobileOpen(false) }
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'ReachWell member'
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

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
        <div className="rw-context"><span className="rw-eyebrow">{organizationName || (contextLoading ? 'Connecting workspace' : 'Organization workspace')}</span><strong>{navigation.find(n => n.id === view)?.label}</strong></div>
        <div className="rw-topbar-actions"><button className="rw-icon-button" aria-label="Notifications"><Bell size={19}/></button><button className="rw-user-menu"><span className="rw-avatar">{initials || 'RW'}</span><span className="rw-user-copy"><strong>{displayName}</strong><small>{organizationRole || (contextError ? 'Organization access required' : 'ReachWell member')}</small></span><ChevronDown size={16}/></button></div>
      </header>
      {contextError && <div className="rw-context-alert" role="status">{contextError}</div>}
      <section className="rw-content">
        {view === 'home' && <Overview onNavigate={selectView}/>} 
        {view === 'people' && <PeopleWorkspace/>}
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
      <button className="rw-feature-card" onClick={() => onNavigate('people')}><Users size={22}/><strong>Know your people</strong><span>Build connected profiles, organize relationships, and see where people serve.</span></button>
      <button className="rw-feature-card" onClick={() => onNavigate('teams')}><Users size={22}/><strong>Build your teams</strong><span>Create custom teams, appoint leaders, and organize the people serving with you.</span></button>
      <button className="rw-feature-card" onClick={() => onNavigate('communication')}><MessageCircle size={22}/><strong>Keep teams connected</strong><span>Communication stays connected to the organization, team, event, project, or assignment where it belongs.</span></button>
    </div>
  </div>
}

function ComingSoon({ title, description }: { title: string; description: string }) { return <div className="rw-empty-state"><span className="rw-eyebrow">Clean rebuild in progress</span><h1>{title}</h1><p>{description}</p></div> }
