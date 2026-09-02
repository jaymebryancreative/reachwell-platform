import { BriefcaseBusiness, ClipboardCheck, UserRound, Users } from 'lucide-react'
import type { EventParticipantRecord, TeamRecord } from '../../lib/reachwellApi'
import type { EventTeamRecord } from './eventCommandCenterApi'

type Assignment = { id: string; title: string; assignment_type: string; status: string; assigned_team_id: string | null; assigned_user_id: string | null; household_id: string | null; person_id: string | null; address_label: string | null; sequence_number: number | null }

export function EventCommandCenterPanel({ eventTeams, participants, assignments, teams, onAddTeam, onOpenSignIn }: { eventTeams: EventTeamRecord[]; participants: EventParticipantRecord[]; assignments: Assignment[]; teams: TeamRecord[]; onAddTeam: () => void; onOpenSignIn: () => void }) {
  const completed = assignments.filter(item => item.status === 'completed').length
  const readiness = assignments.length ? Math.round((completed / assignments.length) * 100) : 100
  const availableTeams = teams.filter(team => !eventTeams.some(item => item.team_id === team.id))
  return <div className="rw-command-center">
    <div className="rw-command-header"><div><span className="rw-eyebrow">Event Command Center</span><h3>Ready for the field</h3><p>One place for leaders to confirm teams, people, attendance, and assignments before outreach begins.</p></div><button className="rw-primary-button" onClick={onOpenSignIn}><ClipboardCheck size={17}/> Open Sign-In</button></div>
    <div className="rw-command-grid">
      <div className="rw-event-panel"><div className="rw-event-panel-head"><div><span className="rw-eyebrow">Teams</span><h3>Serving teams</h3></div><button className="rw-secondary-button" onClick={onAddTeam} disabled={!availableTeams.length}><Users size={16}/> Add team</button></div>{eventTeams.length ? eventTeams.map(item => <div className="rw-event-team-row" key={item.id}><span className="rw-event-icon"><Users size={16}/></span><div><strong>{item.team?.name || 'Unknown team'}</strong><small>Connected to this event</small></div><span className="rw-status is-ready">Active</span></div>) : <div className="rw-roster-empty">No teams connected yet.</div>}</div>
      <div className="rw-event-panel"><div className="rw-event-panel-head"><div><span className="rw-eyebrow">Attendance</span><h3>People readiness</h3></div><UserRound size={18}/></div><div className="rw-mini-metrics"><div><strong>{participants.length}</strong><span>Roster</span></div><div><strong>{participants.filter(p => p.attendance_status === 'present' || p.attendance_status === 'late').length}</strong><span>Present / late</span></div><div><strong>{participants.filter(p => p.attendance_status === 'absent').length}</strong><span>Absent</span></div><div><strong>{participants.filter(p => p.attendance_status === 'not_marked').length}</strong><span>Unmarked</span></div></div></div>
      <div className="rw-event-panel"><div className="rw-event-panel-head"><div><span className="rw-eyebrow">Assignments</span><h3>Field readiness</h3></div><BriefcaseBusiness size={18}/></div><div className="rw-readiness"><strong>{readiness}%</strong><span>{assignments.length ? `${completed} of ${assignments.length} completed` : 'No assignments attached yet'}</span><div className="rw-progress-track"><span style={{ width: `${readiness}%` }}/></div></div></div>
    </div>
  </div>
}
