import { useEffect, useState } from 'react'
import { Check, CircleAlert, MapPin, MessageSquare, Moon, Play, SquareCheckBig, X } from 'lucide-react'
import { completeAssignmentObjective, createNeed, createPrayerRequest, finishAssignmentVisit, listAssignmentObjectives, listAssignments, saveAssignmentNote, startAssignmentVisit, updateAssignmentStatus, type AssignmentObjective, type AssignmentRecord, type AssignmentVisit } from '../../lib/reachwellApi'
import { useReachWellContext } from '../../lib/reachwellContext'

type Action = 'note' | 'need' | 'prayer' | null

export function MissionMode() {
  const { organizationId, user, loading: contextLoading } = useReachWellContext()
  const [enabled, setEnabled] = useState(false)
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [objectives, setObjectives] = useState<AssignmentObjective[]>([])
  const [activeAction, setActiveAction] = useState<Action>(null)
  const [note, setNote] = useState('')
  const [need, setNeed] = useState('')
  const [prayer, setPrayer] = useState('')
  const [visit, setVisit] = useState<AssignmentVisit | null>(null)
  const [outcome, setOutcome] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId || !user) { setAssignments([]); setCurrentId(null); return }
    setLoading(true); setError(null)
    try { const next = await listAssignments(organizationId, user.id); setAssignments(next); setCurrentId(current => current && next.some(a => a.id === current) ? current : (next[0]?.id ?? null)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load your mission assignments.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, user?.id, contextLoading])
  useEffect(() => { if (!currentId) { setObjectives([]); return }; void listAssignmentObjectives(currentId).then(setObjectives).catch(err => setError(err instanceof Error ? err.message : 'Unable to load objectives.')) }, [currentId])

  const current = assignments.find(a => a.id === currentId) ?? assignments[0]
  const setAction = (action: Action) => { setActiveAction(active => active === action ? null : action); setMessage(null) }
  const complete = async () => { if (!current || !user) return; try { await updateAssignmentStatus(current.id, 'complete', user.id, summary || undefined); setAssignments(items => items.filter(item => item.id !== current.id)); setCurrentId(null); setActiveAction(null); setMessage('Assignment completed.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to complete assignment.') } }
  const saveNote = async () => { if (!current || !organizationId || !user || !note.trim()) return; try { await saveAssignmentNote(current.id, organizationId, user.id, note.trim()); setNote(''); setMessage('Note saved to this assignment.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save note.') } }
  const saveNeed = async () => { if (!current || !organizationId || !user || !need.trim()) return; try { await createNeed(current.id, organizationId, user.id, need.trim(), need.trim()); setNeed(''); setMessage('Need recorded for follow-up.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to record need.') } }
  const savePrayer = async () => { if (!current || !organizationId || !user || !prayer.trim()) return; try { await createPrayerRequest(current.id, organizationId, user.id, prayer.trim()); setPrayer(''); setMessage('Prayer request recorded.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to record prayer request.') } }
  const toggleObjective = async (objective: AssignmentObjective) => { if (!user || objective.status === 'complete') return; try { const updated = await completeAssignmentObjective(objective.id, user.id); setObjectives(items => items.map(item => item.id === updated.id ? updated : item)); setMessage('Objective completed.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update objective.') } }
  const beginVisit = async () => { if (!current || !organizationId || !user) return; try { const next = await startAssignmentVisit(current.id, organizationId, user.id, current.person_id, current.household_id); setVisit(next); await updateAssignmentStatus(current.id, 'in_progress', user.id); setAssignments(items => items.map(item => item.id === current.id ? { ...item, status: 'in_progress', started_at: next.started_at } : item)); setMessage('Visit started.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to start visit.') } }
  const finishVisit = async () => { if (!visit || !outcome.trim()) return; try { const done = await finishAssignmentVisit(visit.id, outcome.trim(), summary.trim()); setVisit(done); setMessage('Visit outcome saved.') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save visit outcome.') } }

  return <main className={enabled ? 'mission-shell is-live' : 'mission-shell'}>
    <header className="mission-header"><div><span className="brand">REACHWELL</span><strong>MISSION MODE</strong></div><div className="mission-toggle"><span>{enabled ? 'On' : 'Off'}</span><button type="button" role="switch" aria-checked={enabled} className={enabled ? 'is-on' : ''} onClick={() => setEnabled(v => !v)}><span/></button></div></header>
    {!enabled ? <section className="mission-off-card"><span className="eyebrow">FIELD WORK</span><h1>Mission Mode is off.</h1><p>Turn it on when you are ready to work the assignments assigned to you or your teams.</p><button type="button" className="mission-primary" onClick={() => setEnabled(true)}><Play size={17}/> Start Mission Mode</button></section> : <>
      <section className="mission-card mission-assignment-card"><div className="mission-card-top"><div><p className="eyebrow">CURRENT HOME / ASSIGNMENT</p><h1>{current?.address_label || current?.title || 'No assignment selected'}</h1><p>{current?.title || 'Your live assignments will appear here.'}</p></div>{current && !visit && <button className="mission-primary" onClick={() => void beginVisit()}><MapPin size={17}/> Start visit</button>}</div><div className="assignment-list" aria-label="Assignments">{loading && <div className="mission-muted">Loading assignments…</div>}{!loading && !current && <div className="mission-muted">No open assignments are currently assigned to you or your teams.</div>}{assignments.map(assignment => <button key={assignment.id} type="button" className={assignment.id === current?.id ? 'assignment selected' : 'assignment'} onClick={() => setCurrentId(assignment.id)}><span>{assignment.address_label || assignment.title}</span>{assignment.status === 'in_progress' && <small>In progress</small>}</button>)}</div></section>
      {current && <section className="mission-card"><div className="action-row" aria-label="Mission actions"><button type="button" className={activeAction === 'note' ? 'action selected' : 'action'} aria-pressed={activeAction === 'note'} onClick={() => setAction('note')}><MessageSquare size={16}/> Note</button><button type="button" className={activeAction === 'need' ? 'action selected' : 'action'} aria-pressed={activeAction === 'need'} onClick={() => setAction('need')}><CircleAlert size={16}/> Need</button><button type="button" className={activeAction === 'prayer' ? 'action selected' : 'action'} aria-pressed={activeAction === 'prayer'} onClick={() => setAction('prayer')}><Moon size={16}/> Prayer</button><button type="button" className="action complete" onClick={() => void complete()}><SquareCheckBig size={16}/> Complete</button></div>{activeAction === 'note' && <div className="mission-input"><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note from this visit…"/><button className="mission-secondary" onClick={() => void saveNote()} disabled={!note.trim()}>Save note</button></div>}{activeAction === 'need' && <div className="mission-input"><textarea value={need} onChange={e => setNeed(e.target.value)} placeholder="What need should the team follow up on?"/><button className="mission-secondary" onClick={() => void saveNeed()} disabled={!need.trim()}>Record need</button></div>}{activeAction === 'prayer' && <div className="mission-input"><textarea value={prayer} onChange={e => setPrayer(e.target.value)} placeholder="What should we be praying for?"/><button className="mission-secondary" onClick={() => void savePrayer()} disabled={!prayer.trim()}>Save prayer</button></div>}</section>}
      {current && <section className="mission-card"><div className="mission-section-heading"><div><p className="eyebrow">OBJECTIVES</p><h2>What needs to happen here?</h2></div><span>{objectives.filter(o => o.status === 'complete').length}/{objectives.length}</span></div>{objectives.length ? objectives.map(objective => <button key={objective.id} className={objective.status === 'complete' ? 'mission-objective is-complete' : 'mission-objective'} onClick={() => void toggleObjective(objective)}><span className="objective-box">{objective.status === 'complete' && <Check size={15}/>}</span><span>{objective.title}</span></button>) : <p className="mission-muted">No objectives have been assigned yet.</p>}</section>}
      {visit && !visit.ended_at && <section className="mission-card"><div className="mission-section-heading"><div><p className="eyebrow">VISIT OUTCOME</p><h2>Close the visit</h2></div><button className="mission-icon-button" onClick={() => setVisit(null)} aria-label="Close visit panel"><X size={18}/></button></div><label className="mission-label">Outcome<input value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="Connected · No answer · Follow-up needed"/></label><label className="mission-label">Summary<textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="What happened? What should the team know?"/></label><button className="mission-primary" onClick={() => void finishVisit()} disabled={!outcome.trim()}>Save outcome</button></section>}
      {message && <div className="mission-toast" role="status">{message}</div>}{error && <div className="mission-error" role="alert">{error}</div>}
    </>}
  </main>
}
