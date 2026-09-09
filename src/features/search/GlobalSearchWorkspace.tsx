import { FormEvent, ReactNode, useState } from 'react'
import { CalendarDays, FileText, MessageCircle, Search, Users, UserRound } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type View = 'people' | 'teams' | 'events' | 'assignments' | 'communication' | 'resources'
type Result = { id: string; type: string; title: string; detail: string; view: View }

export function GlobalSearchWorkspace({ onNavigate }: { onNavigate?: (view: View) => void }) {
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
      const [people, households, teams, assignments, followUps, events, channels, messages, files] = await Promise.all([
        supabase.from('people').select('id,first_name,last_name,preferred_name,email,phone').eq('organization_id', organizationId).eq('status', 'active').or(`first_name.ilike.${term},last_name.ilike.${term},preferred_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`).limit(20),
        supabase.from('households').select('id,household_name,address_line1,city,state').eq('organization_id', organizationId).neq('status', 'archived').or(`household_name.ilike.${term},address_line1.ilike.${term},city.ilike.${term}`).limit(20),
        supabase.from('teams').select('id,name,description').eq('organization_id', organizationId).eq('active', true).or(`name.ilike.${term},description.ilike.${term}`).limit(20),
        supabase.from('assignments').select('id,title,address_label,status').eq('organization_id', organizationId).or(`title.ilike.${term},address_label.ilike.${term}`).limit(20),
        supabase.from('follow_ups').select('id,title,description,status').eq('organization_id', organizationId).neq('status', 'completed').or(`title.ilike.${term},description.ilike.${term}`).limit(20),
        supabase.from('events').select('id,name,event_type,starts_at,location_name').eq('organization_id', organizationId).or(`name.ilike.${term},event_type.ilike.${term},location_name.ilike.${term}`).limit(20),
        supabase.from('communication_channels').select('id,name,description').eq('organization_id', organizationId).is('archived_at', null).or(`name.ilike.${term},description.ilike.${term}`).limit(20),
        supabase.from('communication_messages').select('id,channel_id,body,created_at').ilike('body', term).order('created_at', { ascending: false }).limit(20),
        supabase.from('organization_files').select('id,file_name,folder,mime_type').eq('organization_id', organizationId).is('deleted_at', null).ilike('file_name', term).limit(20),
      ])
      const firstError = [people, households, teams, assignments, followUps, events, channels, messages, files].find(item => item.error)?.error
      if (firstError) throw firstError
      setResults([
        ...(people.data ?? []).map(row => ({ id: row.id, type: 'Person', title: row.preferred_name || `${row.first_name} ${row.last_name || ''}`.trim(), detail: row.email || row.phone || 'Person record', view: 'people' as const })),
        ...(households.data ?? []).map(row => ({ id: row.id, type: 'Household', title: row.household_name || 'Household', detail: [row.address_line1, row.city, row.state].filter(Boolean).join(', ') || 'Household record', view: 'people' as const })),
        ...(teams.data ?? []).map(row => ({ id: row.id, type: 'Team', title: row.name, detail: row.description || 'Team record', view: 'teams' as const })),
        ...(assignments.data ?? []).map(row => ({ id: row.id, type: 'Assignment', title: row.title, detail: `${row.status} · ${row.address_label || 'No address'}`, view: 'assignments' as const })),
        ...(followUps.data ?? []).map(row => ({ id: row.id, type: 'Follow-up', title: row.title, detail: row.description || row.status, view: 'assignments' as const })),
        ...(events.data ?? []).map(row => ({ id: row.id, type: 'Event', title: row.name, detail: `${new Date(row.starts_at).toLocaleDateString()} · ${row.location_name || row.event_type}`, view: 'events' as const })),
        ...(channels.data ?? []).map(row => ({ id: row.id, type: 'Channel', title: row.name, detail: row.description || 'Communication channel', view: 'communication' as const })),
        ...(messages.data ?? []).map(row => ({ id: row.id, type: 'Message', title: row.body.slice(0, 80), detail: new Date(row.created_at).toLocaleString(), view: 'communication' as const })),
        ...(files.data ?? []).map(row => ({ id: row.id, type: 'File', title: row.file_name, detail: [row.folder, row.mime_type].filter(Boolean).join(' · ') || 'Organization file', view: 'resources' as const })),
      ])
    } catch (err) { setResults([]); setError(err instanceof Error ? err.message : 'Unable to search the organization.') }
    finally { setLoading(false) }
  }

  const iconFor = (type: string): ReactNode => type === 'Person' ? <UserRound size={17}/> : type === 'Team' ? <Users size={17}/> : type === 'Event' ? <CalendarDays size={17}/> : type === 'Message' || type === 'Channel' ? <MessageCircle size={17}/> : <FileText size={17}/>

  return <div className="global-search-workspace">
    <header className="global-search-heading"><div><span className="rw-eyebrow">REACHWELL SEARCH</span><h1>Search everything that matters.</h1><p>Find people, households, teams, events, assignments, conversations and files in one place.</p></div></header>
    <form className="global-search-form" onSubmit={event => void runSearch(event)}><Search size={19}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search people, teams, events, messages, files…"/><button className="rw-primary-button" disabled={loading || query.trim().length < 2}>{loading ? 'Searching…' : 'Search'}</button></form>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    {searched && !loading && !results.length && !error && <div className="rw-empty-state"><h2>No matches</h2><p>Try a person, team, street, event, assignment, message, or file name.</p></div>}
    <section className="global-search-results">{results.map(result => <button type="button" className="global-search-result" key={`${result.type}-${result.id}`} onClick={() => onNavigate?.(result.view)} aria-label={`Open ${result.type}: ${result.title}`}><div className="global-search-icon">{iconFor(result.type)}</div><div><span>{result.type}</span><strong>{result.title}</strong><p>{result.detail}</p></div><span className="global-search-open">Open</span></button>)}</section>
  </div>
}
