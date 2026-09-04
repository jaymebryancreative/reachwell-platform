import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, MapPin, Plus, Users, ClipboardCheck, Activity, UserPlus } from 'lucide-react'
import { createEvent, listEventParticipants, listEvents, addPersonToEvent, listPeople, type EventParticipantRecord, type EventRecord, type PersonRecord } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'
import './events.css'

export function EventsWorkspace({ onOpenSignIn }: { onOpenSignIn: (eventId: string) => void }) {
  const { organizationId, loading: contextLoading } = useReachWellContext()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedParticipants, setSelectedParticipants] = useState<EventParticipantRecord[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [personSearch, setPersonSearch] = useState('')
  const [draft, setDraft] = useState({ name: '', type: 'Outreach', startsAt: '', endsAt: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [peopleLoading, setPeopleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId) { setEvents([]); setPeople([]); setSelectedId(null); setSelectedParticipants([]); setLoading(false); return }
    setLoading(true); setPeopleLoading(true); setError(null)
    try {
      const [next, nextPeople] = await Promise.all([listEvents(organizationId), listPeople(organizationId)])
      setEvents(next)
      setPeople(nextPeople)
      setSelectedId(current => current && next.some(event => event.id === current) ? current : (next[0]?.id ?? null))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load events.') } finally { setLoading(false); setPeopleLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, contextLoading])

  const loadParticipants = async () => {
    if (!selectedId) { setSelectedParticipants([]); return }
    setDetailLoading(true)
    try { setSelectedParticipants(await listEventParticipants(selectedId)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load event roster.') }
    finally { setDetailLoading(false) }
  }
  useEffect(() => { void loadParticipants() }, [selectedId])

  const selected = events.find(event => event.id === selectedId) ?? events[0]
  const present = selectedParticipants.filter(p => p.attendance_status === 'present' || p.attendance_status === 'late').length
  const absent = selectedParticipants.filter(p => p.attendance_status === 'absent').length
  const unmarked = selectedParticipants.filter(p => ['not_marked', 'invited', 'confirmed'].includes(p.attendance_status)).length
  const rosterIds = useMemo(() => new Set(selectedParticipants.map(participant => participant.person_id).filter(Boolean)), [selectedParticipants])
  const availablePeople = people.filter(person => !rosterIds.has(person.id) && `${person.first_name} ${person.last_name ?? ''} ${person.preferred_name ?? ''}`.toLowerCase().includes(personSearch.toLowerCase().trim())).slice(0, 12)

  const create = async () => {
    if (!organizationId || !draft.name.trim() || !draft.startsAt) return
    setError(null); setActionMessage(null)
    try {
      const created = await createEvent({ organization_id: organizationId, name: draft.name.trim(), description: null, event_type: draft.type.trim() || 'Outreach', starts_at: new Date(draft.startsAt).toISOString(), ends_at: draft.endsAt ? new Date(draft.endsAt).toISOString() : null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, location_name: draft.location.trim() || null, address_line1: null, city: null, state: null, postal_code: null })
      setEvents(current => [...current, created].sort((a, b) => a.starts_at.localeCompare(b.starts_at)))
      setSelectedId(created.id); setDraft({ name: '', type: 'Outreach', startsAt: '', endsAt: '', location: '' }); setShowCreate(false); setActionMessage('Event created.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create event.') }
  }

  const addPerson = async (person: PersonRecord) => {
    if (!selectedId) return
    setError(null); setActionMessage(null)
    try {
      const participant = await addPersonToEvent({ event_id: selectedId, person_id: person.id, role: 'Volunteer' })
      setSelectedParticipants(current => [...current, participant])
      setActionMessage(`${person.preferred_name || person.first_name} added to the roster.`)
      setPersonSearch('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to add person to the event.') }
  }

  return <div className="rw-events">
    <div className="rw-section-heading"><div><span className="rw-eyebrow">Connected organization calendar</span><h1>Events</h1><p>Every event becomes a real operational context for teams, attendance, assignments, and field work.</p></div><button className="rw-primary-button" onClick={() => setShowCreate(true)} disabled={!organizationId}><Plus size={18}/> Create event</button></div>
    {error && <div className="rw-roster-empty" role="alert">{error}</div>}
    {actionMessage && <div className="rw-roster-empty" role="status">{actionMessage}</div>}
    <div className="rw-event-layout"><aside className="rw-event-list">{(loading || contextLoading) && <div className="rw-roster-empty">Loading events…</div>}{!loading && !contextLoading && events.map(event => <button key={event.id} onClick={() => setSelectedId(event.id)} className={event.id === selected?.id ? 'is-selected' : ''}><CalendarDays size={18}/><span><strong>{event.name}</strong><small>{new Date(event.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></span></button>)}{!loading && !contextLoading && organizationId && !events.length && <div className="rw-roster-empty">No events yet.</div>}</aside>
      {selected ? <section className="rw-event-detail"><span className="rw-eyebrow">{selected.event_type}</span><h2>{selected.name}</h2><p className="rw-event-date">{new Date(selected.starts_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>{selected.location_name && <p className="rw-event-location"><MapPin size={17}/> {selected.location_name}</p>}<div className="rw-event-command-stats"><div><ClipboardCheck size={18}/><strong>{detailLoading ? '—' : selectedParticipants.length}</strong><span>Roster</span></div><div><Users size={18}/><strong>{detailLoading ? '—' : present}</strong><span>Present / late</span></div><div><Activity size={18}/><strong>{detailLoading ? '—' : absent}</strong><span>Not present</span></div><div><CalendarDays size={18}/><strong>{detailLoading ? '—' : unmarked}</strong><span>Unmarked</span></div></div>
        <div className="rw-event-actions"><button className="rw-primary-button" onClick={() => onOpenSignIn(selected.id)}><Users size={18}/> Open Sign-In Mode</button><button className="rw-secondary-button" onClick={() => setShowAddPerson(value => !value)}><UserPlus size={18}/> Add to roster</button></div>
        {showAddPerson && <div className="rw-event-note"><strong>Add someone to this roster</strong><input value={personSearch} onChange={e => setPersonSearch(e.target.value)} placeholder="Search people by name…" aria-label="Search people for event roster" />{peopleLoading ? <span>Loading people…</span> : availablePeople.length ? availablePeople.map(person => <button key={person.id} className="rw-secondary-button" onClick={() => void addPerson(person)}>{person.preferred_name || person.first_name} {person.last_name ?? ''}</button>) : <span>{personSearch ? 'No available people match that search.' : 'Everyone currently in the directory is already on this roster.'}</span>}</div>}
        <div className="rw-event-roster"><strong>Roster</strong>{detailLoading ? <span>Loading roster…</span> : selectedParticipants.length ? selectedParticipants.map(participant => <div key={participant.id}><span>{participant.person?.preferred_name || participant.person?.first_name || 'Unlinked participant'} {participant.person?.last_name ?? ''}<small>{participant.role}</small></span><em>{participant.attendance_status === 'not_marked' ? 'Not marked' : participant.attendance_status}</em></div>) : <span>No one is on this event roster yet. Add people here or use Sign-In Mode.</span>}</div>
        <div className="rw-event-note"><strong>Event Command Center</strong><span>Attendance is connected to real people in the organization directory. Sign-In corrections update the same event record.</span></div></section> : <section className="rw-event-detail"><div className="rw-roster-empty">Create an event to begin.</div></section>}
    </div>
    {showCreate && <div className="rw-modal-backdrop"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Create event"><span className="rw-eyebrow">Organization calendar</span><h2>Create an event</h2><div className="rw-form-grid"><label>Event name<input autoFocus value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Community Outreach"/></label><label>Type<input value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })}/></label><label>Starts<input type="datetime-local" value={draft.startsAt} onChange={e => setDraft({ ...draft, startsAt: e.target.value })}/></label><label>Ends<input type="datetime-local" value={draft.endsAt} onChange={e => setDraft({ ...draft, endsAt: e.target.value })}/></label><label>Location<input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="Organization campus"/></label></div><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="rw-primary-button" onClick={() => void create()} disabled={!draft.name.trim() || !draft.startsAt}>Create event</button></div></div></div>}
  </div>
}
