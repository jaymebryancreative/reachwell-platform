import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Plus, RefreshCw, Search, Send, Archive, CheckCheck, Pencil, Trash2 } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type Channel = { id: string; name: string; description: string | null; channel_type: string; team_id: string | null; event_id: string | null; assignment_id: string | null; is_private: boolean; created_by: string | null; archived_at: string | null }
type Message = { id: string; author_id: string | null; body: string; created_at: string; edited_at: string | null }
type Profile = { id: string; full_name: string | null; first_name: string | null; last_name: string | null; email: string | null }

const canManage = (role: string | null) => role === 'owner' || role === 'admin'
const displayProfile = (profile?: Profile) => profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'ReachWell member'

export function CommunicationWorkspace() {
  const { organizationId, user, organizationRole } = useReachWellContext()
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingBody, setEditingBody] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const selected = channels.find(channel => channel.id === selectedId) ?? null

  const loadChannels = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    const { data, error: loadError } = await supabase.from('communication_channels').select('id,name,description,channel_type,team_id,event_id,assignment_id,is_private,created_by,archived_at').eq('organization_id', organizationId).is('archived_at', null).order('name')
    if (loadError) setError(loadError.message)
    else { const next = (data ?? []) as Channel[]; setChannels(next); setSelectedId(current => current && next.some(channel => channel.id === current) ? current : next[0]?.id ?? '') }
    setLoading(false)
  }

  const loadMessages = async () => {
    if (!selectedId) { setMessages([]); return }
    const { data, error: loadError } = await supabase.from('communication_messages').select('id,author_id,body,created_at,edited_at').eq('channel_id', selectedId).is('deleted_at', null).order('created_at', { ascending: true }).limit(500)
    if (loadError) { setError(loadError.message); return }
    const next = (data ?? []) as Message[]; setMessages(next)
    const ids = [...new Set(next.map(item => item.author_id).filter((id): id is string => Boolean(id)))]
    if (ids.length) {
      const { data: people } = await supabase.from('profiles').select('id,full_name,first_name,last_name,email').in('id', ids)
      setProfiles(current => ({ ...current, ...Object.fromEntries(((people ?? []) as Profile[]).map(profile => [profile.id, profile])) }))
    }
    if (user && next.length) {
      await supabase.from('communication_message_reads').upsert(next.map(message => ({ message_id: message.id, user_id: user.id, read_at: new Date().toISOString() })), { onConflict: 'message_id,user_id' })
    }
  }

  useEffect(() => { void loadChannels() }, [organizationId])
  useEffect(() => { void loadMessages() }, [selectedId])
  useEffect(() => {
    if (!selectedId) return
    const realtime = supabase.channel(`reachwell-communication-${selectedId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'communication_messages', filter: `channel_id=eq.${selectedId}` }, () => { void loadMessages() }).subscribe()
    return () => { void supabase.removeChannel(realtime) }
  }, [selectedId])

  const filteredChannels = useMemo(() => channels.filter(channel => `${channel.name} ${channel.description ?? ''} ${channel.channel_type}`.toLowerCase().includes(search.toLowerCase())), [channels, search])
  const filteredMessages = useMemo(() => messages.filter(message => `${message.body} ${displayProfile(profiles[message.author_id ?? ''])}`.toLowerCase().includes(search.toLowerCase())), [messages, profiles, search])

  const createChannel = async () => {
    if (!organizationId || !user || !newName.trim()) return
    setError('')
    const { data, error: createError } = await supabase.from('communication_channels').insert({ organization_id: organizationId, name: newName.trim(), description: newDescription.trim() || null, channel_type: 'organization', created_by: user.id, is_private: false }).select('id,name,description,channel_type,team_id,event_id,assignment_id,is_private,created_by,archived_at').single()
    if (createError) { setError(createError.message); return }
    setNewName(''); setNewDescription(''); setShowCreate(false); await loadChannels(); if (data?.id) setSelectedId(data.id)
  }

  const sendMessage = async () => {
    if (!selectedId || !user || !draft.trim() || sending) return
    setSending(true); setError('')
    const { error: sendError } = await supabase.from('communication_messages').insert({ channel_id: selectedId, author_id: user.id, body: draft.trim() })
    if (sendError) setError(sendError.message); else { setDraft(''); await loadMessages() }
    setSending(false)
  }

  const saveEdit = async () => {
    if (!editingId || !editingBody.trim()) return
    const { error: editError } = await supabase.from('communication_messages').update({ body: editingBody.trim(), edited_at: new Date().toISOString() }).eq('id', editingId).eq('author_id', user?.id ?? '')
    if (editError) setError(editError.message); else { setEditingId(null); setEditingBody(''); await loadMessages() }
  }

  const deleteMessage = async (messageId: string) => {
    if (!user || !window.confirm('Delete this message?')) return
    const { error: deleteError } = await supabase.from('communication_messages').update({ deleted_at: new Date().toISOString() }).eq('id', messageId).eq('author_id', user.id)
    if (deleteError) setError(deleteError.message); else await loadMessages()
  }

  const archiveChannel = async () => {
    if (!selected || !canManage(organizationRole)) return
    if (!window.confirm(`Archive “${selected.name}”?`)) return
    const { error: archiveError } = await supabase.from('communication_channels').update({ archived_at: new Date().toISOString() }).eq('id', selected.id)
    if (archiveError) setError(archiveError.message); else await loadChannels()
  }

  return <div className="communication-workspace">
    <header className="money-trail-heading"><div><span className="rw-eyebrow">REACHWELL COMMUNICATION</span><h1>Communication</h1><p>Keep conversations connected to the teams and work they support.</p></div><div style={{ display: 'flex', gap: 8 }}><button className="rw-secondary-button" onClick={() => void loadChannels()} disabled={loading}><RefreshCw size={16}/> {loading ? 'Refreshing…' : 'Refresh'}</button>{canManage(organizationRole) && <button className="rw-primary-button" onClick={() => setShowCreate(value => !value)}><Plus size={16}/> New channel</button>}</div></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    {showCreate && canManage(organizationRole) && <div className="rw-card" style={{ display: 'grid', gap: 10, marginBottom: 16 }}><input className="rw-input" value={newName} onChange={event => setNewName(event.target.value)} placeholder="Channel name" aria-label="Channel name" /><input className="rw-input" value={newDescription} onChange={event => setNewDescription(event.target.value)} placeholder="Description (optional)" aria-label="Channel description" /><button className="rw-primary-button" onClick={() => void createChannel()} disabled={!newName.trim()}>Create channel</button></div>}
    <div className="communication-layout">
      <aside className="communication-channels"><div className="ops-search"><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search channels and messages" aria-label="Search communication" /></div>{filteredChannels.map(channel => <button key={channel.id} className={channel.id === selectedId ? 'selected' : ''} onClick={() => setSelectedId(channel.id)}><MessageCircle size={16}/><span>{channel.name}<small>{channel.team_id ? 'Team' : channel.event_id ? 'Event' : channel.assignment_id ? 'Mission assignment' : 'Organization'}</small></span></button>)}{!filteredChannels.length && <div className="rw-empty-state">No channels match your search.</div>}</aside>
      <section className="communication-thread">{selected ? <><div className="communication-thread-head"><div><strong>{selected.name}</strong><small>{selected.description || 'Organization conversation'}</small></div>{canManage(organizationRole) && <button className="rw-secondary-button" onClick={() => void archiveChannel()}><Archive size={15}/> Archive</button>}</div><div className="ops-message-list" aria-live="polite">{filteredMessages.map(item => <article className="ops-message" key={item.id}><div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><div><strong>{displayProfile(profiles[item.author_id ?? ''])}</strong><small style={{ display:'block' }}>{new Date(item.created_at).toLocaleString()}{item.edited_at ? ' · edited' : ''} {user && item.author_id === user.id && <CheckCheck size={13} aria-label="Your message" />}</small></div>{user && item.author_id === user.id && <div style={{ display:'flex', gap:4 }}><button className="rw-icon-button" title="Edit message" aria-label="Edit message" onClick={() => { setEditingId(item.id); setEditingBody(item.body) }}><Pencil size={14}/></button><button className="rw-icon-button" title="Delete message" aria-label="Delete message" onClick={() => void deleteMessage(item.id)}><Trash2 size={14}/></button></div>}</div>{editingId === item.id ? <div style={{ display:'flex', gap:8, marginTop:8 }}><input className="rw-input" value={editingBody} onChange={event => setEditingBody(event.target.value)} aria-label="Edit message" /><button className="rw-primary-button" onClick={() => void saveEdit()}>Save</button><button className="rw-secondary-button" onClick={() => setEditingId(null)}>Cancel</button></div> : <p>{item.body}</p>}</article>)}{!filteredMessages.length && <div className="rw-empty-state"><h2>No messages yet</h2><p>Start the conversation with this channel.</p></div>}</div><div className="ops-composer"><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage() } }} placeholder="Write a message…" aria-label="Message" /><button className="rw-primary-button" onClick={() => void sendMessage()} disabled={!draft.trim() || sending}><Send size={15}/> {sending ? 'Sending…' : 'Send'}</button></div></> : <div className="rw-empty-state"><MessageCircle size={28}/><h2>Select a channel</h2><p>Choose a conversation or create one if you have administration access.</p></div>}</section>
    </div>
  </div>
}
