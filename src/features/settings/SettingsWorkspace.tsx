import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, LogOut, Save, ShieldCheck } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

export function SettingsWorkspace() {
  const { organizationId, organizationName, organizationRole, user } = useReachWellContext()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    void (async () => {
      const { data } = await supabase.from('notification_preferences').select('email_enabled,in_app_enabled').eq('user_id', user.id).maybeSingle()
      if (data) {
        setEmailNotifications(data.email_enabled !== false)
        setInAppNotifications(data.in_app_enabled !== false)
      }
    })()
  }, [user])

  const savePreferences = async () => {
    if (!user) return
    setSaving(true); setSaved(false); setError('')
    const { error: saveError } = await supabase.from('notification_preferences').upsert({ user_id: user.id, email_enabled: emailNotifications, in_app_enabled: inAppNotifications }, { onConflict: 'user_id' })
    if (saveError) setError(saveError.message)
    else setSaved(true)
    setSaving(false)
  }

  return <div className="ops-hub">
    <header className="ops-heading"><div><span className="rw-eyebrow">REACHWELL SETTINGS</span><h1>Settings & Preferences</h1><p>Control your personal notifications and see the workspace you are signed into.</p></div><button className="rw-secondary-button" onClick={() => void supabase.auth.signOut()}><LogOut size={16}/> Sign out</button></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    {saved && <div className="rw-context-alert" role="status"><CheckCircle2 size={16}/> Preferences saved.</div>}
    <div className="rw-overview-grid">
      <section className="rw-card"><ShieldCheck size={22}/><h2>Workspace access</h2><p><strong>{organizationName || 'Organization workspace'}</strong></p><p>Your role: <strong>{organizationRole || 'Member'}</strong></p><small>Access is enforced by the organization membership and database policies.</small></section>
      <section className="rw-card"><Bell size={22}/><h2>Notifications</h2><label><input type="checkbox" checked={inAppNotifications} onChange={e => setInAppNotifications(e.target.checked)}/> In-app notifications</label><label><input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)}/> Email notifications</label><button className="rw-primary-button" onClick={() => void savePreferences()} disabled={saving || !organizationId}><Save size={16}/> {saving ? 'Saving…' : 'Save preferences'}</button><small>Email delivery still requires a configured provider; disabling it prevents notification preference-based email delivery.</small></section>
    </div>
  </div>
}
