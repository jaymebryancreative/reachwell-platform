import { useEffect, useMemo, useState } from 'react'
import { Archive, Plus, Search } from 'lucide-react'
import { archivePerson, createPerson, listPeople, type PersonRecord } from '../../lib/reachwellApi'
import './people.css'

type Person = PersonRecord & { teams: string[] }

// Temporary until authenticated organization context is wired into the app shell.
// Keeping this explicit prevents silently mixing records across organizations.
const organizationId = import.meta.env.VITE_REACHWELL_ORGANIZATION_ID

export function PeopleWorkspace() {
  const [people, setPeople] = useState<Person[]>([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(Boolean(organizationId))
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  const load = async () => {
    if (!organizationId) {
      setLoading(false)
      setError('Reachwell organization context is not configured yet.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const records = await listPeople(organizationId)
      const next = records.map(person => ({ ...person, teams: [] }))
      setPeople(next)
      setSelectedId(current => current && next.some(person => person.id === current) ? current : (next[0]?.id ?? null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load people.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => people.filter(person => {
    const haystack = `${person.first_name} ${person.last_name} ${person.preferred_name ?? ''} ${person.email ?? ''} ${person.teams.join(' ')}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  }), [people, query])

  const selected = people.find(person => person.id === selectedId) ?? filtered[0]

  const create = async () => {
    const firstName = draft.firstName.trim()
    const lastName = draft.lastName.trim()
    if (!firstName || !lastName || !organizationId) return
    try {
      const created = await createPerson({
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName,
        preferred_name: null,
        email: draft.email.trim() || null,
        phone: draft.phone.trim() || null,
        status: 'active',
      })
      setPeople(current => [{ ...created, teams: [] }, ...current])
      setSelectedId(created.id)
      setDraft({ firstName: '', lastName: '', email: '', phone: '' })
      setShowCreate(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save person.')
    }
  }

  const archiveSelected = async () => {
    if (!selected) return
    try {
      await archivePerson(selected.id)
      setPeople(current => current.filter(person => person.id !== selected.id))
      setSelectedId(current => current === selected.id ? null : current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to archive person.')
    }
  }

  return <div className="rw-people">
    <div className="rw-section-heading"><div><span className="rw-eyebrow">Connected organization directory</span><h1>People</h1><p>Build complete profiles and connect each person to the teams and work where they serve.</p></div><button className="rw-primary-button" onClick={() => setShowCreate(true)} disabled={!organizationId}><Plus size={18}/> Add person</button></div>
    {error && <div className="rw-roster-empty">{error}</div>}
    <div className="rw-people-layout">
      <aside className="rw-people-list-panel"><label className="rw-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people" /></label><div className="rw-person-list">{loading && <div className="rw-roster-empty">Loading people…</div>}{!loading && filtered.map(person => <button key={person.id} onClick={() => setSelectedId(person.id)} className={person.id === selected?.id ? 'is-selected' : ''}><span className="rw-person-avatar">{person.first_name[0]}{person.last_name[0]}</span><span><strong>{person.preferred_name || `${person.first_name} ${person.last_name}`}</strong><small>{person.teams.length ? person.teams.join(' · ') : 'No teams assigned'}</small></span></button>)}{!loading && !filtered.length && <div className="rw-roster-empty">No active people match this search.</div>}</div></aside>
      {selected ? <section className="rw-person-detail"><div className="rw-person-detail-head"><div><span className="rw-eyebrow">Active profile</span><h2>{selected.preferred_name || `${selected.first_name} ${selected.last_name}`}</h2><p>{selected.email || 'No email yet'}{selected.phone ? ` · ${selected.phone}` : ''}</p></div><button className="rw-secondary-button" onClick={() => void archiveSelected()}><Archive size={17}/> Archive</button></div><div className="rw-person-summary"><div><strong>{selected.teams.length}</strong><span>Teams</span></div><div><strong>0</strong><span>Events served</span></div><div><strong>0</strong><span>Follow-ups</span></div></div><div className="rw-profile-section"><h3>Team connections</h3>{selected.teams.length ? <div className="rw-tag-row">{selected.teams.map(team => <span key={team} className="rw-tag">{team}</span>)}</div> : <p className="rw-muted">No team assignments yet. The next connected step is assigning this person to an organization team.</p>}</div></section> : <section className="rw-person-detail"><div className="rw-roster-empty">Add a person to begin.</div></section>}
    </div>
    {showCreate && <div className="rw-modal-backdrop"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Add person"><span className="rw-eyebrow">Organization directory</span><h2>Add a person</h2><p>Start with the essential identity and contact information.</p><div className="rw-form-grid"><label>First name<input autoFocus value={draft.firstName} onChange={e => setDraft({ ...draft, firstName: e.target.value })}/></label><label>Last name<input value={draft.lastName} onChange={e => setDraft({ ...draft, lastName: e.target.value })}/></label><label>Email<input type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })}/></label><label>Phone<input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })}/></label></div><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="rw-primary-button" onClick={() => void create()}>Save person</button></div></div></div>}
  </div>
}
