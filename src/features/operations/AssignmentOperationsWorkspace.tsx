import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Filter, MapPin, RefreshCw, ShieldAlert, UserRound, Users } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './assignment-operations.css'

type Assignment = {
  id: string
  title: string
  address_label: string | null
  assignment_type: string
  priority: number
  sequence_number: number | null
  status: string
  event_id: string | null
  person_id: string | null
  household_id: string | null
  assigned_team_id: string | null
  assigned_user_id: string | null
  started_at: string | null
  completed_at: string | null
  updated_at: string
}
type Team = { id: string; name: string }
type Member = { id: string; user_id: string; role: string; profile?: { full_name: string | null; first_name: string | null; last_name: string | null } | null }
type SafetyAlert = { id: string; assignment_id: string; alert_type: string; message: string | null; status: string; created_at: string }

const priorityLabel = (value: number) => value >= 5 ? 'Urgent' : value >= 4 ? 'High' : value >= 3 ? 'Normal' : value >= 2 ? 'Low' : 'Minimal'
const memberName = (member: Member) => member.profile?.full_name || [member.profile?.first_name, member.profile?.last_name].filter(Boolean).join(' ') || `User ${member.user_id.slice(0, 8)}`

export function AssignmentOperationsWorkspace() {
  const { organizationId, organizationRole } = useReachWellContext()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [alerts, setAlerts] = useState<SafetyAlert[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    try {
      const [assignmentResult, teamResult, memberResult, alertResult] = await Promise.all([
        supabase.from('assignments').select('id,title,address_label,assignment_type,priority,sequence_number,status,event_id,person_id,household_id,assigned_team_id,assigned_user_id,started_at,completed_at,updated_at').eq('organization_id', organizationId).order('status').order('priority', { ascending: false }).order('sequence_number', { ascending: true, nullsFirst: false }).limit(500),
        supabase.from('teams').select('id,name').eq('organization_id', organizationId).eq('active', true).order('name'),
        supabase.from('organization_members').select('id,user_id,role,profile:profiles(full_name,first_name,last_name)').eq('organization_id', organizationId).eq('status', 'active').order('role'),
        supabase.from('assignment_safety_alerts').select('id,assignment_id,alert_type,message,status,created_at').eq('organization_id', organizationId).neq('status', 'resolved').order('created_at', { ascending: false }).limit(100),
      ])
      if (assignmentResult.error || teamResult.error || memberResult.error || alertResult.error) throw assignmentResult.error || teamResult.error || memberResult.error || alertResult.error
      setAssignments((assignmentResult.data ?? []) as Assignment[])
      setTeams((teamResult.data ?? []) as Team[])
      setMembers((memberResult.data ?? []) as Member[])
      setAlerts((alertResult.data ?? []) as SafetyAlert[])
      setSelectedId(current => current && (assignmentResult.data ?? []).some(item => item.id === current) ? current : ((assignmentResult.data ?? [])[0]?.id ?? ''))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load assignment operations.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId])
  useEffect(() => {
    if (!organizationId) return
    const channel = supabase.channel(`assignment-operations-${organizationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `organization_id=eq.${organizationId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignment_safety_alerts', filter: `organization_id=eq.${organizationId}` }, () => void load())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [organizationId])

  const filtered = useMemo(() => assignments.filter(item => {
    const text = `${item.title} ${item.address_label ?? ''} ${item.assignment_type}`.toLowerCase()
    return (statusFilter === 'all' || item.status === statusFilter) && (priorityFilter === 'all' || String(item.priority) === priorityFilter) && (teamFilter === 'all' || item.assigned_team_id === teamFilter) && text.includes(query.trim().toLowerCase())
  }), [assignments, statusFilter, priorityFilter, teamFilter, query])
  const selected = assignments.find(item => item.id === selectedId) ?? filtered[0]
  const selectedAlerts = alerts.filter(alert => alert.assignment_id === selected?.id)
  const canManage = ['owner', 'admin', 'director', 'coordinator', 'team_leader'].includes(organizationRole ?? '')

  const updateAssignment = async (patch: Partial<Pick<Assignment, 'status' | 'priority' | 'assigned_team_id' | 'assigned_user_id' | 'sequence_number'>>) => {
    if (!selected || !organizationId || !canManage) return
    setSaving(true); setError(''); setMessage('')
    try {
      const { data, error: updateError } = await supabase.from('assignments').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', selected.id).eq('organization_id', organizationId).select('id,title,address_label,assignment_type,priority,sequence_number,status,event_id,person_id,household_id,assigned_team_id,assigned_user_id,started_at,completed_at,updated_at').single()
      if (updateError) throw updateError
      setAssignments(items => items.map(item => item.id === data.id ? data as Assignment : item))
      setMessage('Assignment updated and history preserved.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update assignment.') }
    finally { setSaving(false) }
  }
  const acknowledge = async (alertId: string) => {
    if (!organizationId || !canManage) return
    const { error: updateError } = await supabase.from('assignment_safety_alerts').update({ status: 'acknowledged', acknowledged_by: (await supabase.auth.getUser()).data.user?.id, acknowledged_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', alertId).eq('organization_id', organizationId)
    if (updateError) setError(updateError.message); else { setMessage('Safety alert acknowledged.'); void load() }
  }

  const overdueCount = assignments.filter(item => item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'skipped' && alerts.every(alert => alert.assignment_id !== item.id) && false).length
  const exceptionCount = alerts.length + overdueCount

  return <div className="assignment-operations">
    <header className="assignment-operations-heading"><div><span className="rw-eyebrow">MINISTRY OPERATIONS</span><h1>Assignment Command Center</h1><p>Route field work, set priority, see exceptions, and keep every change connected to its operational history.</p></div><button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/> {loading ? 'Refreshing…' : 'Refresh'}</button></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    {message && <div className="assignment-message" role="status">{message}</div>}
    <div className="assignment-ops-stats"><article><CheckCircle2 size={18}/><strong>{assignments.filter(a => a.status === 'completed').length}</strong><span>Complete</span></article><article><Users size={18}/><strong>{assignments.filter(a => a.status === 'in_progress').length}</strong><span>In progress</span></article><article><MapPin size={18}/><strong>{assignments.filter(a => a.status === 'pending' || a.status === 'open').length}</strong><span>Open</span></article><article className={exceptionCount ? 'has-exceptions' : ''}><ShieldAlert size={18}/><strong>{exceptionCount}</strong><span>Exceptions</span></article></div>
    <div className="assignment-ops-toolbar"><div className="assignment-search"><Filter size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search address, assignment, or type…"/></div><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="skipped">Skipped</option><option value="cancelled">Cancelled</option></select><select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)}><option value="all">All priorities</option>{[5,4,3,2,1].map(value => <option key={value} value={value.toString()}>{priorityLabel(value)}</option>)}</select><select value={teamFilter} onChange={event => setTeamFilter(event.target.value)}><option value="all">All teams</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></div>
    <div className="assignment-ops-layout"><section className="assignment-list-panel"><div className="assignment-panel-head"><div><span className="rw-eyebrow">ROUTING QUEUE</span><strong>{filtered.length} assignments</strong></div></div>{loading && <div className="assignment-empty">Loading assignments…</div>}{!loading && filtered.map(item => <button key={item.id} className={item.id === selected?.id ? 'assignment-list-row selected' : 'assignment-list-row'} onClick={() => setSelectedId(item.id)}><span className="assignment-priority" data-priority={item.priority}>{item.priority}</span><div><strong>{item.address_label || item.title}</strong><small>{item.title} · {priorityLabel(item.priority)}</small></div><span className={`assignment-status ${item.status}`}>{item.status.replace('_',' ')}</span></button>)}{!loading && !filtered.length && <div className="assignment-empty">No assignments match these filters.</div>}</section>
      <section className="assignment-detail-panel">{selected ? <><div className="assignment-detail-top"><div><span className="rw-eyebrow">ASSIGNMENT</span><h2>{selected.title}</h2><p>{selected.address_label || 'No address recorded'}</p></div><span className={`assignment-status ${selected.status}`}>{selected.status.replace('_',' ')}</span></div><div className="assignment-detail-grid"><div><label>Status</label><select value={selected.status} disabled={!canManage || saving} onChange={event => void updateAssignment({ status: event.target.value })}><option value="pending">Pending</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="skipped">Skipped</option><option value="cancelled">Cancelled</option></select></div><div><label>Priority</label><select value={selected.priority} disabled={!canManage || saving} onChange={event => void updateAssignment({ priority: Number(event.target.value) })}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{priorityLabel(value)}</option>)}</select></div><div><label>Team</label><select value={selected.assigned_team_id ?? ''} disabled={!canManage || saving} onChange={event => void updateAssignment({ assigned_team_id: event.target.value || null })}><option value="">Unassigned</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></div><div><label>Person</label><select value={selected.assigned_user_id ?? ''} disabled={!canManage || saving} onChange={event => void updateAssignment({ assigned_user_id: event.target.value || null })}><option value="">Unassigned</option>{members.map(member => <option key={member.user_id} value={member.user_id}>{memberName(member)} · {member.role}</option>)}</select></div><div><label>Sequence</label><input type="number" min="1" value={selected.sequence_number ?? ''} disabled={!canManage || saving} onChange={event => void updateAssignment({ sequence_number: event.target.value ? Number(event.target.value) : null })}/></div></div><div className="assignment-context"><span><UserRound size={16}/> {selected.person_id ? 'Person linked' : selected.household_id ? 'Household linked' : 'No relationship linked'}</span><span>{selected.event_id ? 'Event linked' : 'No event linked'}</span><span>Updated {new Date(selected.updated_at).toLocaleString()}</span></div>{selectedAlerts.length > 0 && <div className="assignment-exceptions"><div className="assignment-panel-head"><div><span className="rw-eyebrow">EXCEPTION CENTER</span><strong>Safety alerts</strong></div><AlertCircle size={18}/></div>{selectedAlerts.map(alert => <article key={alert.id}><div><strong>{alert.alert_type.replace('_',' ')}</strong><p>{alert.message || 'Field safety alert reported.'}</p><small>{new Date(alert.created_at).toLocaleString()} · {alert.status}</small></div>{alert.status === 'open' && canManage && <button className="rw-secondary-button" onClick={() => void acknowledge(alert.id)}>Acknowledge</button>}</article>)}</div>}<div className="assignment-detail-footer"><strong>Connected history</strong><span>Every routing and status change is captured in ReachWell activity and audit history.</span></div></> : <div className="assignment-empty"><h2>Select an assignment</h2><p>Choose a field assignment to route it, prioritize it, or inspect exceptions.</p></div>}</section></div>
  </div>
}
