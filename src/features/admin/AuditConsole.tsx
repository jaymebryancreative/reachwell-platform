import { useEffect, useMemo, useState } from 'react'
import { Activity, ChevronDown, ChevronUp, Filter, RefreshCw, ShieldCheck } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './audit.css'

type AuditRow = {
  id: string
  organization_id: string
  actor_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

type Profile = { id: string; full_name: string | null; first_name: string | null; last_name: string | null }

const entityLabels: Record<string, string> = {
  organization_members: 'Organization member',
  organization_invitations: 'Invitation',
  people: 'Person',
  teams: 'Team',
  events: 'Event',
  assignments: 'Assignment',
  follow_ups: 'Follow-up',
  needs: 'Need',
  prayer_requests: 'Prayer request',
  financial_transactions: 'Financial transaction',
  giving_transactions: 'Giving transaction',
  sales_transactions: 'Sale',
  projects: 'Project',
  tasks: 'Task',
  communication_channels: 'Communication channel',
  communication_messages: 'Communication message',
  communication_announcements: 'Announcement',
  organization_files: 'Organization file',
  organization_exports: 'Export',
  assignment_safety_alerts: 'Safety alert',
  assignment_objectives: 'Assignment objective',
  assignment_visits: 'Assignment visit',
}

const actorName = (profile?: Profile) => {
  if (!profile) return 'System / unavailable'
  return profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'ReachWell member'
}

const pretty = (value: unknown) => JSON.stringify(value, null, 2)

export function AuditConsole() {
  const { organizationId, organizationRole } = useReachWellContext()
  const [rows, setRows] = useState<AuditRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [action, setAction] = useState('all')
  const [entity, setEntity] = useState('all')
  const [range, setRange] = useState('30')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!organizationId) return
    setLoading(true)
    setError('')
    try {
      const since = range === 'all' ? undefined : new Date(Date.now() - Number(range) * 86400000).toISOString()
      let request = supabase.from('audit_log').select('id,organization_id,actor_id,entity_type,entity_id,action,old_data,new_data,created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(500)
      if (since) request = request.gte('created_at', since)
      if (action !== 'all') request = request.eq('action', action)
      if (entity !== 'all') request = request.eq('entity_type', entity)
      const { data, error: loadError } = await request
      if (loadError) throw loadError
      const nextRows = (data ?? []) as AuditRow[]
      setRows(nextRows)
      const actorIds = [...new Set(nextRows.map(row => row.actor_id).filter((id): id is string => Boolean(id)))]
      if (actorIds.length) {
        const { data: people, error: profileError } = await supabase.from('profiles').select('id,full_name,first_name,last_name').in('id', actorIds)
        if (profileError) throw profileError
        setProfiles(Object.fromEntries(((people ?? []) as Profile[]).map(profile => [profile.id, profile])))
      } else {
        setProfiles({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load audit history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [organizationId, action, entity, range])

  const entities = useMemo(() => [...new Set(rows.map(row => row.entity_type))].sort(), [rows])
  const actions = useMemo(() => [...new Set(rows.map(row => row.action))].sort(), [rows])
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return rows
    return rows.filter(row => `${row.entity_type} ${row.action} ${row.entity_id ?? ''} ${row.actor_id ?? ''} ${JSON.stringify(row.new_data ?? {})}`.toLowerCase().includes(normalized))
  }, [rows, query])
  const summary = useMemo(() => ({
    total: filtered.length,
    creates: filtered.filter(row => row.action === 'insert').length,
    updates: filtered.filter(row => row.action === 'update').length,
    deletes: filtered.filter(row => row.action === 'delete').length,
  }), [filtered])

  const allowed = ['owner', 'admin', 'director'].includes(organizationRole ?? '')
  if (!allowed) {
    return <div className="audit-console"><div className="audit-locked"><ShieldCheck size={28} /><h1>Audit Console</h1><p>Audit history is restricted to organization owners, administrators, and directors.</p></div></div>
  }

  return <div className="audit-console">
    <header className="audit-heading">
      <div><span className="rw-eyebrow">ADMINISTRATION & ACCOUNTABILITY</span><h1>Audit Console</h1><p>A durable record of who changed organizational data, what changed, and when.</p></div>
      <button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> {loading ? 'Refreshing…' : 'Refresh'}</button>
    </header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    <div className="audit-summary">
      <div><span>Visible events</span><strong>{summary.total}</strong></div>
      <div><span>Created</span><strong>{summary.creates}</strong></div>
      <div><span>Updated</span><strong>{summary.updates}</strong></div>
      <div><span>Deleted</span><strong>{summary.deletes}</strong></div>
    </div>
    <div className="audit-filters">
      <div className="audit-search"><Activity size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search actor, entity, ID, or changed data…" /></div>
      <label><Filter size={14} /><span>Action</span><select value={action} onChange={event => setAction(event.target.value)}><option value="all">All actions</option>{actions.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <label><span>Entity</span><select value={entity} onChange={event => setEntity(event.target.value)}><option value="all">All entities</option>{entities.map(value => <option key={value} value={value}>{entityLabels[value] || value}</option>)}</select></label>
      <label><span>Range</span><select value={range} onChange={event => setRange(event.target.value)}><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="all">All history</option></select></label>
    </div>
    <div className="audit-list">
      {loading && <div className="rw-empty-state">Loading audit history…</div>}
      {!loading && filtered.map(row => {
        const isOpen = expanded === row.id
        const name = actorName(row.actor_id ? profiles[row.actor_id] : undefined)
        return <article className="audit-row" key={row.id}>
          <button className="audit-row-main" onClick={() => setExpanded(isOpen ? null : row.id)} aria-expanded={isOpen}>
            <span className={`audit-action audit-${row.action}`}>{row.action}</span>
            <span className="audit-entity"><strong>{entityLabels[row.entity_type] || row.entity_type}</strong><small>{row.entity_id ? row.entity_id.slice(0, 12) : 'No entity ID'}</small></span>
            <span className="audit-actor"><strong>{name}</strong><small>{row.actor_id ? row.actor_id.slice(0, 12) : 'Automated/system event'}</small></span>
            <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
            <span className="audit-chevron">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
          </button>
          {isOpen && <div className="audit-detail"><div><span>Previous state</span><pre>{pretty(row.old_data ?? {})}</pre></div><div><span>New state</span><pre>{pretty(row.new_data ?? {})}</pre></div></div>}
        </article>
      })}
      {!loading && !filtered.length && <div className="rw-empty-state"><h2>No audit events yet</h2><p>ReachWell will record future changes across people, teams, events, field work, communication, finance, resources, and administration.</p></div>}
    </div>
  </div>
}
