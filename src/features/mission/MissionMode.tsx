import { useMemo, useState } from 'react'

type Assignment = { id: string; label: string; completed?: boolean }
type Action = 'note' | 'need' | 'prayer' | 'complete' | null

const demoAssignments: Assignment[] = [
  { id: 'oak-101', label: '101 Oak Street' },
  { id: 'oak-103', label: '103 Oak Street' },
  { id: 'oak-105', label: '105 Oak Street' }
]

export function MissionMode() {
  const [assignments, setAssignments] = useState<Assignment[]>(demoAssignments)
  const [currentId, setCurrentId] = useState<string>(demoAssignments[0].id)
  const [activeAction, setActiveAction] = useState<Action>('note')
  const [note, setNote] = useState('')

  const currentIndex = assignments.findIndex((assignment) => assignment.id === currentId)
  const current = assignments[currentIndex] ?? assignments[0]
  const nextOpenAssignment = useMemo(
    () => assignments.find((assignment) => !assignment.completed && assignment.id !== current.id),
    [assignments, current.id]
  )

  function selectAssignment(id: string) {
    setCurrentId(id)
    setActiveAction(null)
  }

  function selectAction(action: Exclude<Action, null>) {
    if (action === 'complete') {
      completeCurrent()
      return
    }
    setActiveAction((active) => (active === action ? null : action))
  }

  function completeCurrent() {
    setAssignments((items) =>
      items.map((assignment) =>
        assignment.id === current.id ? { ...assignment, completed: true } : assignment
      )
    )
    setActiveAction('complete')

    if (nextOpenAssignment) {
      setCurrentId(nextOpenAssignment.id)
    }
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
          {assignments.map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              className={assignment.id === currentId ? 'assignment selected' : 'assignment'}
              onClick={() => selectAssignment(assignment.id)}
            >
              {assignment.label}{assignment.completed ? ' ✓' : ''}
            </button>
          ))}
        </div>
      </section>

      <section className="mission-card">
        <div className="action-row" aria-label="Mission actions">
          {(['note', 'need', 'prayer', 'complete'] as const).map((action) => (
            <button
              key={action}
              type="button"
              aria-pressed={activeAction === action}
              className={activeAction === action ? 'action selected' : 'action'}
              onClick={() => selectAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {activeAction === 'note' && (
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add or update your note. Notes remain editable after saving."
          />
        )}
        {activeAction === 'need' && <p>Record a need for follow-up.</p>}
        {activeAction === 'prayer' && <p>Record a prayer request with the appropriate privacy level.</p>}
        {activeAction === 'complete' && <p>Assignment marked complete. Backend sync comes next.</p>}
      </section>
    </main>
  )
}
