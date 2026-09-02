import { useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { listTeamProgress, type TeamProgressRecord } from '../../lib/reachwellApi'
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
    const map = new Map<string, { name: string; total: number; complete: number; active: number }>()
    assignments.forEach(item => { const key = item.team?.id ?? 'unassigned'; const current = map.get(key) ?? { name: item.team?.name ?? 'Unassigned', total: 0, complete: 0, active: 0 }; current.total += 1; current.active += item.status === 'in_progress' ? 1 : 0; map.set(key, current) })
    return [...map.values()].map(group => ({ ...group, progress: group.total ? Math.round((group.active / group.total) * 100) : 0 }))
  }, [assignments])

  return <div className="progress-workspace"><div className="progress-heading"><div><span className="rw-eyebrow">FIELD OPERATIONS</span><h1>Team progress</h1><p>See where teams are actively working without exposing unrelated assignments.</p></div><button className="rw-icon-button" onClick={() => void load()} aria-label="Refresh team progress"><RefreshCw size={18}/></button></div>{error && <div className="rw-context-alert" role="alert">{error}</div>}<div className="progress-grid">{groups.map(group => <article className="progress-card" key={group.name}><div className="progress-card-top"><div><strong>{group.name}</strong><span>{group.active} active · {group.total} open</span></div><Activity size={18}/></div><div className="progress-track"><span style={{ width: `${group.progress}%` }}/></div><div className="progress-percent">{group.progress}% actively working</div></article>)}{!loading && !groups.length && <div className="followup-empty"><Activity size={22}/><strong>No active team assignments</strong><span>Team progress will appear here when field assignments are active.</span></div>}{loading && <div className="followup-empty">Loading team progress…</div>}</div></div>
}
