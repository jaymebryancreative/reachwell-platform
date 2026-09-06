import { type FormEvent, type ReactNode, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import { useReachWellContext } from '../../lib/reachwellContext'
import './auth.css'

type AuthMode = 'sign-in' | 'sign-up'

function readableAuthError(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'ReachWell could not complete that request. Please check your connection and try again.'
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useReachWellContext()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  if (loading) return <div className="rw-auth-loading"><div className="rw-auth-mark">R</div><strong>Connecting to ReachWell</strong><span>Preparing your secure workspace…</span></div>
  if (session) return <>{children}</>

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return

    const normalizedEmail = email.trim().toLowerCase()
    setError(null)
    setMessage(null)

    if (!normalizedEmail || !password) return setError('Enter your email address and password to continue.')
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError('Enter a valid email address.')
    if (mode === 'sign-up' && password.length < 6) return setError('Use a password with at least 6 characters.')
    if (!isSupabaseConfigured) return setError('ReachWell authentication is unavailable for this deployment. Please try again shortly.')

    setBusy(true)
    try {
      if (mode === 'sign-up') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: window.location.origin + '/' },
        })
        if (signUpError) throw signUpError
        if (data.session) setMessage('Account created. Opening your ReachWell workspace…')
        else {
          setMessage('Account created. Check your email to confirm your account, then return here to sign in.')
          setMode('sign-in')
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        if (signInError) throw signInError
        if (!data.session) throw new Error('ReachWell could not establish a secure session. Please try again.')
      }
    } catch (authError) {
      setError(readableAuthError(authError))
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return setError('Enter your email address first.')
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError('Enter a valid email address first.')

    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: window.location.origin + '/' })
      if (resetError) throw resetError
      setMessage('If an account exists for that email, a password reset link is on its way.')
    } catch (resetError) {
      setError(readableAuthError(resetError))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError(null)
    setMessage(null)
  }

  return <main className="rw-auth-page"><div className="rw-auth-glow rw-auth-glow-one"/><div className="rw-auth-glow rw-auth-glow-two"/><section className="rw-auth-card" aria-labelledby="rw-auth-title"><div className="rw-auth-brand"><span className="rw-auth-mark"><Sparkles size={18}/></span><span>reachwell</span></div><div className="rw-auth-heading"><span className="rw-eyebrow">{mode === 'sign-in' ? 'Welcome back' : 'Get started'}</span><h1 id="rw-auth-title">{mode === 'sign-in' ? 'Organize the work that matters.' : 'Create your ReachWell account.'}</h1><p>{mode === 'sign-in' ? 'Sign in to continue to your ReachWell workspace.' : 'Create your account first. You can create your organization immediately after authentication.'}</p></div><div className="rw-auth-tabs" role="tablist" aria-label="Authentication options"><button type="button" role="tab" aria-selected={mode === 'sign-in'} className={mode === 'sign-in' ? 'is-active' : ''} onClick={() => switchMode('sign-in')}>Sign in</button><button type="button" role="tab" aria-selected={mode === 'sign-up'} className={mode === 'sign-up' ? 'is-active' : ''} onClick={() => switchMode('sign-up')}>Create account</button></div><form onSubmit={submit} className="rw-auth-form" noValidate><label htmlFor="rw-auth-email">Email address<input id="rw-auth-email" name="email" type="email" inputMode="email" autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organization.org" disabled={busy} required /></label><label htmlFor="rw-auth-password">Password<div className="rw-auth-password"><input id="rw-auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'sign-in' ? 'Enter your password' : 'Create a password'} minLength={6} disabled={busy} required /><button type="button" className="rw-auth-password-toggle" onClick={() => setShowPassword(value => !value)} disabled={busy} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>{error && <div className="rw-auth-error" role="alert">{error}</div>}{message && <div className="rw-auth-message" role="status">{message}</div>}<button className="rw-auth-submit" type="submit" disabled={busy} aria-busy={busy}>{busy ? (mode === 'sign-in' ? 'Signing in…' : 'Creating account…') : (mode === 'sign-in' ? 'Enter ReachWell' : 'Create account')}<ArrowRight size={18}/></button>{mode === 'sign-in' && <button type="button" className="rw-auth-link" onClick={resetPassword} disabled={busy}>Forgot your password?</button>}</form><div className="rw-auth-trust"><LockKeyhole size={15}/><span>Your organization data stays protected by ReachWell's authenticated workspace and database permissions.</span></div></section></main>
}
