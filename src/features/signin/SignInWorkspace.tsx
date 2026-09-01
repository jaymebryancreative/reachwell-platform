import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Clock3, UserPlus, Users, X } from 'lucide-react'
import { addPersonToEvent, createPerson, listEventParticipants, listEvents, listPeople, updateAttendance, type EventParticipantRecord, type EventRecord, type PersonRecord } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'
import './signin.css'

export function SignInWorkspace({ eventId, onBack }: { eventId?: string; onBack: () => void }) {
  const { organizationId, loading: contextLoading } = useReachWellContext()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [selectedEventId, setSelectedEventId] = useState(eventId ?? '')
  const [participants, setParticipants] = useState<EventParticipantRecord[]>([])
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', role: 'Volunteer' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError(null)
    try {
      const [eventRecords, peopleRecords] = await Promise.all([listEvents(organizationId), listPeople(organizationId)])
      setEvents(eventRecords); setPeople(peopleRecords)
      const activeId = selectedEventId || eventRecords[0]?.id || ''
      if (activeId) { setSelectedEventId(activeId); setParticipants(await listEventParticipants(activeId)) }
      else setParticipants([])
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load Sign-In Mode.') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, contextLoading])
  useEffect(() => { if (selectedEventId && organizationId) void listEventParticipants(selectedEventId).then(setParticipants).catch(err => setError(err instanceof Error ? err.message : 'Unable to load roster.')) }, [selectedEventId, organizationId])

  const selectedEvent = events.find(event => event.id === selectedEventId)
  const visible = useMemo(() => participants.filter(participant => { const p = participant.person; const name = p ? `${p.preferred_name || ''} ${p.first_name} ${p.last_name || ''}` : ''; return name.toLowerCase().includes(search.toLowerCase()) }), [participants, search])
  const counts = { present: participants.filter(p => p.attendance_status === 'present').length, late: participants.filter(p => p.attendance_status === 'late').length, absent: participants.filter(p => p.attendance_status === 'absent').length }

  const mark = async (participant: EventParticipantRecord, status: 'present' | 'late' | 'absent') => {
    try { const updated = await updateAttendance(participant.id, status); setParticipants(current => current.map(item => item.id === updated.id ? updated : item)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update attendance.') }
  }

  const add = async () => {
    if (!organizationId || !selectedEventId || !newPerson.firstName.trim() || !newPerson.lastName.trim()) return
    try {
      let person = people.find(p => p.first_name.toLowerCase() === newPerson.firstName.trim().toLowerCase() && (p.last_name || '').toLowerCase() === newPerson.lastName.trim().toLowerCase())
      if (!person) { person = await createPerson({ organization_id: organizationId, household_id: null, first_name: newPerson.firstName.trim(), last_name: newPerson.lastName.trim(), preferred_name: null, email: null, phone: null, status: 'active' }) }
      const participant = await addPersonToEvent({ event_id: selectedEventId, person_id: person.id, role: 'participant' })
      setPeople(current => current.some(p => p.id === person!.id) ? current : [person!, ...current]); setParticipants(current => [...current, participant]); setNewPerson({ firstName: '', lastName: '', role: 'Volunteer' }); setShowAdd(false)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to add person to event.') }
  }

  return <div className="rw-signin"><div className="rw-signin-head"><div><button className="rw-back-button" onClick={onBack}><ArrowLeft size={17}/> Back to Events</button><span className="rw-eyebrow">Field-ready attendance</span><h1>Sign-In Mode</h1><p>Mark attendance for the selected event. Corrections are always allowed.</p></div><button className="rw-primary-button" onClick={() => setShowAdd(true)} disabled={!selectedEventId}><UserPlus size={18}/> Add new person</button></div>
    {error && <div className="rw-roster-empty">{error}</div>}
    <div className="rw-signin-toolbar"><label>Today's event / outreach<select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>{events.map(event => <option key={event.id} value={event.id}>{event.name} · {new Date(event.starts_at).toLocaleDateString()}</option>)}</select></label><label className="rw-search"><Users size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roster"/></label></div>
    {selectedEvent && <div className="rw-signin-context"><strong>{selectedEvent.name}</strong><span>{new Date(selectedEvent.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span><div className="rw-attendance-counts"><span>{counts.present} Present</span><span>{counts.late} Late</span><span>{counts.absent} Absent</span><span>{participants.length - counts.present - counts.late - counts.absent} Unmarked</span></div></div>}
    <div className="rw-signin-roster">{(loading || contextLoading) && <div className="rw-roster-empty">Loading roster…</div>}{!loading && !contextLoading && visible.map(participant => { const p = participant.person; const name = p ? (p.preferred_name || `${p.first_name} ${p.last_name || ''}`).trim() : 'Unknown person'; const status = participant.attendance_status; return <div className="rw-signin-row" key={participant.id}><div className="rw-member-avatar">{name.split(' ').map(x => x[0]).join('').slice(0,2)}</div><div className="rw-signin-person"><strong>{name}</strong><small>{participant.role === 'participant' ? 'Volunteer' : participant.role}</small></div><div className="rw-attendance-actions"><button className={status === 'present' ? 'is-selected is-present' : ''} onClick={() => void mark(participant, 'present')}><Check size={17}/> Present</button><button className={status === 'late' ? 'is-selected is-late' : ''} onClick={() => void mark(participant, 'late')}><Clock3 size={17}/> Late</button><button className={status === 'absent' ? 'is-selected is-absent' : ''} onClick={() => void mark(participant, 'absent')}><X size={17}/> Not Present</button></div></div> })}{!loading && !contextLoading && selectedEventId && !visible.length && <div className="rw-roster-empty">No people are signed into this event yet. Use Add new person to build the roster.</div>}</div>
    {showAdd && <div className="rw-modal-backdrop"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Add new person"><span className="rw-eyebrow">Sign-In Mode</span><h2>Add new person</h2><p>Add them to the organization directory and this event at the same time.</p><div className="rw-form-grid"><label>First name<input autoFocus value={newPerson.firstName} onChange={e => setNewPerson({ ...newPerson, firstName: e.target.value })}/></label><label>Last name<input value={newPerson.lastName} onChange={e => setNewPerson({ ...newPerson, lastName: e.target.value })}/></label><label>Team role<input value={newPerson.role} onChange={e => setNewPerson({ ...newPerson, role: e.target.value })}/></label></div><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="rw-primary-button" onClick={() => void add()} disabled={!newPerson.firstName.trim() || !newPerson.lastName.trim()}>Add to event</button></div></div></div>}
  </div>
}
