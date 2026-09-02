import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarClock, HeartHandshake, Moon, RefreshCw } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type Signal = { id: string; title: string; detail: string; kind: 'need' | 'prayer' | 'followup' }

export function RelationshipHealthWorkspace() {
  const { organizationId } = useReachWellContext()
  const [signals, setSignals] = useState<Signal[]>([])
  const [counts, setCounts] = useState({ needs: 0, prayers: 0, followUps: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId) return
    setLoading(true)
    setError(null)
    try {
      const [needs, prayers, followUps] = await Promise.all([
        supabase.from('needs').select('id,title,description,created_at').eq('organization_id', organizationId).in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(12),
        supabase.from('prayer_requests').select('id,request_text,created_at').eq('organization_id', organizationId).eq('status', 'open').order('created_at', { ascending: false }).limit(12),
        supabase.from('follow_ups').select('id,title,description,due_at').eq('organization_id', organizationId).neq('status', 'complete').order('due_at', { ascending: true, nullsFirst: false }).limit(12),
      ])
      if (needs.error) throw needs.error
      if (prayers.error) throw prayers.error
      if (followUps.error) throw followUps.error
      setCounts({ needs: needs.data?.length ?? 0, prayers: prayers.data?.length ?? 0, followUps: followUps.data?.length ?? 0 })
      setSignals([
        ...(needs.data ?? []).map(row => ({ id: row.id, title: row.title, detail: row.description || 'Need surfaced through outreach.', kind: 'need' as const })),
        ...(prayers.data ?? []).map(row => ({ id: row.id, title: 'Prayer request', detail: row.request_text, kind: 'prayer' as const })),
        ...(followUps.data ?? []).map(row => ({ id: row.id, title: row.title, detail: row.description || (row.due_at ? `Due ${new Date(row.due_at).toLocaleDateString()}` : 'Follow-up still open.'), kind: 'followup' as const })),
      ].slice(0, 24))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load relationship signals.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [organizationId])
  useEffect(() => {
    if (!organizationId) return
    const channel = supabase.channel(`relationship-health-${organizationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'needs', filter: `organization_id=eq.${organizationId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests', filter: `organization_id=eq.${organizationId}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_ups', filter: `organization_id=eq.${organizationId}` }, () => void load())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [organizationId])

  const grouped = useMemo(() => ({
    needs: signals.filter(item => item.kind === 'need'),
    prayers: signals.filter(item => item.kind === 'prayer'),
    followups: signals.filter(item => item.kind === 'followup'),
  }), [signals])

  return <div className="relationship-workspace">
    <div className="relationship-heading"><div><span className="rw-eyebrow">PEOPLE & RELATIONSHIPS</span><h1>Relationship Health</h1><p>See the signals that tell your team where people may need another touchpoint.</p></div><button className="rw-icon-button" onClick={() => void load()} aria-label="Refresh relationship health"><RefreshCw size={18}/></button></div>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    <div className="relationship-stats">
      <article><AlertCircle size={19}/><strong>{counts.needs}</strong><span>Open needs</span></article>
      <article><Moon size={19}/><strong>{counts.prayers}</strong><span>Open prayers</span></article>
      <article><CalendarClock size={19}/><strong>{counts.followUps}</strong><span>Open follow-ups</span></article>
    </div>
    <section className="relationship-card"><div className="relationship-card-heading"><div><span className="rw-eyebrow">CONNECTED SIGNALS</span><h2>Where another touchpoint may matter</h2></div><HeartHandshake size={22}/></div>
      {loading ? <div className="relationship-empty">Loading relationship signals…</div> : !signals.length ? <div className="relationship-empty"><HeartHandshake size={26}/><strong>No open relationship signals</strong><span>Needs, prayer requests, and follow-ups will appear here as outreach surfaces them.</span></div> : <div className="relationship-signal-grid">{signals.map(signal => <article key={`${signal.kind}-${signal.id}`} className="relationship-signal"><div className={`relationship-signal-icon ${signal.kind}`}>{signal.kind === 'need' ? <AlertCircle size={17}/> : signal.kind === 'prayer' ? <Moon size={17}/> : <CalendarClock size={17}/>}</div><div><strong>{signal.title}</strong><p>{signal.detail}</p><small>{signal.kind === 'need' ? 'Need' : signal.kind === 'prayer' ? 'Prayer' : 'Follow-up'}</small></div></article>)}</div>}
    </section>
    <div className="relationship-columns"><section><h3>Needs</h3>{grouped.needs.slice(0, 6).map(item => <div className="relationship-mini" key={item.id}><strong>{item.title}</strong><span>{item.detail}</span></div>)}{!grouped.needs.length && <p className="relationship-muted">No open needs.</p>}</section><section><h3>Prayer</h3>{grouped.prayers.slice(0, 6).map(item => <div className="relationship-mini" key={item.id}><strong>{item.title}</strong><span>{item.detail}</span></div>)}{!grouped.prayers.length && <p className="relationship-muted">No open prayer requests.</p>}</section><section><h3>Follow-ups</h3>{grouped.followups.slice(0, 6).map(item => <div className="relationship-mini" key={item.id}><strong>{item.title}</strong><span>{item.detail}</span></div>)}{!grouped.followups.length && <p className="relationship-muted">No open follow-ups.</p>}</section></div>
  </div>
}
