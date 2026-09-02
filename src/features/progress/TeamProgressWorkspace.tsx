import { useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { listTeamProgress, type TeamProgressRecord } from '../../lib/reachwellApi'
import { getAssignmentProgress } from '../../lib/fieldWorkflow'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

export function TeamProgressWorkspace() {
  const { organizationId } = useReachWellContext()
  const [assignments, setAssignments] = useState<TeamProgressRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => { if (!organizationId) return; setLoading(true); try { setAssignments(await listTeamProgress(organizationId)); setError(null) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load team progress.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [organizationId])
  useEffect(() => {
    if (!organizationId) return
    const channel = supabase.channel(`team-progress-${organizationId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `organization_id=eq.${organizationId}` }, () => void load()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [organizationId])

  const groups = useMemo(() => {
    const map = new Map<string, TeamProgressRecord[]>()
    assignments.forEach(item => { const key = item.team?.id ?? 'unassigned'; const current = map.get(key) ?? []; current.push(item); map.set(key, current) })
    return [...map.entries()].map(([key, items]) => {
      const progress = getAssignmentProgress(items)
      return { key, name: items[0]?.team?.name ?? 'Unassigned', ...progress }
    })
  }, [assignments])

  return <div className="progress-workspace"><div className="progress-heading"><div><span className="rw-eyebrow">FIELD OPERATIONS</span><h1>Team progress</h1><p>See where teams are actively working and how much assigned work is complete.</p></div><button className="rw-icon-button" onClick={() => void load()} aria-label="Refresh team progress"><RefreshCw size={18}/></button></div>{error && <div className="rw-context-alert" role="alert">{error}</div>}<div className="progress-grid">{groups.map(group => <article className="progress-card" key={group.key}><div className="progress-card-top"><div><strong>{group.name}</strong><span>{group.completed} complete · {group.active} active · {group.open} open</span></div><Activity size={18}/></div><div className="progress-track"><span style={{ width: `${group.percent}%` }}/></div><div className="progress-percent">{group.percent}% complete</div></article>)}{!loading && !groups.length && <div className="followup-empty"><Activity size={22}/><strong>No team assignments yet</strong><span>Team progress will appear here when field assignments are created.</span></div>}{loading && <div className="followup-empty">Loading team progress…</div>}</div></div>
}
