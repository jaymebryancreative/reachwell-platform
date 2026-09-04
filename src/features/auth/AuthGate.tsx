import { type FormEvent, type ReactNode, useState } from 'react'
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import { useReachWellContext } from '../../lib/reachwellContext'
import './auth.css'

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useReachWellContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (loading) return <div className="rw-auth-loading"><div className="rw-auth-mark">R</div><strong>Connecting to ReachWell</strong><span>Preparing your workspace…</span></div>
  if (session) return <>{children}</>

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    if (!isSupabaseConfigured) {
      setError('ReachWell authentication is not configured for this environment yet.')
      setBusy(false)
      return
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError) setError(signInError.message)
    setBusy(false)
  }

  const resetPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` })
    if (resetError) setError(resetError.message)
    else setMessage('If an account exists for that email, a password reset link is on its way.')
    setBusy(false)
  }

  return <main className="rw-auth-page"><div className="rw-auth-glow rw-auth-glow-one"/><div className="rw-auth-glow rw-auth-glow-two"/><section className="rw-auth-card"><div className="rw-auth-brand"><span className="rw-auth-mark"><Sparkles size={18}/></span><span>reachwell</span></div><div className="rw-auth-heading"><span className="rw-eyebrow">Welcome back</span><h1>Organize the work that matters.</h1><p>Sign in to continue to your ReachWell workspace.</p></div><form onSubmit={submit} className="rw-auth-form"><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organization.org" required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /></label>{error && <div className="rw-auth-error" role="alert">{error}</div>}{message && <div className="rw-auth-message" role="status">{message}</div>}<button className="rw-auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={18}/></button><button type="button" className="rw-auth-link" onClick={resetPassword} disabled={busy}>Forgot your password?</button></form><div className="rw-auth-trust"><LockKeyhole size={15}/><span>Your organization data stays protected by ReachWell's authenticated workspace and database permissions.</span></div></section></main>
}
