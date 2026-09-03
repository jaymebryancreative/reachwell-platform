import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, Plus, Users, ClipboardCheck, Activity } from 'lucide-react'
import { createEvent, listEventParticipants, listEvents, type EventParticipantRecord, type EventRecord } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'
import './events.css'

export function EventsWorkspace({ onOpenSignIn }: { onOpenSignIn: (eventId: string) => void }) {
  const { organizationId, loading: contextLoading } = useReachWellContext()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedParticipants, setSelectedParticipants] = useState<EventParticipantRecord[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [draft, setDraft] = useState({ name: '', type: 'Outreach', startsAt: '', endsAt: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId) { setEvents([]); setSelectedId(null); setSelectedParticipants([]); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const next = await listEvents(organizationId)
      setEvents(next)
      setSelectedId(current => current && next.some(event => event.id === current) ? current : (next[0]?.id ?? null))
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load events.') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, contextLoading])
  useEffect(() => {
    if (!selectedId) { setSelectedParticipants([]); return }
    setDetailLoading(true)
    void listEventParticipants(selectedId).then(setSelectedParticipants).catch(err => setError(err instanceof Error ? err.message : 'Unable to load event attendance.')).finally(() => setDetailLoading(false))
  }, [selectedId])

  const selected = events.find(event => event.id === selectedId) ?? events[0]
  const present = selectedParticipants.filter(p => p.attendance_status === 'present' || p.attendance_status === 'late').length
  const absent = selectedParticipants.filter(p => p.attendance_status === 'absent').length
  const unmarked = selectedParticipants.filter(p => p.attendance_status === 'not_marked' || p.attendance_status === 'invited' || p.attendance_status === 'confirmed').length
  const create = async () => {
    if (!organizationId || !draft.name.trim() || !draft.startsAt) return
    try {
      const created = await createEvent({ organization_id: organizationId, name: draft.name.trim(), description: null, event_type: draft.type, starts_at: new Date(draft.startsAt).toISOString(), ends_at: draft.endsAt ? new Date(draft.endsAt).toISOString() : null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, location_name: draft.location.trim() || null, address_line1: null, city: null, state: null, postal_code: null })
      setEvents(current => [...current, created].sort((a, b) => a.starts_at.localeCompare(b.starts_at)))
      setSelectedId(created.id); setDraft({ name: '', type: 'Outreach', startsAt: '', endsAt: '', location: '' }); setShowCreate(false)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create event.') }
  }

  return <div className="rw-events">
    <div className="rw-section-heading"><div><span className="rw-eyebrow">Connected organization calendar</span><h1>Events</h1><p>Every event becomes a real operational context for teams, attendance, assignments, and field work.</p></div><button className="rw-primary-button" onClick={() => setShowCreate(true)} disabled={!organizationId}><Plus size={18}/> Create event</button></div>
    {error && <div className="rw-roster-empty">{error}</div>}
    <div className="rw-event-layout"><aside className="rw-event-list">{(loading || contextLoading) && <div className="rw-roster-empty">Loading events…</div>}{!loading && !contextLoading && events.map(event => <button key={event.id} onClick={() => setSelectedId(event.id)} className={event.id === selected?.id ? 'is-selected' : ''}><CalendarDays size={18}/><span><strong>{event.name}</strong><small>{new Date(event.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></span></button>)}{!loading && !contextLoading && organizationId && !events.length && <div className="rw-roster-empty">No events yet.</div>}</aside>
      {selected ? <section className="rw-event-detail"><span className="rw-eyebrow">{selected.event_type}</span><h2>{selected.name}</h2><p className="rw-event-date">{new Date(selected.starts_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>{selected.location_name && <p className="rw-event-location"><MapPin size={17}/> {selected.location_name}</p>}<div className="rw-event-command-stats"><div><ClipboardCheck size={18}/><strong>{detailLoading ? '—' : selectedParticipants.length}</strong><span>Roster</span></div><div><Users size={18}/><strong>{detailLoading ? '—' : present}</strong><span>Present / late</span></div><div><Activity size={18}/><strong>{detailLoading ? '—' : absent}</strong><span>Not present</span></div><div><CalendarDays size={18}/><strong>{detailLoading ? '—' : unmarked}</strong><span>Unmarked</span></div></div><div className="rw-event-actions"><button className="rw-primary-button" onClick={() => onOpenSignIn(selected.id)}><Users size={18}/> Open Sign-In Mode</button></div><div className="rw-event-note"><strong>Event Command Center</strong><span>Attendance is connected to real people in the organization directory. Sign-In corrections update the same event record.</span></div></section> : <section className="rw-event-detail"><div className="rw-roster-empty">Create an event to begin.</div></section>}
    </div>
    {showCreate && <div className="rw-modal-backdrop"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Create event"><span className="rw-eyebrow">Organization calendar</span><h2>Create an event</h2><div className="rw-form-grid"><label>Event name<input autoFocus value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Community Outreach"/></label><label>Type<input value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })}/></label><label>Starts<input type="datetime-local" value={draft.startsAt} onChange={e => setDraft({ ...draft, startsAt: e.target.value })}/></label><label>Ends<input type="datetime-local" value={draft.endsAt} onChange={e => setDraft({ ...draft, endsAt: e.target.value })}/></label><label>Location<input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="Organization campus"/></label></div><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="rw-primary-button" onClick={() => void create()} disabled={!draft.name.trim() || !draft.startsAt}>Create event</button></div></div></div>}
  </div>
}
