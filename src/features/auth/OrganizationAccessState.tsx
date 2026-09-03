import { LogOut, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useReachWellContext } from '../../lib/reachwellContext'
import './auth.css'

export function OrganizationAccessState() {
  const { user, error } = useReachWellContext()

  return (
    <main className="rw-auth-page">
      <div className="rw-auth-glow rw-auth-glow-one" />
      <div className="rw-auth-glow rw-auth-glow-two" />
      <section className="rw-auth-card" aria-labelledby="organization-access-title">
        <div className="rw-auth-brand">
          <span className="rw-auth-mark"><ShieldAlert size={18} /></span>
          <span>reachwell</span>
        </div>
        <div className="rw-auth-heading">
          <span className="rw-eyebrow">Workspace access</span>
          <h1 id="organization-access-title">Your account is signed in, but no active organization is available.</h1>
          <p>
            {error
              ? 'ReachWell could not verify your organization membership. Please try again or contact an organization administrator.'
              : `We could not find an active organization membership for ${user?.email ?? 'this account'}.`}
          </p>
        </div>
        <div className="rw-auth-trust">
          <ShieldAlert size={15} />
          <span>ReachWell will not load organization data until your authenticated account has authorized workspace membership.</span>
        </div>
        <button className="rw-auth-submit" type="button" onClick={() => { void supabase.auth.signOut() }}>
          Sign out
          <LogOut size={18} />
        </button>
      </section>
    </main>
  )
}
