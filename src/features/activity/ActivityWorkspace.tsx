import { useEffect, useState } from 'react'
import { Activity, CheckCircle2, CircleAlert, FileText, Heart, MapPin, RefreshCw } from 'lucide-react'
import { listAssignmentActivity, listAssignments, type AssignmentActivityRecord, type AssignmentRecord } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'
import './activity.css'

const labels: Record<string, string> = {
  assignment_created: 'Assignment created', assignment_status_changed: 'Assignment status changed', assignment_updated: 'Assignment updated',
  objective_created: 'Objective added', objective_completed: 'Objective completed', objective_updated: 'Objective updated',
  visit_started: 'Visit started', visit_finished: 'Visit finished', visit_updated: 'Visit updated', note_added: 'Note added',
  need_recorded: 'Need recorded', prayer_recorded: 'Prayer request recorded', follow_up_created: 'Follow-up created', follow_up_completed: 'Follow-up completed', follow_up_updated: 'Follow-up updated',
}

function iconFor(type: string) {
  if (type.includes('visit')) return MapPin
  if (type.includes('objective') || type.includes('complete')) return CheckCircle2
  if (type.includes('need')) return CircleAlert
  if (type.includes('prayer')) return Heart
  if (type.includes('note')) return FileText
  return Activity
}

export function ActivityWorkspace() {
  const { organizationId, user } = useReachWellContext()
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [activity, setActivity] = useState<AssignmentActivityRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!organizationId || !user) return
    setLoading(true)
    void listAssignments(organizationId, user.id).then(items => {
      setAssignments(items)
      setSelectedId(current => current || items[0]?.id || '')
    }).catch(err => setError(err instanceof Error ? err.message : 'Unable to load assignments.')).finally(() => setLoading(false))
  }, [organizationId, user?.id])

  useEffect(() => {
    if (!selectedId) { setActivity([]); return }
    setLoading(true)
    void listAssignmentActivity(selectedId).then(setActivity).catch(err => setError(err instanceof Error ? err.message : 'Unable to load history.')).finally(() => setLoading(false))
  }, [selectedId])

  const selected = assignments.find(item => item.id === selectedId)

  return <div className="activity-workspace">
    <div className="activity-hero"><div><span className="rw-eyebrow">FIELD HISTORY</span><h1>See what happened, and who moved it forward.</h1><p>Every meaningful field action can leave a durable trail attached to the assignment.</p></div><button className="activity-refresh" onClick={() => selectedId && void listAssignmentActivity(selectedId).then(setActivity)} aria-label="Refresh history"><RefreshCw size={18}/></button></div>
    <div className="activity-layout">
      <section className="activity-panel"><div className="activity-panel-head"><strong>Assignments</strong><span>{assignments.length}</span></div>{loading && !assignments.length && <p className="activity-muted">Loading…</p>}{!loading && !assignments.length && <p className="activity-muted">No open assignments are assigned to you or your teams.</p>}{assignments.map(item => <button key={item.id} className={item.id === selectedId ? 'activity-assignment selected' : 'activity-assignment'} onClick={() => setSelectedId(item.id)}><span>{item.address_label || item.title}</span><small>{item.status.replaceAll('_', ' ')}</small></button>)}</section>
      <section className="activity-panel activity-timeline"><div className="activity-panel-head"><div><strong>{selected?.address_label || selected?.title || 'Assignment history'}</strong><small>{selected?.title || 'Select an assignment'}</small></div><span>{activity.length}</span></div>{error && <div className="activity-error">{error}</div>}{!activity.length && !loading && <div className="activity-empty"><Activity size={28}/><strong>No history yet</strong><p>As field actions happen, they will appear here automatically.</p></div>}{activity.map(item => { const Icon = iconFor(item.activity_type); return <article className="activity-item" key={item.id}><span className="activity-icon"><Icon size={16}/></span><div><strong>{labels[item.activity_type] || item.activity_type.replaceAll('_', ' ')}</strong><p>{typeof item.metadata.title === 'string' ? item.metadata.title : typeof item.metadata.summary === 'string' ? item.metadata.summary : 'Recorded in ReachWell.'}</p><time>{new Date(item.created_at).toLocaleString()}</time></div></article> })}</section>
    </div>
  </div>
}
