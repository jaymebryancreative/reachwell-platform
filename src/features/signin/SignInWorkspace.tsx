import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, CheckCheck, UserPlus, Users, X } from 'lucide-react'
import { ABSENCE_REASONS, isCustomAbsenceReason } from '../../lib/attendanceWorkflow'
import { addPersonToEvent, createPerson, listEvents, listPeople, listTeams, updateAttendance, type EventParticipantRecord, type EventRecord, type PersonRecord, type TeamRecord } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './signin.css'

type SignInParticipant = EventParticipantRecord & {
  absence_reason: string | null
  team: { id: string; name: string } | null
}

const TEAM_ROLES = ['Volunteer', 'Team Leader', 'Coordinator', 'Director'] as const
type AttendanceStatus = 'present' | 'absent'

export function SignInWorkspace({ eventId, onBack }: { eventId?: string; onBack: () => void }) {
  const { organizationId, loading: contextLoading } = useReachWellContext()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [teams, setTeams] = useState<TeamRecord[]>([])
  const [selectedEventId, setSelectedEventId] = useState(eventId ?? '')
  const [participants, setParticipants] = useState<SignInParticipant[]>([])
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', role: 'Volunteer', teamId: '' })
  const [customReasons, setCustomReasons] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadParticipants = async (eventIdToLoad: string) => {
    const { data, error: queryError } = await supabase
      .from('event_participants')
      .select('id, event_id, person_id, user_id, team_id, role, attendance_status, checked_in_at, absence_reason, person:people(id, first_name, last_name, preferred_name), team:teams(id, name)')
      .eq('event_id', eventIdToLoad)
      .order('created_at')
    if (queryError) throw queryError
    return (data ?? []).map(row => ({
      ...row,
      person: Array.isArray(row.person) ? (row.person[0] ?? null) : row.person,
      team: Array.isArray(row.team) ? (row.team[0] ?? null) : row.team,
    })) as SignInParticipant[]
  }

  const load = async () => {
    if (!organizationId) return
    setLoading(true)
    setError(null)
    try {
      const [eventRecords, peopleRecords, teamRecords] = await Promise.all([
        listEvents(organizationId),
        listPeople(organizationId),
        listTeams(organizationId),
      ])
      setEvents(eventRecords)
      setPeople(peopleRecords)
      setTeams(teamRecords)
      const activeId = selectedEventId || eventRecords[0]?.id || ''
      if (activeId) {
        setSelectedEventId(activeId)
        setParticipants(await loadParticipants(activeId))
      } else setParticipants([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Sign-In Mode.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [organizationId, contextLoading])
  useEffect(() => {
    if (!selectedEventId || !organizationId) return
    void loadParticipants(selectedEventId).then(setParticipants).catch(err => setError(err instanceof Error ? err.message : 'Unable to load roster.'))
  }, [selectedEventId, organizationId])

  const selectedEvent = events.find(event => event.id === selectedEventId)
  const visible = useMemo(() => participants.filter(participant => {
    const p = participant.person
    const name = p ? `${p.preferred_name || ''} ${p.first_name} ${p.last_name || ''}`.trim() : ''
    return `${name} ${participant.team?.name || ''}`.toLowerCase().includes(search.toLowerCase())
  }), [participants, search])
  const counts = { present: participants.filter(p => p.attendance_status === 'present').length, absent: participants.filter(p => p.attendance_status === 'absent').length, unmarked: participants.filter(p => !['present', 'absent'].includes(p.attendance_status)).length }

  const mark = async (participant: SignInParticipant, status: AttendanceStatus, absenceReason?: string | null) => {
    try {
      setError(null)
      const updated = await updateAttendance(participant.id, status, status === 'absent' ? (absenceReason ?? participant.absence_reason) : null)
      setParticipants(current => current.map(item => item.id === updated.id ? { ...item, ...updated, team: item.team } : item))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update attendance.') }
  }

  const markAllPresent = async () => {
    const unmarked = participants.filter(p => p.attendance_status !== 'present')
    if (!unmarked.length) return
    setSavingAll(true); setError(null)
    try {
      await Promise.all(unmarked.map(participant => updateAttendance(participant.id, 'present', null)))
      setParticipants(await loadParticipants(selectedEventId))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to mark the roster present.') }
    finally { setSavingAll(false) }
  }

  const add = async () => {
    if (!organizationId || !selectedEventId || !newPerson.firstName.trim() || !newPerson.lastName.trim()) return
    try {
      setError(null)
      let person = people.find(p => p.first_name.toLowerCase() === newPerson.firstName.trim().toLowerCase() && (p.last_name || '').toLowerCase() === newPerson.lastName.trim().toLowerCase())
      if (!person) person = await createPerson({ organization_id: organizationId, household_id: null, first_name: newPerson.firstName.trim(), last_name: newPerson.lastName.trim(), preferred_name: null, email: null, phone: null, status: 'active' })
      await addPersonToEvent({ event_id: selectedEventId, person_id: person.id, team_id: newPerson.teamId || null, role: newPerson.role })
      setPeople(current => current.some(p => p.id === person!.id) ? current : [person!, ...current])
      setParticipants(await loadParticipants(selectedEventId))
      setNewPerson({ firstName: '', lastName: '', role: 'Volunteer', teamId: '' }); setShowAdd(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to add person to event.'
      setError(message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('unique') ? 'That person is already on this event roster.' : message)
    }
  }

  return <div className="rw-signin">
    <div className="rw-signin-head"><div><button className="rw-back-button" onClick={onBack}><ArrowLeft size={17}/> Back to Events</button><span className="rw-eyebrow">Field-ready attendance</span><h1>Sign-In Mode</h1><p>Mark attendance for the selected event. Corrections are always allowed.</p></div><div className="rw-signin-head-actions"><button className="rw-secondary-button" onClick={() => void markAllPresent()} disabled={!selectedEventId || savingAll || !participants.some(p => p.attendance_status !== 'present')}><CheckCheck size={18}/> {savingAll ? 'Marking…' : 'Mark all present'}</button><button className="rw-primary-button" onClick={() => setShowAdd(true)} disabled={!selectedEventId}><UserPlus size={18}/> Add new person</button></div></div>
    {error && <div className="rw-roster-empty" role="alert">{error}</div>}
    <div className="rw-signin-toolbar"><label>Today's event / outreach<select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>{events.map(event => <option key={event.id} value={event.id}>{event.name} · {new Date(event.starts_at).toLocaleDateString()}</option>)}</select></label><label className="rw-search"><Users size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roster or team"/></label></div>
    {selectedEvent && <div className="rw-signin-context"><strong>{selectedEvent.name}</strong><span>{new Date(selectedEvent.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span><div className="rw-attendance-counts"><span>{counts.present} Present</span><span>{counts.absent} Not Present</span><span>{counts.unmarked} Unmarked</span></div></div>}
    <div className="rw-signin-roster">
      {(loading || contextLoading) && <div className="rw-roster-empty">Loading roster…</div>}
      {!loading && !contextLoading && visible.map(participant => {
        const p = participant.person
        const name = p ? (p.preferred_name || `${p.first_name} ${p.last_name || ''}`).trim() : 'Unknown person'
        const status = participant.attendance_status
        const reason = participant.absence_reason || ''
        const isCustom = isCustomAbsenceReason(reason)
        return <div className="rw-signin-row" key={participant.id}><div className="rw-member-avatar">{name.split(' ').map(x => x[0]).join('').slice(0,2)}</div><div className="rw-signin-person"><strong>{name}</strong><small>{participant.role} {participant.team?.name ? `· ${participant.team.name}` : ''}</small></div><div className="rw-attendance-actions"><button className={status === 'present' ? 'is-selected is-present' : ''} onClick={() => void mark(participant, 'present')}><Check size={17}/> Present</button><button className={status === 'absent' ? 'is-selected is-absent' : ''} onClick={() => void mark(participant, 'absent', participant.absence_reason)}><X size={17}/> Not Present</button>{status === 'absent' && <div className="rw-absence-inline"><select aria-label={`Reason why ${name} is not present`} value={isCustom ? 'Custom Answer' : reason} onChange={e => { const next = e.target.value; setCustomReasons(current => ({ ...current, [participant.id]: next === 'Custom Answer' ? (current[participant.id] || '') : '' })); void mark(participant, 'absent', next || null) }}><option value="">Reason why not present…</option>{ABSENCE_REASONS.map(option => <option key={option} value={option}>{option}</option>)}</select>{isCustom && <input aria-label={`Custom absence reason for ${name}`} value={customReasons[participant.id] || ''} placeholder="Custom answer" onChange={e => setCustomReasons(current => ({ ...current, [participant.id]: e.target.value }))} onBlur={() => void mark(participant, 'absent', 'Custom Answer')} />}</div>}</div></div>
      })}
      {!loading && !contextLoading && selectedEventId && !visible.length && <div className="rw-roster-empty">No people are signed into this event yet. Use Add new person to build the roster.</div>}
    </div>
    {showAdd && <div className="rw-modal-backdrop"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Add new person"><span className="rw-eyebrow">Sign-In Mode</span><h2>Add new person</h2><p>Add them to the organization directory and this event at the same time.</p><div className="rw-form-grid"><label>First name<input autoFocus value={newPerson.firstName} onChange={e => setNewPerson({ ...newPerson, firstName: e.target.value })}/></label><label>Last name<input value={newPerson.lastName} onChange={e => setNewPerson({ ...newPerson, lastName: e.target.value })}/></label><label>Team role<select value={newPerson.role} onChange={e => setNewPerson({ ...newPerson, role: e.target.value })}>{TEAM_ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select></label><label>Team<select value={newPerson.teamId} onChange={e => setNewPerson({ ...newPerson, teamId: e.target.value })}><option value="">No team yet</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label></div><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button className="rw-primary-button" onClick={() => void add()} disabled={!newPerson.firstName.trim() || !newPerson.lastName.trim()}>Add to event</button></div></div></div>}
  </div>
}
