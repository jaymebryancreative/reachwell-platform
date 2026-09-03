import { FormEvent, useState } from 'react'
import { CalendarDays, FileText, MessageCircle, Search, UserRound } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type Result = { id: string; type: string; title: string; detail: string }

export function GlobalSearchWorkspace() {
  const { organizationId } = useReachWellContext()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const runSearch = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!organizationId || query.trim().length < 2) return
    setLoading(true); setSearched(true); setError('')
    try {
      const term = `%${query.trim()}%`
      const [people, households, assignments, followUps, events] = await Promise.all([
        supabase.from('people').select('id,first_name,last_name,preferred_name,email,phone').eq('organization_id', organizationId).eq('status', 'active').or(`first_name.ilike.${term},last_name.ilike.${term},preferred_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`).limit(20),
        supabase.from('households').select('id,household_name,address_line1,city,state').eq('organization_id', organizationId).neq('status', 'archived').or(`household_name.ilike.${term},address_line1.ilike.${term},city.ilike.${term}`).limit(20),
        supabase.from('assignments').select('id,title,address_label,status').eq('organization_id', organizationId).ilike('title', term).limit(20),
        supabase.from('follow_ups').select('id,title,description,status').eq('organization_id', organizationId).neq('status', 'complete').ilike('title', term).limit(20),
        supabase.from('events').select('id,name,event_type,starts_at,location_name').eq('organization_id', organizationId).or(`name.ilike.${term},event_type.ilike.${term},location_name.ilike.${term}`).limit(20),
      ])
      const firstError = [people, households, assignments, followUps, events].find(item => item.error)?.error
      if (firstError) throw firstError
      setResults([
        ...(people.data ?? []).map(row => ({ id: row.id, type: 'Person', title: row.preferred_name || `${row.first_name} ${row.last_name || ''}`.trim(), detail: row.email || row.phone || 'Person record' })),
        ...(households.data ?? []).map(row => ({ id: row.id, type: 'Household', title: row.household_name || 'Household', detail: [row.address_line1, row.city, row.state].filter(Boolean).join(', ') || 'Household record' })),
        ...(assignments.data ?? []).map(row => ({ id: row.id, type: 'Assignment', title: row.title, detail: `${row.status} · ${row.address_label || 'No address'}` })),
        ...(followUps.data ?? []).map(row => ({ id: row.id, type: 'Follow-up', title: row.title, detail: row.description || row.status })),
        ...(events.data ?? []).map(row => ({ id: row.id, type: 'Event', title: row.name, detail: `${new Date(row.starts_at).toLocaleDateString()} · ${row.location_name || row.event_type}` })),
      ])
    } catch (err) { setResults([]); setError(err instanceof Error ? err.message : 'Unable to search the organization.') }
    finally { setLoading(false) }
  }

  const iconFor = (type: string) => type === 'Person' ? <UserRound size={17}/> : type === 'Event' ? <CalendarDays size={17}/> : type === 'Assignment' || type === 'Follow-up' ? <FileText size={17}/> : <MessageCircle size={17}/>

  return <div className="global-search-workspace"><header className="global-search-heading"><div><span className="rw-eyebrow">REACHWELL SEARCH</span><h1>Search everything that matters.</h1><p>Find people, households, assignments, follow-ups, and events inside your organization.</p></div></header><form className="global-search-form" onSubmit={event => void runSearch(event)}><Search size={19}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search people, households, assignments, follow-ups, events…"/><button className="rw-primary-button" disabled={loading || query.trim().length < 2}>{loading ? 'Searching…' : 'Search'}</button></form>{error && <div className="rw-context-alert" role="alert">{error}</div>}{searched && !loading && !results.length && !error && <div className="rw-empty-state"><h2>No matches</h2><p>Try a name, street, assignment, follow-up, or event keyword.</p></div>}<section className="global-search-results">{results.map(result => <article className="global-search-result" key={`${result.type}-${result.id}`}><div className="global-search-icon">{iconFor(result.type)}</div><div><span>{result.type}</span><strong>{result.title}</strong><p>{result.detail}</p></div></article>)}</section></div>
}
