import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Shield, UsersRound } from 'lucide-react'
import { createTeam, listTeamMemberships, listTeams, type TeamMembershipRecord, type TeamRecord } from '../../lib/reachwellApi'
import './teams.css'

const organizationId = import.meta.env.VITE_REACHWELL_ORGANIZATION_ID

type TeamWithMembers = TeamRecord & { members: TeamMembershipRecord[] }

export function TeamsWorkspace() {
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [draftName, setDraftName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(Boolean(organizationId))
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!organizationId) {
      setLoading(false)
      setError('Reachwell organization context is not configured yet.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const records = await listTeams(organizationId)
      const connected = await Promise.all(records.map(async team => ({ ...team, members: await listTeamMemberships(organizationId, team.id) })))
      setTeams(connected)
      setSelectedId(current => current && connected.some(team => team.id === current) ? current : (connected[0]?.id ?? null))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load teams.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const selected = teams.find(team => team.id === selectedId) ?? teams[0]
  const filtered = useMemo(() => teams.filter(team => team.name.toLowerCase().includes(query.toLowerCase())), [teams, query])

  const create = async () => {
    const name = draftName.trim()
    if (!name || !organizationId) return
    try {
      const created = await createTeam({ organization_id: organizationId, name, description: 'A custom team created for this organization.' })
      const next = { ...created, members: [] as TeamMembershipRecord[] }
      setTeams(current => [...current, next])
      setSelectedId(next.id)
      setDraftName('')
      setShowCreate(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create team.')
    }
  }

  return <div className="rw-teams">
    <div className="rw-section-heading"><div><span className="rw-eyebrow">People working together</span><h1>Teams</h1><p>Create the structure that fits your organization. Reachwell does not force every nonprofit into the same team model.</p></div><button className="rw-primary-button" onClick={() => setShowCreate(true)} disabled={!organizationId}><Plus size={18}/> Create team</button></div>
    {error && <div className="rw-roster-empty">{error}</div>}
    <div className="rw-team-layout">
      <aside className="rw-team-list-panel"><label className="rw-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search teams" /></label><div className="rw-team-list">{loading && <div className="rw-roster-empty">Loading teams…</div>}{!loading && filtered.map(team => <button key={team.id} onClick={() => setSelectedId(team.id)} className={team.id === selected?.id ? 'is-selected' : ''}><span><strong>{team.name}</strong><small>{team.members.length} member{team.members.length === 1 ? '' : 's'}</small></span><UsersRound size={18}/></button>)}{!loading && !filtered.length && <div className="rw-roster-empty">No active teams match this search.</div>}</div></aside>
      {selected ? <section className="rw-team-detail"><div className="rw-team-detail-head"><div><span className="rw-eyebrow">Custom organization team</span><h2>{selected.name}</h2><p>{selected.description || 'No description yet.'}</p></div><button className="rw-secondary-button"><Shield size={17}/> Manage access</button></div><div className="rw-team-stats"><div><strong>{selected.members.length}</strong><span>Members</span></div><div><strong>{selected.members.filter(member => member.is_leader).length}</strong><span>Leaders</span></div><div><strong>{selected.members.length}</strong><span>Ready to serve</span></div></div><div className="rw-roster"><div className="rw-roster-head"><h3>Team roster</h3><button className="rw-secondary-button" disabled>Add person</button></div>{selected.members.length ? selected.members.map(member => { const person = member.person; const name = person?.preferred_name || (person ? `${person.first_name} ${person.last_name}` : 'Unknown person'); return <div className="rw-member-row" key={member.id}><span className="rw-member-avatar">{name.split(' ').map(part => part[0]).join('').slice(0,2)}</span><div><strong>{name}</strong><small>{member.is_leader ? `Leader · ${member.role}` : member.role}</small></div><span className="rw-status is-ready">Active</span></div> }) : <div className="rw-roster-empty">No members yet. Person assignment is the next connected workflow.</div>}</div></section> : <section className="rw-team-detail"><div className="rw-roster-empty">Create a team to begin.</div></section>}
    </div>
    {showCreate && <div className="rw-modal-backdrop" role="presentation"><div className="rw-modal" role="dialog" aria-modal="true" aria-label="Create a team"><span className="rw-eyebrow">Organization setup</span><h2>Create a custom team</h2><p>Teams can represent any structure your organization needs.</p><label>Team name<input autoFocus value={draftName} onChange={e => setDraftName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void create() }} placeholder="e.g. Community Outreach" /></label><div className="rw-modal-actions"><button className="rw-secondary-button" onClick={() => setShowCreate(false)}>Cancel</button><button className="rw-primary-button" onClick={() => void create()}>Create team</button></div></div></div>}
  </div>
}
