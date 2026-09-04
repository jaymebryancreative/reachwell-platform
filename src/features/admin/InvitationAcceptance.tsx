import { useEffect, useState } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export function InvitationAcceptance({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')
  const [message, setMessage] = useState('Checking your invitation…')
  useEffect(() => { let active = true; const run = async () => { const { data: session } = await supabase.auth.getSession(); if (!session.session) { if (active) { setStatus('error'); setMessage('Sign in with the email address that received this invitation, then open the invitation link again.') }; return }; const { data, error } = await supabase.rpc('accept_organization_invitation', { p_token: token }); if (!active) return; if (error) { setStatus('error'); setMessage(error.message) } else { setStatus('success'); setMessage(`You have joined the organization as ${String(data?.[0]?.role ?? 'a member').replace('_',' ')}.`); window.history.replaceState({}, '', window.location.pathname) } }; void run(); return () => { active = false } }, [token])
  return <div className="admin-workspace"><div className="rw-empty-state">{status === 'success' ? <CheckCircle2 size={34}/> : <ShieldCheck size={34}/>}<h1>{status === 'success' ? 'Invitation accepted' : 'Organization invitation'}</h1><p>{message}</p>{status === 'error' && <button className="rw-primary-button" onClick={() => window.location.reload()}>Try again</button>}</div></div>
}
