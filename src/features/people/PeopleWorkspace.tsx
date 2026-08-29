import { useMemo, useState } from 'react'
import { Archive, Plus, Search, UsersRound } from 'lucide-react'
import './people.css'

type Person = {
  id: number
  firstName: string
  lastName: string
  preferredName?: string
  email?: string
  phone?: string
  status: 'Active' | 'Archived'
  teams: string[]
}

const starterPeople: Person[] = [
  { id: 1, firstName: 'Jordan', lastName: 'Bryan', email: 'jordan@example.org', status: 'Active', teams: ['Outreach'] },
  { id: 2, firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.org', status: 'Active', teams: ['Prayer & Care'] },
]

export function PeopleWorkspace() {
  const [people, setPeople] = useState<Person[]>(starterPeople)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number>(starterPeople[0].id)
  const [showCreate, setShowCreate] = useState(false)
  const [draft, setDraft] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  const filtered = useMemo(() => people.filter(person => {
    const haystack = `${person.firstName} ${person.lastName} ${person.email ?? ''} ${person.teams.join(' ')}`.toLowerCase()
    return person.status === 'Active' && haystack.includes(query.toLowerCase())
  }), [people, query])
  const selected = people.find(person => person.id === selectedId) ?? filtered[0]

  const createPerson = () => {
    const firstName = draft.firstName.trim()
    const lastName = draft.lastName.trim()
    if (!firstName || !lastName) return
    const next: Person = { id: Date.now(), firstName, lastName, email: draft.email.trim() || undefined, phone: draft.phone.trim() || undefined, status: 'Active', teams: [] }
    setPeople(current => [...current, next])
    setSelectedId(next.id)
    setDraft({ firstName: '', lastName: '', email: '', phone: '' })
    setShowCreate(false)
  }

  const archiveSelected = () => {
    if (!selected) return
    setPeople(current => current.map(person => person.id === selected.id ? { ...person, status: 'Archived' } : person))
    const next = people.find(person => person.id !== selected.id && person.status === 'Active')
    if (next) setSelectedId(next.id)
  }

  return <div className="rw-people">
    <div className="rw-section-heading"><div><span className="rw-eyebrow">Connected organization directory</span><h1>People</h1><p>Build complete profiles and connect each person to the teams and work where they serve.</p></div><button className="rw-primary-button" onClick={() => setShowCreate(true)}><Plus size={18}/> Add person</button></div>
    <div className="rw-people-layout">
      <aside className="rw-people-list-panel"><label className="rw-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people" /></label><div className="rw-person-list">{filtered.map(person => <button key={person.id} onClick={() => setSelectedId(person.id)} className={person.id === selected?.id ? 'is-selected' : ''}><span className="rw-person-avatar">{person.firstName[0]}{person.lastName[0]}</span><span><strong>{person.preferredName || `${person.firstName} ${person.lastName}`}</strong><small>{person.teams.length ? person.teams.join(' · ') : 'No teams assigned'}</small></span></button>)}{!filtered.length && <div className="rw-roster-empty">No active people match this search.</div>}</div></aside>
      {selected ? <section className="rw-person-detail"><div className="rw-person-detail-head"><div><span className="rw-eyebrow">Active profile</span><h2>{selected.preferredName || `${selected.firstName} ${selected.lastName}`}</h2><p>{selected.email || 'No email yet'}{selected.phone ? ` · ${selected.phone}` : ''}</p></div><button className="rw-secondary-button" onClick={archiveSelected}><Archive size={17}/> Archive</button></div><div className="rw-person-summary"><div><strong>{selected.teams.length}</strong><span>Teams</span></div><div><strong>0</strong><span>Events served</span></div><div><strong>0</strong><span>Follow-ups</span></div></div><div className="rw-profile-section"><h3>Team connections</h3>{selected.teams.length ? <div className="rw-tag-row">{selected.teams.map(team => <span key={team} className="rw-tag">{team}</span>)}</div> : <p className="rw-muted">No team assignments yet. The next connected step is assigning this person to an organization team.</p>}</div><div className="rw-profile-section"><h3>Profile foundation</h3><p className="rw-muted">Identity, contact, household, availability, skills, serving history, attendance, follow-ups, and authorized communication history are being built onto this connected profile model.</p></div></section> : <section className="rw-person-detail"><div className="rw-roster-empty">Add a person to begin.</div></section>}
    </div>
    {showCreate && <div className="rw-modal-backdrop"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Add person"><span className="rw-eyebrow">Organization directory</span><h2>Add a person</h2><p>Start with the essential identity and contact information. Profiles can grow as the relationship grows.</p><div className="rw-form-grid"><label>First name<input autoFocus value={draft.firstName} onChange={e => setDraft({ ...draft, firstName: e.target.value })}/></label><label>Last name<input value={draft.lastName} onChange={e => setDraft({ ...draft, lastName: e.target.value })}/></label><label>Email<input type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })}/></label><label>Phone<input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })}/></label></div><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="rw-primary-button" onClick={createPerson}>Save person</button></div></div></div>}
  </div>
}
