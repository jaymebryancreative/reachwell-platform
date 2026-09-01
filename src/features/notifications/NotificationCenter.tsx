import { useEffect, useState } from 'react'
import { Bell, Check, RefreshCw } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './notifications.css'

type NotificationRow = { id: string; title: string; body: string | null; type: string; read_at: string | null; created_at: string }

export function NotificationCenter() {
  const { user } = useReachWellContext()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!user) return
    setLoading(true); setError('')
    const { data, error: loadError } = await supabase.from('notifications').select('id,title,body,type,read_at,created_at').eq('recipient_id', user.id).order('created_at', { ascending: false }).limit(100)
    if (loadError) setError(loadError.message); else setItems((data ?? []) as NotificationRow[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
    if (!user) return
    const channel = supabase.channel(`reachwell-notifications-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` }, payload => {
        setItems(current => [payload.new as NotificationRow, ...current].slice(0, 100))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` }, payload => {
        setItems(current => current.map(item => item.id === payload.new.id ? payload.new as NotificationRow : item))
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user?.id])

  const markRead = async (id: string) => {
    const readAt = new Date().toISOString()
    const { error: updateError } = await supabase.from('notifications').update({ read_at: readAt }).eq('id', id).eq('recipient_id', user?.id ?? '')
    if (updateError) setError(updateError.message); else setItems(current => current.map(item => item.id === id ? { ...item, read_at: readAt } : item))
  }

  return <div className="notification-center"><header><div><span className="rw-eyebrow">REACHWELL</span><h1>Notifications</h1><p>Keep important follow-ups, field activity, and team signals visible.</p></div><button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/>Refresh</button></header>{error && <div className="rw-context-alert" role="alert">{error}</div>}<div className="notification-list">{loading && <div className="rw-empty-state">Loading notifications…</div>}{!loading && !items.length && <div className="rw-empty-state"><Bell size={22}/><h2>You’re all caught up</h2><p>New operational notifications will appear here.</p></div>}{items.map(item => <article className={`notification-card ${item.read_at ? 'read' : 'unread'}`} key={item.id}><Bell size={18}/><div><strong>{item.title}</strong><p>{item.body || item.type}</p><small>{new Date(item.created_at).toLocaleString()}</small></div>{!item.read_at && <button className="notification-read" onClick={() => void markRead(item.id)} aria-label="Mark notification as read"><Check size={17}/></button>}</article>)}</div></div>
}
