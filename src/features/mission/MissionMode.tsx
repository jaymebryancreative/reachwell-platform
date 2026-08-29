import { useState } from 'react'

type Assignment = { id: string; label: string; completed?: boolean }

const demoAssignments: Assignment[] = [
  { id: 'oak-101', label: '101 Oak Street' },
  { id: 'oak-103', label: '103 Oak Street' },
  { id: 'oak-105', label: '105 Oak Street' }
]

type Action = 'note' | 'need' | 'prayer' | 'complete' | null

export function MissionMode() {
  const [assignments, setAssignments] = useState(demoAssignments)
  const [currentId, setCurrentId] = useState(assignments[0].id)
  const [activeAction, setActiveAction] = useState<Action>('note')
  const [note, setNote] = useState('')

  const currentIndex = assignments.findIndex(a => a.id === currentId)
  const current = assignments[currentIndex]

  function completeCurrent() {
    setAssignments(items => items.map(a => a.id === currentId ? { ...a, completed: true } : a))
    setActiveAction('complete')
    const next = assignments.slice(currentIndex + 1).find(a => !a.completed)
    if (next) setCurrentId(next.id)
  }

  return (
    <main className="mission-shell">
      <header className="mission-header">
        <div><span className="brand">REACHWELL</span><strong>MISSION MODE</strong></div>
        <span className="live-dot">Live</span>
      </header>

      <section className="mission-card">
        <p className="eyebrow">CURRENT HOME / ASSIGNMENT</p>
        <h1>{current.label}{current.completed ? ' ✓' : ''}</h1>
        <div className="assignment-list" aria-label="Assignments">
          {assignments.map(a => (
            <button key={a.id} className={a.id === currentId ? 'assignment selected' : 'assignment'} onClick={() => { setCurrentId(a.id); setActiveAction(null) }}>
              {a.label}{a.completed ? ' ✓' : ''}
            </button>
          ))}
        </div>
      </section>

      <section className="mission-card">
        <div className="action-row">
          {(['note','need','prayer','complete'] as Action[]).filter(Boolean).map(action => (
            <button key={action} className={activeAction === action ? 'action selected' : 'action'} onClick={() => action === 'complete' ? completeCurrent() : setActiveAction(action)}>
              {action}
            </button>
          ))}
        </div>
        {activeAction === 'note' && <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add or update your note. Notes remain editable after saving." />}
        {activeAction === 'need' && <p>Record a need for follow-up.</p>}
        {activeAction === 'prayer' && <p>Record a prayer request with the appropriate privacy level.</p>}
        {activeAction === 'complete' && <p>Assignment completion is ready to sync to the backend.</p>}
      </section>
    </main>
  )
}
