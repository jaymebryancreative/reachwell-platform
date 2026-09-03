import { useMemo, useState } from 'react'
import { MessageCircle, Search, ShieldCheck } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './communication-search.css'

type SearchResult = {
  message_id: string
  channel_id: string
  channel_name: string
  author_id: string | null
  body: string
  created_at: string
  rank: number
}

export function CommunicationSearch() {
  const { organizationId } = useReachWellContext()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const canSearch = useMemo(() => query.trim().length >= 2 && Boolean(organizationId), [query, organizationId])
  const runSearch = async () => {
    if (!organizationId || !canSearch) return
    setLoading(true); setError(''); setSearched(true)
    try {
      const { data, error: searchError } = await supabase.rpc('search_communication_messages', { p_organization_id: organizationId, p_query: query.trim(), p_limit: 100 })
      if (searchError) throw searchError
      setResults((data ?? []) as SearchResult[])
    } catch (err) {
      setResults([])
      setError(err instanceof Error ? err.message : 'Unable to search communication history.')
    } finally { setLoading(false) }
  }

  return <div className="communication-search">
    <header className="communication-search-heading"><div><span className="rw-eyebrow">COMMUNICATION</span><h1>Search conversations</h1><p>Search across the organization’s accessible, non-archived channel messages.</p></div><div className="communication-search-badge"><ShieldCheck size={17} /> Organization scoped</div></header>
    <form className="communication-search-form" onSubmit={event => { event.preventDefault(); void runSearch() }}><Search size={18} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a phrase, person, project, or conversation…" /><button className="rw-primary-button" type="submit" disabled={!canSearch || loading}>{loading ? 'Searching…' : 'Search'}</button></form>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    {!searched && <div className="rw-empty-state"><MessageCircle size={28} /><h2>Find the conversation</h2><p>Use at least two characters. Results are ranked by text relevance and recency.</p></div>}
    {searched && !loading && !results.length && !error && <div className="rw-empty-state"><h2>No matching messages</h2><p>Try a shorter phrase or another keyword.</p></div>}
    <div className="communication-search-results">{results.map(result => <article className="communication-search-result" key={result.message_id}><div className="communication-search-result-icon"><MessageCircle size={17} /></div><div><strong>{result.channel_name}</strong><p>{result.body}</p><small>{new Date(result.created_at).toLocaleString()} · {result.author_id ? `User ${result.author_id.slice(0, 8)}` : 'System message'}</small></div></article>)}</div>
  </div>
}
