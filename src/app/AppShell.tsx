import { useEffect, useState } from 'react'
import { BarChart3, Bell, CalendarDays, ChevronDown, Database, DollarSign, FolderKanban, HeartPulse, History, Menu, MessageCircle, Search, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { MissionMode } from '../features/mission/MissionMode'
import { ProjectsWorkspace } from '../features/projects/ProjectsWorkspace'
import { TeamsWorkspace } from '../features/teams/TeamsWorkspace'
import { PeopleWorkspace } from '../features/people/PeopleWorkspace'
import { EventsWorkspaceV2 } from '../features/events/EventsWorkspaceV2'
import { SignInWorkspace } from '../features/signin/SignInWorkspace'
import { FollowUpsWorkspace } from '../features/followups/FollowUpsWorkspace'
import { TeamProgressWorkspace } from '../features/progress/TeamProgressWorkspace'
import { ActivityWorkspace } from '../features/activity/ActivityWorkspace'
import { OperationsHub } from '../features/operations/OperationsHub'
import { TodayCommandCenter } from '../features/operations/TodayCommandCenter'
import { AssignmentOperationsWorkspace } from '../features/operations/AssignmentOperationsWorkspace'
import { RelationshipHealthWorkspace } from '../features/relationships/RelationshipHealthWorkspace'
import { RelationshipTimelineWorkspace } from '../features/relationships/RelationshipTimelineWorkspace'
import { GlobalSearchWorkspace } from '../features/search/GlobalSearchWorkspace'
import { AdminWorkspace } from '../features/admin/AdminWorkspace'
import { InvitationAcceptance } from '../features/admin/InvitationAcceptance'
import { AuditConsole } from '../features/admin/AuditConsole'
import { MoneyTrailWorkspace } from '../features/finance/MoneyTrailWorkspace'
import { FinanceReportingWorkspace } from '../features/finance/FinanceReportingWorkspace'
import { GivingWorkspace } from '../features/finance/GivingWorkspace'
import { NotificationCenter } from '../features/notifications/NotificationCenter'
import { CommunicationWorkspace } from '../features/communication/CommunicationWorkspace'
import { SettingsWorkspace } from '../features/settings/SettingsWorkspace'
import { DataContinuityWorkspace } from '../features/settings/DataContinuityWorkspace'
import { ImpactReportingWorkspace } from '../features/impact/ImpactReportingWorkspace'
import { MobileNav } from './MobileNav'
import { useReachWellContext } from '../lib/reachwellContext'
import './app.css'
import '../features/events/events.css'
import '../features/signin/signin.css'
import '../features/progress/progress.css'
import '../features/activity/activity.css'
import '../features/operations/operations.css'
import '../features/operations/assignment-operations.css'
import '../features/relationships/relationships.css'
import '../features/search/global-search.css'
import '../features/admin/audit.css'
import '../features/admin/admin.css'
import '../features/communication/communication-search.css'
import '../features/communication/communication-workspace.css'
import '../features/finance/money-trail.css'
import '../features/finance/finance-reporting.css'
import '../features/notifications/notifications.css'
import '../features/events/EventCommandCenterPanel.css'

type View = 'home'|'today'|'assignments'|'people'|'mission'|'projects'|'teams'|'events'|'signin'|'followups'|'progress'|'activity'|'relationships'|'relationship-timeline'|'communication'|'search'|'resources'|'giving'|'finance'|'moneytrail'|'finance-reporting'|'impact'|'data-continuity'|'admin'|'audit'|'notifications'|'settings'
type Metric = { label: string; value: number; description: string; icon: typeof Users; view: View }
type MoreItem = { id: View; label: string; description: string; icon: typeof Users }

const primaryNavigation: { id: View; label: string; icon: typeof Users }[] = [
  { id: 'home', label: 'Home', icon: Users },
  { id: 'people', label: 'People', icon: Users },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'mission', label: 'Mission', icon: ShieldCheck },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
]

