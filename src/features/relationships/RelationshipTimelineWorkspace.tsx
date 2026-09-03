import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarClock, CircleAlert, ClipboardCheck, FileText, HeartHandshake, MapPin, Moon, RefreshCw } from 'lucide-react'
import { listRelationshipTimeline, timelineLabel, type RelationshipTimelineRecord } from '../../lib/relationshipTimeline'
import { getHousehold, listHouseholdPeople, type HouseholdRecord, type PersonRecord } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'

function iconFor(kind: RelationshipTimelineRecord['activity_kind']) {
  if (kind === 'assignment') return <ClipboardCheck size={17} />
  if (kind === 'visit') return <MapPin size={17} />
  if (kind === 'need') return <CircleAlert size={17} />
  if (kind === 'prayer') return <Moon size={17} />
  if (kind === 'follow_up') return <CalendarClock size={17} />
  return <FileText size={17} />
}

export function RelationshipTimelineWorkspace({ personId, householdId, onBack }: { personId?: string; householdId?: string; onBack?: () => void }) {
  const { organizationId } = useReachWellContext()
  const [records, setRecords] = useState<RelationshipTimelineRecord[]>([])
  const [person, setPerson] = useState<PersonRecord | null>(null)
  const [household, setHousehold] = useState<HouseholdRecord | null>(null)
  const [householdPeople, setHouseholdPeople] = useState<PersonRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId || (!personId && !householdId)) return
    setLoading(true)
    setError(null)
    try {
      const target = personId ? { personId } : { householdId: householdId as string }
      const timeline = await listRelationshipTimeline(organizationId, target)
      setRecords(timeline)
      if (personId) {
        const { data, error: personError } = await import('../../lib/supabaseClient').then(({ supabase }) => supabase.from('people').select('*').eq('organization_id', organizationId).eq('id', personId).single())
        if (personError) throw personError
        const nextPerson = data as PersonRecord
        setPerson(nextPerson)
        if (nextPerson.household_id) {
          const [nextHousehold, members] = await Promise.all([getHousehold(nextPerson.household_id), listHouseholdPeople(organizationId, nextPerson.household_id)])
          setHousehold(nextHousehold)
          setHouseholdPeople(members)
        }
      } else {
        const nextHousehold = await getHousehold(householdId as string)
        setHousehold(nextHousehold)
        setHouseholdPeople(await listHouseholdPeople(organizationId, householdId as string))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load relationship history.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [organizationId, personId, householdId])

  const heading = person ? `${person.preferred_name || person.first_name} ${person.last_name || ''}`.trim() : household?.household_name || 'Household history'
  const address = household ? [household.address_line1, household.address_line2, household.city, household.state, household.postal_code].filter(Boolean).join(', ') : null

  return <div className="relationship-workspace">
    <div className="relationship-heading"><div><button className="followup-text-button" onClick={() => onBack?.()}><ArrowLeft size={16}/> Back</button><span className="rw-eyebrow">CONNECTED HISTORY</span><h1>{heading}</h1><p>{address || 'Connected operational history across outreach, visits, needs, prayer, notes, and follow-ups.'}</p></div><button className="rw-icon-button" onClick={() => void load()} aria-label="Refresh relationship history"><RefreshCw size={18}/></button></div>
    {householdPeople.length > 0 && <section className="relationship-card"><div className="relationship-card-heading"><div><span className="rw-eyebrow">HOUSEHOLD</span><h2>People connected to this home</h2></div><HeartHandshake size={22}/></div><div className="relationship-signal-grid">{householdPeople.map(member => <article className="relationship-signal" key={member.id}><div className="relationship-signal-icon followup"><HeartHandshake size={17}/></div><div><strong>{member.preferred_name || member.first_name} {member.last_name || ''}</strong><p>{member.phone || member.email || 'No contact details recorded'}</p></div></article>)}</div></section>}
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    <section className="relationship-card"><div className="relationship-card-heading"><div><span className="rw-eyebrow">TIMELINE</span><h2>Everything connected to this relationship</h2></div><span>{records.length} records</span></div>{loading ? <div className="relationship-empty">Loading connected history…</div> : !records.length ? <div className="relationship-empty"><HeartHandshake size={26}/><strong>No connected history yet</strong><span>As your team works this person or household, the timeline will grow here.</span></div> : <div className="relationship-signal-grid">{records.map(record => <article className="relationship-signal" key={`${record.activity_kind}-${record.source_id}`}><div className={`relationship-signal-icon ${record.activity_kind}`}>{iconFor(record.activity_kind)}</div><div><div className="followup-title-line"><strong>{record.title}</strong><small>{timelineLabel(record.activity_kind)}</small></div>{record.detail && <p>{record.detail}</p>}<small>{new Date(record.occurred_at).toLocaleString()} · {record.status}</small></div></article>)}</div>}</section>
  </div>
}
