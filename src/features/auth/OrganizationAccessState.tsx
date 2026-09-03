import { FormEvent, useState } from 'react'
import { ArrowRight, Building2, LogOut, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useReachWellContext } from '../../lib/reachwellContext'
import './auth.css'

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export function OrganizationAccessState() {
  const { user, error } = useReachWellContext()
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
    const { error: bootstrapError } = await supabase.rpc('bootstrap_organization_owner', {
      p_organization_name: organizationName,
      p_slug: organizationSlug,
    })
    if (bootstrapError) {
      setCreateError(bootstrapError.message)
      setBusy(false)
      return
    }
    window.location.reload()
  }

  return (
    <main className="rw-auth-page">
      <div className="rw-auth-glow rw-auth-glow-one" />
      <div className="rw-auth-glow rw-auth-glow-two" />
      <section className="rw-auth-card" aria-labelledby="organization-access-title">
        <div className="rw-auth-brand">
          <span className="rw-auth-mark"><ShieldAlert size={18} /></span>
          <span>reachwell</span>
        </div>
        {!showCreate ? (
          <>
            <div className="rw-auth-heading">
              <span className="rw-eyebrow">Workspace access</span>
              <h1 id="organization-access-title">Your account is signed in, but no active organization is available.</h1>
              <p>
                {error
                  ? 'ReachWell could not verify your organization membership. If you are starting a new workspace, you can create it here.'
                  : `We could not find an active organization membership for ${user?.email ?? 'this account'}.`}
              </p>
            </div>
            <div className="rw-auth-trust">
              <ShieldAlert size={15} />
              <span>ReachWell will not load organization data until your authenticated account has authorized workspace membership.</span>
            </div>
            <div className="rw-auth-actions">
              <button className="rw-auth-submit" type="button" onClick={() => setShowCreate(true)}>
                Create an organization
                <Building2 size={18} />
              </button>
              <button className="rw-auth-link" type="button" onClick={() => { void supabase.auth.signOut() }}>
                Sign out
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={createOrganization} className="rw-auth-form">
            <div className="rw-auth-heading">
              <span className="rw-eyebrow">New workspace</span>
              <h1>Create your ReachWell organization.</h1>
              <p>You will become the organization owner and can invite your team after setup.</p>
            </div>
            <label>Organization name<input autoFocus value={name} onChange={e => { setName(e.target.value); if (!slug) setSlug(slugify(e.target.value)) }} placeholder="Hope Community Outreach" required /></label>
            <label>Workspace address<input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="hope-community-outreach" required /></label>
            {createError && <div className="rw-auth-error" role="alert">{createError}</div>}
            <button className="rw-auth-submit" disabled={busy}>{busy ? 'Creating workspace…' : 'Create workspace'}<ArrowRight size={18} /></button>
            <button type="button" className="rw-auth-link" onClick={() => setShowCreate(false)} disabled={busy}>Back</button>
          </form>
        )}
      </section>
    </main>
  )
}
