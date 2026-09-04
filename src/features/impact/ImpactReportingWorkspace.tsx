import { useEffect, useState } from 'react'
import { Activity, BarChart3, CalendarDays, CheckCircle2, HeartPulse, RefreshCw, Users } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type Metric = { label: string; value: number; detail: string; icon: typeof Activity }

export function ImpactReportingWorkspace() {
  const { organizationId } = useReachWellContext()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    const since = new Date(); since.setDate(since.getDate() - 30)
    const [people, teams, events, attendance, assignments, completed, needs, prayers, followups] = await Promise.all([
      supabase.from('people').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'active'),
      supabase.from('teams').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('active', true),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('starts_at', since.toISOString()),
      supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('attendance_status', 'present').in('event_id', (await supabase.from('events').select('id').eq('organization_id', organizationId).gte('starts_at', since.toISOString())).data?.map(e => e.id) ?? ['00000000-0000-0000-0000-000000000000']),
      supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('created_at', since.toISOString()),
      supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'completed').gte('completed_at', since.toISOString()),
      supabase.from('needs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('created_at', since.toISOString()),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('created_at', since.toISOString()),
      supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('created_at', since.toISOString()),
    ])
    const firstError = [people, teams, events, attendance, assignments, completed, needs, prayers, followups].find(result => result.error)?.error
    if (firstError) setError(firstError.message)
    setMetrics([
      { label: 'Active people', value: people.count ?? 0, detail: 'People connected to the organization', icon: Users },
      { label: 'Active teams', value: teams.count ?? 0, detail: 'Teams serving right now', icon: Users },
      { label: 'Events · 30 days', value: events.count ?? 0, detail: 'Events scheduled in the last 30 days', icon: CalendarDays },
      { label: 'Present check-ins', value: attendance.count ?? 0, detail: 'Attendance recorded as present', icon: CheckCircle2 },
      { label: 'Assignments · 30 days', value: assignments.count ?? 0, detail: 'Field assignments created', icon: Activity },
      { label: 'Completed assignments', value: completed.count ?? 0, detail: 'Field work completed', icon: CheckCircle2 },
      { label: 'Needs surfaced', value: needs.count ?? 0, detail: 'Needs identified through outreach', icon: HeartPulse },
      { label: 'Prayer requests', value: prayers.count ?? 0, detail: 'Prayer requests recorded', icon: HeartPulse },
      { label: 'Follow-ups created', value: followups.count ?? 0, detail: 'Next steps connected to care', icon: Activity },
    ])
    setLoading(false)
  }

  useEffect(() => { void load() }, [organizationId])
  const completedCount = metrics.find(m => m.label === 'Completed assignments')?.value ?? 0
  const assignmentCount = metrics.find(m => m.label === 'Assignments · 30 days')?.value ?? 0
  const completionRate = assignmentCount ? Math.round((completedCount / assignmentCount) * 100) : 0

  return <div className="rw-overview">
    <header className="money-trail-heading"><div><span className="rw-eyebrow">REACHWELL IMPACT</span><h1>Impact & Reporting</h1><p>See how people, teams, serving, outreach, attendance, care, and follow-up connect.</p></div><button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/> {loading ? 'Refreshing…' : 'Refresh'}</button></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    <div className="rw-metric-grid">{metrics.map(({ label, value, detail, icon: Icon }) => <div className="rw-metric-card" key={label}><Icon size={20}/><strong>{loading ? '—' : value}</strong><span>{label}</span><small>{detail}</small></div>)}</div>
    <section className="rw-card" style={{ marginTop: 18 }}><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}><div><span className="rw-eyebrow">FIELD COMPLETION</span><h2 style={{ margin:'4px 0' }}>Mission completion rate</h2><p style={{ margin:0 }}>Completed field assignments compared with assignments created in the last 30 days.</p></div><strong style={{ fontSize:32 }}>{loading ? '—' : `${completionRate}%`}</strong></div><div style={{ height:10, borderRadius:999, background:'rgba(100,80,160,.12)', overflow:'hidden', marginTop:18 }}><div style={{ height:'100%', width:`${completionRate}%`, background:'linear-gradient(90deg,#8b5cf6,#ec4899)', borderRadius:999, transition:'width .3s ease' }}/></div></section>
    <section className="rw-card" style={{ marginTop:18 }}><div style={{ display:'flex', gap:12, alignItems:'center' }}><BarChart3 size={22}/><div><h2 style={{ margin:0 }}>Connected reporting foundation</h2><p style={{ margin:'4px 0 0' }}>These metrics are read directly from the organization-scoped operational records; no demo data is generated.</p></div></div></section>
  </div>
}
