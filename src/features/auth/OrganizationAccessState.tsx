import { FormEvent, useState } from 'react'
import { ArrowRight, Building2, LogOut, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useReachWellContext } from '../../lib/reachwellContext'
import './auth.css'

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

function readableError(error: unknown) {
  return error instanceof Error && error.message ? error.message : 'ReachWell could not complete that request. Please try again.'
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
    if (!organizationName || !organizationSlug) {
      setCreateError('Enter an organization name to continue.')
      return
    }

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
      setCreateError(readableError(bootstrapError))
    } finally {
      setBusy(false)
    }
  }

  const retry = async () => {
    setBusy(true)
    setCreateError(null)
    try {
      await refreshWorkspace()
    } catch (retryError) {
      setCreateError(readableError(retryError))
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    setCreateError(null)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
    } catch (signOutError) {
      setCreateError(readableError(signOutError))
    } finally {
      setBusy(false)
    }
  }

  return <main className="rw-auth-page">
    <div className="rw-auth-glow rw-auth-glow-one" />
    <div className="rw-auth-glow rw-auth-glow-two" />
    <section className="rw-auth-card" aria-labelledby="organization-access-title">
      <div className="rw-auth-brand"><span className="rw-auth-mark"><ShieldAlert size={18} /></span><span>reachwell</span></div>
      {!showCreate ? <>
        <div className="rw-auth-heading">
          <span className="rw-eyebrow">Workspace access</span>
          <h1 id="organization-access-title">Finish setting up your ReachWell workspace.</h1>
          <p>{error ? 'We could not verify your workspace yet. You can retry safely or create your organization now.' : 'No active organization was found for ' + (user?.email ?? 'this account') + '.'}</p>
        </div>
        {createError && <div className="rw-auth-error" role="alert">{createError}</div>}
        <div className="rw-auth-actions">
          <button className="rw-auth-submit" type="button" disabled={busy} onClick={() => setShowCreate(true)}>Create my organization<Building2 size={18} /></button>
          <button className="rw-auth-link" type="button" disabled={busy} onClick={() => { void retry() }}>Retry workspace access</button>
          <button className="rw-auth-link" type="button" disabled={busy} onClick={() => { void signOut() }}>Sign out<LogOut size={16} /></button>
        </div>
      </> : <form onSubmit={createOrganization} className="rw-auth-form">
        <div className="rw-auth-heading">
          <span className="rw-eyebrow">New workspace</span>
          <h1>Create your ReachWell organization.</h1>
          <p>You will become the organization owner and can invite your team after setup.</p>
        </div>
        <label htmlFor="organization-name">Organization name
          <input id="organization-name" autoFocus value={name} onChange={e => { const nextName = e.target.value; setName(nextName); if (!slug) setSlug(slugify(nextName)) }} placeholder="Hope Community Outreach" disabled={busy} required />
        </label>
        <label htmlFor="organization-slug">Workspace address
          <input id="organization-slug" value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="hope-community-outreach" disabled={busy} required />
        </label>
        {createError && <div className="rw-auth-error" role="alert">{createError}</div>}
        <button className="rw-auth-submit" type="submit" disabled={busy} aria-busy={busy}>{busy ? 'Creating workspace…' : 'Create workspace'}<ArrowRight size={18} /></button>
        <button type="button" className="rw-auth-link" onClick={() => { setShowCreate(false); setCreateError(null) }} disabled={busy}>Back</button>
      </form>}
    </section>
  </main>
}
