import { useMemo, useState } from 'react'
import { Plus, Search, Shield, UsersRound } from 'lucide-react'
import './teams.css'

type Member = { id: number; name: string; role: 'Leader' | 'Member'; status: 'Ready' | 'Training due' }
type Team = { id: number; name: string; description: string; members: Member[] }

const initialTeams: Team[] = [
  { id: 1, name: 'Outreach', description: 'Connect with people and neighborhoods through coordinated field outreach.', members: [{ id: 1, name: 'Jordan Bryan', role: 'Leader', status: 'Ready' }, { id: 2, name: 'Alex Morgan', role: 'Member', status: 'Ready' }, { id: 3, name: 'Taylor Reed', role: 'Member', status: 'Training due' }] },
  { id: 2, name: 'Prayer & Care', description: 'Provide prayer support and compassionate follow-up.', members: [{ id: 4, name: 'Casey Williams', role: 'Leader', status: 'Ready' }, { id: 5, name: 'Morgan Lee', role: 'Member', status: 'Ready' }] },
  { id: 3, name: 'Setup & Hospitality', description: 'Prepare welcoming, safe, and well-organized events.', members: [{ id: 6, name: 'Jamie Patel', role: 'Leader', status: 'Ready' }] },
]

export function TeamsWorkspace() {
  const [teams, setTeams] = useState(initialTeams)
  const [selectedId, setSelectedId] = useState(initialTeams[0].id)
  const [query, setQuery] = useState('')
  const [draftName, setDraftName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const selected = teams.find(team => team.id === selectedId) ?? teams[0]
  const filtered = useMemo(() => teams.filter(team => team.name.toLowerCase().includes(query.toLowerCase())), [teams, query])

  const createTeam = () => {
    const name = draftName.trim()
    if (!name) return
    const next = { id: Date.now(), name, description: 'A custom team created for this organization.', members: [] as Member[] }
    setTeams(current => [...current, next]); setSelectedId(next.id); setDraftName(''); setShowCreate(false)
  }

  return <div className="rw-teams">
    <div className="rw-section-heading"><div><span className="rw-eyebrow">People working together</span><h1>Teams</h1><p>Create the structure that fits your organization. Reachwell does not force every nonprofit into the same team model.</p></div><button className="rw-primary-button" onClick={() => setShowCreate(true)}><Plus size={18}/> Create team</button></div>
    <div className="rw-team-layout">
      <aside className="rw-team-list-panel"><label className="rw-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search teams" /></label><div className="rw-team-list">{filtered.map(team => <button key={team.id} onClick={() => setSelectedId(team.id)} className={team.id === selected.id ? 'is-selected' : ''}><span><strong>{team.name}</strong><small>{team.members.length} member{team.members.length === 1 ? '' : 's'}</small></span><UsersRound size={18}/></button>)}</div></aside>
      <section className="rw-team-detail"><div className="rw-team-detail-head"><div><span className="rw-eyebrow">Custom organization team</span><h2>{selected.name}</h2><p>{selected.description}</p></div><button className="rw-secondary-button"><Shield size={17}/> Manage access</button></div><div className="rw-team-stats"><div><strong>{selected.members.length}</strong><span>Members</span></div><div><strong>{selected.members.filter(m => m.role === 'Leader').length}</strong><span>Leaders</span></div><div><strong>{selected.members.filter(m => m.status === 'Ready').length}</strong><span>Ready to serve</span></div></div><div className="rw-roster"><div className="rw-roster-head"><h3>Team roster</h3><button className="rw-secondary-button">Add person</button></div>{selected.members.length ? selected.members.map(member => <div className="rw-member-row" key={member.id}><span className="rw-member-avatar">{member.name.split(' ').map(part => part[0]).join('').slice(0,2)}</span><div><strong>{member.name}</strong><small>{member.role}</small></div><span className={`rw-status ${member.status === 'Ready' ? 'is-ready' : ''}`}>{member.status}</span></div>) : <div className="rw-roster-empty">No members yet. Add people to begin building this team.</div>}</div></section>
    </div>
    {showCreate && <div className="rw-modal-backdrop" role="presentation"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Create a team"><span className="rw-eyebrow">Organization setup</span><h2>Create a custom team</h2><p>Teams can represent any structure your organization needs.</p><label>Team name<input autoFocus value={draftName} onChange={e => setDraftName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createTeam() }} placeholder="e.g. Community Outreach" /></label><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="rw-primary-button" onClick={createTeam}>Create team</button></div></div></div>}
  </div>
}
