import { FormEvent, useState } from 'react'
import { ArrowRight, Building2, LogOut, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useReachWellContext } from '../../lib/reachwellContext'
import './auth.css'

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export function OrganizationAccessState() {
  const { user, error, refreshWorkspace } = useReachWellContext()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [busy, setBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const createOrganization = async (event: FormEvent) => {
    event.preventDefault()
    const organizationName = name.trim()
    const organizationSlug = slugify(slug || name)
    if (!organizationName || !organizationSlug) return setCreateError('Enter an organization name to continue.')

    setBusy(true)
    setCreateError(null)
    try {
      const { error: bootstrapError } = await supabase.rpc('bootstrap_organization_owner', {
        p_organization_name: organizationName,
        p_slug: organizationSlug,
      })
      if (bootstrapError) throw bootstrapError
      await refreshWorkspace()
    } catch (bootstrapError) {
      setCreateError(bootstrapError instanceof Error ? bootstrapError.message : 'ReachWell could not create your organization. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    setCreateError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setCreateError(signOutError.message)
    setBusy(false)
  }

  return <main className="rw-auth-page"><div className="rw-auth-glow rw-auth-glow-one" /><div className="rw-auth-glow rw-auth-glow-two" /><section className="rw-auth-card" aria-labelledby="organization-access-title"><div className="rw-auth-brand"><span className="rw-auth-mark"><ShieldAlert size={18} /></span><span>reachwell</span></div>{!showCreate ? <><div className="rw-auth-heading"><span className="rw-eyebrow">Workspace access</span><h1 id="organization-access-title">Your account is signed in, but no active organization is available.</h1><p>{error ? 'ReachWell could not verify your organization membership. You can retry or create a new workspace.' : 'We could not find an active organization membership for ' + (user?.email ?? 'this account') + '.'}</p></div>{createError && <div className="rw-auth-error" role="alert">{createError}</div>}<div className="rw-auth-actions"><button className="rw-auth-submit" type="button" disabled={busy} onClick={() => setShowCreate(true)}>Create an organization<Building2 size={18} /></button><button className="rw-auth-link" type="button" disabled={busy} onClick={() => { void refreshWorkspace() }}>Retry workspace access</button><button className="rw-auth-link" type="button" disabled={busy} onClick={() => { void signOut() }}>Sign out<LogOut size={16} /></button></div></> : <form onSubmit={createOrganization} className="rw-auth-form"><div className="rw-auth-heading"><span className="rw-eyebrow">New workspace</span><h1>Create your ReachWell organization.</h1><p>You will become the organization owner and can invite your team after setup.</p></div><label>Organization name<input autoFocus value={name} onChange={e => { setName(e.target.value); if (!slug) setSlug(slugify(e.target.value)) }} placeholder="Hope Community Outreach" disabled={busy} required /></label><label>Workspace address<input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="hope-community-outreach" disabled={busy} required /></label>{createError && <div className="rw-auth-error" role="alert">{createError}</div>}<button className="rw-auth-submit" disabled={busy}>{busy ? 'Creating workspace…' : 'Create workspace'}<ArrowRight size={18} /></button><button type="button" className="rw-auth-link" onClick={() => setShowCreate(false)} disabled={busy}>Back</button></form>}</section></main>
}
