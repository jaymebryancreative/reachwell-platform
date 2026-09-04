import { useEffect, useState } from 'react'
import { MailPlus, RefreshCw, ShieldCheck, UserRoundCog } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './admin.css'

type Member = { id: string; user_id: string; role: string; status: string; joined_at: string | null; profile?: { full_name: string | null; first_name: string | null; last_name: string | null; email: string | null } | null }
type Invitation = { id: string; email: string; role: string; team_id: string | null; status: string; expires_at: string; created_at: string }
const roles = ['admin', 'director', 'coordinator', 'team_leader', 'volunteer']

export function AdminWorkspace() {
  const { organizationId, organizationRole } = useReachWellContext()
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('volunteer')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const allowed = ['owner', 'admin', 'director'].includes(organizationRole ?? '')

  const load = async () => {
    if (!organizationId || !allowed) return
    setLoading(true); setError('')
    try {
      const [memberResult, invitationResult] = await Promise.all([
        supabase.from('organization_members').select('id,user_id,role,status,joined_at,profile:profiles!organization_members_user_id_fkey(full_name,first_name,last_name,email)').eq('organization_id', organizationId).order('role').order('joined_at'),
        supabase.from('organization_invitations').select('id,email,role,team_id,status,expires_at,created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(50),
      ])
      if (memberResult.error) throw memberResult.error
      if (invitationResult.error) throw invitationResult.error
      setMembers((memberResult.data ?? []) as Member[])
      setInvitations((invitationResult.data ?? []) as Invitation[])
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load administration.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, organizationRole])

  const changeRole = async (userId: string, nextRole: string) => {
    if (!organizationId) return
    setSaving(true); setError(''); setMessage('')
    try {
      const { error: rpcError } = await supabase.rpc('assign_organization_role', { p_organization_id: organizationId, p_user_id: userId, p_role: nextRole })
      if (rpcError) throw rpcError
      setMessage('Organization role updated.')
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to change organization role.') }
    finally { setSaving(false) }
  }

  const invite = async () => {
    if (!organizationId || !email.trim()) return
    setSaving(true); setError(''); setMessage('')
    try {
      const { error: rpcError } = await supabase.rpc('create_organization_invitation', { p_organization_id: organizationId, p_email: email.trim().toLowerCase(), p_role: role, p_team_id: null })
      if (rpcError) throw rpcError
      setEmail(''); setRole('volunteer'); setMessage('Invitation created and is ready for delivery.'); await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create invitation.') }
    finally { setSaving(false) }
  }

  if (!allowed) return <div className="admin-workspace"><div className="rw-empty-state"><ShieldCheck size={28} /><h1>Administration</h1><p>Member and invitation management is restricted to organization owners, administrators, and directors.</p></div></div>
  return <div className="admin-workspace">
    <header className="ops-heading"><div><span className="rw-eyebrow">ADMINISTRATION</span><h1>Organization access</h1><p>Manage organization-level access without turning scoped team leadership into administration.</p></div><button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/>{loading ? 'Refreshing…' : 'Refresh'}</button></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}{message && <div className="rw-success-alert" role="status">{message}</div>}
    <section className="admin-card"><div className="admin-card-heading"><div><span className="rw-eyebrow">INVITE</span><h2>Add an organization member</h2></div><MailPlus size={21}/></div><div className="admin-invite-form"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="person@example.com" aria-label="Invitee email"/><select value={role} onChange={e => setRole(e.target.value)} aria-label="Invitation role">{roles.map(value => <option key={value} value={value}>{value.replace('_',' ')}</option>)}</select><button className="rw-primary-button" onClick={() => void invite()} disabled={saving || !email.trim()}>Create invitation</button></div><small>Invitations are organization-scoped and expire according to the server-side invitation policy.</small></section>
    <section className="admin-card"><div className="admin-card-heading"><div><span className="rw-eyebrow">MEMBERS</span><h2>Current organization access</h2></div><UserRoundCog size={21}/></div><div className="admin-members">{members.map(member => { const name = member.profile?.full_name || [member.profile?.first_name, member.profile?.last_name].filter(Boolean).join(' ') || member.profile?.email || `User ${member.user_id.slice(0, 12)}`; return <div className="admin-member" key={member.id}><div><strong>{name}</strong><small>{member.role.replace('_',' ')} · {member.status}</small></div><select value={member.role} disabled={saving || member.role === 'owner'} onChange={e => void changeRole(member.user_id, e.target.value)} aria-label={`Change role for ${name}`}>{member.role === 'owner' && <option value="owner">owner</option>}{roles.map(value => <option key={value} value={value}>{value.replace('_',' ')}</option>)}</select></div>})}{!members.length && <div className="rw-empty-state">No organization members yet.</div>}</div></section>
    <section className="admin-card"><div className="admin-card-heading"><div><span className="rw-eyebrow">INVITATIONS</span><h2>Pending and recent invitations</h2></div><MailPlus size={21}/></div><div className="admin-members">{invitations.map(inv => <div className="admin-member" key={inv.id}><div><strong>{inv.email}</strong><small>{inv.role.replace('_',' ')} · {inv.status} · expires {new Date(inv.expires_at).toLocaleDateString()}</small></div><span className="admin-status">{inv.status}</span></div>)}{!invitations.length && <div className="rw-empty-state">No invitations yet.</div>}</div></section>
  </div>
}