const moreItems: MoreItem[] = [
  { id: 'today', label: 'Today', description: 'The work that matters right now', icon: CalendarDays },
  { id: 'relationships', label: 'Relationship Health', description: 'Needs, prayer, follow-ups and signals', icon: HeartPulse },
  { id: 'assignments', label: 'Assignments', description: 'Prioritize and resolve field work', icon: ShieldCheck },
  { id: 'projects', label: 'Projects', description: 'Coordinate longer-running work', icon: FolderKanban },
  { id: 'followups', label: 'Follow-Ups', description: 'Keep every next step visible', icon: CalendarDays },
  { id: 'progress', label: 'Team Progress', description: 'See service progress across teams', icon: Users },
  { id: 'activity', label: 'History', description: 'Connected activity and accountability', icon: History },
  { id: 'search', label: 'Search', description: 'Find people, work and records', icon: Search },
  { id: 'resources', label: 'Resources', description: 'Training, handbooks and files', icon: FolderKanban },
  { id: 'giving', label: 'Giving', description: 'Donors, gifts and funds', icon: DollarSign },
  { id: 'finance-reporting', label: 'Finance', description: 'Financial operations and reporting', icon: DollarSign },
  { id: 'impact', label: 'Impact Reporting', description: 'Understand the work and its reach', icon: BarChart3 },
  { id: 'data-continuity', label: 'Data Continuity', description: 'Authorized exports and retention', icon: Database },
  { id: 'admin', label: 'Administration', description: 'Organization membership and access', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Console', description: 'Security and accountability records', icon: History },
  { id: 'notifications', label: 'Notifications', description: 'Alerts and notification preferences', icon: Bell },
  { id: 'settings', label: 'Settings', description: 'Organization and personal preferences', icon: Settings },
]

export function AppShell() {
  const { user, organizationId, organizationName, organizationRole, loading: contextLoading, error: contextError } = useReachWellContext()
  const [view, setView] = useState<View>('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [signInEventId, setSignInEventId] = useState<string | undefined>()
  const [timelineTarget, setTimelineTarget] = useState<{ personId?: string; householdId?: string }>({})
  const inviteToken = new URLSearchParams(window.location.search).get('invite')
  const selectView = (next: View) => { setView(next); setMobileOpen(false); setMoreOpen(false) }
  const openSignIn = (eventId: string) => { setSignInEventId(eventId); selectView('signin') }
  const openTimeline = (target: { personId?: string; householdId?: string }) => { setTimelineTarget(target); selectView('relationship-timeline') }
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'ReachWell member'
  const initials = displayName.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase()

  if (inviteToken) return <InvitationAcceptance token={inviteToken} />

  return <div className="rw-app-shell">
    <aside className={`rw-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
      <div className="rw-brand"><span className="rw-brand-mark">R</span><span>reachwell</span></div>
      <nav>{primaryNavigation.map(({ id, label, icon: Icon }) => <button key={id} className={`rw-nav-item ${view === id ? 'is-active' : ''}`} onClick={() => selectView(id)}><Icon size={18} strokeWidth={2.1}/><span>{label}</span></button>)}</nav>
      <button className={`rw-more-trigger ${moreOpen ? 'is-active' : ''}`} onClick={() => setMoreOpen(v => !v)} aria-expanded={moreOpen}><MoreIcon/><span>More</span><ChevronDown size={15} className={moreOpen ? 'is-rotated' : ''}/></button>
      <div className="rw-sidebar-footer">Simple at the surface. Powerful underneath.</div>
    </aside>
    {mobileOpen && <button className="rw-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>} 
    {moreOpen && <><button className="rw-more-scrim" aria-label="Close more menu" onClick={() => setMoreOpen(false)}/><div className="rw-more-menu" role="menu"><div className="rw-more-header"><div><span className="rw-eyebrow">ReachWell</span><strong>More tools</strong></div><button className="rw-icon-button" onClick={() => setMoreOpen(false)} aria-label="Close more tools"><X size={18}/></button></div><div className="rw-more-grid">{moreItems.map(({ id, label, description, icon: Icon }) => <button key={id} className="rw-more-item" onClick={() => selectView(id)} role="menuitem"><span className="rw-more-icon"><Icon size={18}/></span><span><strong>{label}</strong><small>{description}</small></span></button>)}</div></div></>}
    <main className="rw-main">
      <header className="rw-topbar">
        <button className="rw-icon-button rw-mobile-menu" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle navigation">{mobileOpen ? <X size={21}/> : <Menu size={21}/>}</button>
        <div className="rw-context"><span className="rw-eyebrow">{organizationName || (contextLoading ? 'Connecting workspace' : 'Organization workspace')}</span><strong>{primaryNavigation.find(n => n.id === view)?.label ?? (view === 'relationship-timeline' ? 'Connected History' : view === 'signin' ? 'Event Sign-In' : moreItems.find(item => item.id === view)?.label ?? view)}</strong></div>
        <div className="rw-topbar-actions"><button className="rw-icon-button" aria-label="Open search" onClick={() => selectView('search')}><Search size={19}/></button><button className="rw-user-menu" onClick={() => selectView('settings')} title="Open account and preferences"><span className="rw-avatar">{initials || 'RW'}</span><span className="rw-user-copy"><strong>{displayName}</strong><small>{organizationRole || (contextError ? 'Organization access required' : 'ReachWell member')}</small></span><ChevronDown size={16}/></button></div>
      </header>
      {contextError && <div className="rw-context-alert" role="status">{contextError}</div>}
      <section className="rw-content">
        {view === 'home' && <Overview onNavigate={selectView} organizationId={organizationId}/>} 
        {view === 'today' && <TodayCommandCenter onOpenMission={() => selectView('mission')}/>} 
        {view === 'assignments' && <AssignmentOperationsWorkspace/>}
        {view === 'people' && <PeopleWorkspace/>}
        {view === 'mission' && <MissionMode/>}
        {view === 'projects' && <ProjectsWorkspace/>}
        {view === 'teams' && <TeamsWorkspace/>}
        {view === 'events' && <EventsWorkspaceV2 onOpenSignIn={openSignIn} onOpenAssignments={() => selectView('assignments')}/>} 
        {view === 'signin' && <SignInWorkspace eventId={signInEventId} onBack={() => selectView('events')}/>} 
        {view === 'relationships' && <RelationshipHealthWorkspace onOpenTimeline={openTimeline}/>} 
        {view === 'relationship-timeline' && <RelationshipTimelineWorkspace personId={timelineTarget.personId} householdId={timelineTarget.householdId} onBack={() => selectView('relationships')}/>} 
        {view === 'followups' && <FollowUpsWorkspace/>}
        {view === 'progress' && <TeamProgressWorkspace/>}
        {view === 'activity' && <ActivityWorkspace/>}
        {view === 'communication' && <CommunicationWorkspace/>}
        {view === 'search' && <GlobalSearchWorkspace/>}
        {view === 'resources' && <OperationsHub section="resources"/>}
        {view === 'giving' && <GivingWorkspace/>}
        {view === 'finance' && <FinanceReportingWorkspace/>}
        {view === 'moneytrail' && <MoneyTrailWorkspace/>}
        {view === 'finance-reporting' && <FinanceReportingWorkspace/>}
        {view === 'impact' && <ImpactReportingWorkspace/>}
        {view === 'data-continuity' && <DataContinuityWorkspace/>}
        {view === 'admin' && <AdminWorkspace/>}
        {view === 'audit' && <AuditConsole/>}
        {view === 'notifications' && <NotificationCenter/>}
        {view === 'settings' && <SettingsWorkspace/>}
      </section>
      <MobileNav view={view} onNavigate={selectView} onMore={() => setMoreOpen(true)}/>
    </main>
  </div>
}

function MoreIcon() { return <span className="rw-more-dots" aria-hidden="true"><i/><i/><i/></span> }

function Overview({ onNavigate, organizationId }: { onNavigate: (view: View) => void; organizationId: string | null }) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!organizationId) { setMetrics([]); setLoading(false); return }
    const load = async () => {
      setLoading(true)
      const results = await Promise.all([
        supabase.from('people').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'active'),
        supabase.from('teams').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('active', true),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('starts_at', new Date().toISOString()),
        supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).in('status', ['pending', 'open', 'in_progress']),
        supabase.from('follow_ups').select('id', { count: 'exact', head: true }).neq('status', 'completed').eq('organization_id', organizationId),
      ])
      setMetrics([
        { label: 'People', value: results[0].count ?? 0, description: 'People connected to your work', icon: Users, view: 'people' },
        { label: 'Teams', value: results[1].count ?? 0, description: 'Active teams ready to serve', icon: Users, view: 'teams' },
        { label: 'Upcoming events', value: results[2].count ?? 0, description: 'Events on the calendar', icon: CalendarDays, view: 'events' },
        { label: 'Open work', value: results[3].count ?? 0, description: 'Assignments still in motion', icon: ShieldCheck, view: 'assignments' },
        { label: 'Follow-ups', value: results[4].count ?? 0, description: 'Next steps needing attention', icon: HeartPulse, view: 'followups' },
      ])
      setLoading(false)
    }
    void load()
  }, [organizationId])
  return <div className="rw-overview">
    <div className="rw-home-heading"><div><span className="rw-eyebrow">Your workspace</span><h1>Outreach made simple.</h1><p>Everything you need to organize people, teams and the work that matters.</p></div><button className="rw-primary-button" onClick={() => onNavigate('mission')}>Enter Mission</button></div>
    <div className="rw-metric-grid rw-metric-grid-compact">{metrics.map(({ label, value, description, icon: Icon, view }) => <button className="rw-metric-card" key={label} onClick={() => onNavigate(view)}><Icon size={18}/><strong>{loading ? '—' : value}</strong><span>{label}</span><small>{description}</small></button>)}{!loading && !metrics.length && <div className="rw-empty-state">Connect an organization to see live operations.</div>}</div>
    <div className="rw-home-sections">
      <button className="rw-home-row rw-home-row-primary" onClick={() => onNavigate('today')}><span className="rw-home-row-icon"><CalendarDays size={20}/></span><span><strong>Today</strong><small>See the work, events and follow-ups that matter now.</small></span><ChevronDown size={18} className="rw-chevron-right"/></button>
      <button className="rw-home-row" onClick={() => onNavigate('mission')}><span className="rw-home-row-icon"><ShieldCheck size={20}/></span><span><strong>Mission</strong><small>Step into the focused field experience.</small></span><ChevronDown size={18} className="rw-chevron-right"/></button>
      <button className="rw-home-row" onClick={() => onNavigate('relationships')}><span className="rw-home-row-icon"><HeartPulse size={20}/></span><span><strong>Relationship Health</strong><small>Needs, prayer and follow-ups in one connected view.</small></span><ChevronDown size={18} className="rw-chevron-right"/></button>
      <button className="rw-home-row" onClick={() => onNavigate('communication')}><span className="rw-home-row-icon"><MessageCircle size={20}/></span><span><strong>Communication</strong><small>Keep conversations close to the work they support.</small></span><ChevronDown size={18} className="rw-chevron-right"/></button>
    </div>
  </div>
}
