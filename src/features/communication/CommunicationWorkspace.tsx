import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Plus, RefreshCw, Search, Send, Archive, CheckCheck, Pencil, Trash2, Users, Heart, HandHeart, Megaphone, CalendarDays, Shield, Sparkles, House, Star, Settings2 } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type Accent = 'violet' | 'blue' | 'teal' | 'green' | 'amber' | 'orange' | 'rose' | 'indigo'
type IconKey = 'message-circle' | 'users' | 'heart' | 'hand-heart' | 'megaphone' | 'calendar' | 'shield' | 'sparkles' | 'home' | 'star'
type Channel = { id: string; name: string; description: string | null; channel_type: string; team_id: string | null; event_id: string | null; assignment_id: string | null; is_private: boolean; created_by: string | null; archived_at: string | null; accent_color: Accent; icon_key: IconKey }
type Message = { id: string; author_id: string | null; body: string; created_at: string; edited_at: string | null }
type Profile = { id: string; full_name: string | null; first_name: string | null; last_name: string | null; email: string | null }
type Team = { id: string; name: string; description: string | null }
type Preset = { id?: string; name: string; description: string; accent_color: Accent; icon_key: IconKey; sort_order: number }
type UserPreferences = { pinned_channel_ids: string[]; muted_channel_ids: string[]; density: 'comfortable' | 'compact'; open_last_conversation: boolean }

const NATIVE_PRESETS: Preset[] = [
  { name: 'Outreach Team', description: 'Field outreach and community connection', accent_color: 'violet', icon_key: 'megaphone', sort_order: 10 },
  { name: 'Welcome Team', description: 'Guests, hospitality, and first connections', accent_color: 'blue', icon_key: 'hand-heart', sort_order: 20 },
  { name: 'Prayer Team', description: 'Prayer requests and encouragement', accent_color: 'rose', icon_key: 'heart', sort_order: 30 },
  { name: 'Care Team', description: 'Care, follow-up, and practical support', accent_color: 'teal', icon_key: 'heart', sort_order: 40 },
  { name: 'Leadership Team', description: 'Leadership coordination and decisions', accent_color: 'indigo', icon_key: 'shield', sort_order: 50 },
  { name: 'Events Team', description: 'Event planning and event-day coordination', accent_color: 'amber', icon_key: 'calendar', sort_order: 60 },
  { name: 'Communications Team', description: 'Announcements, content, and messaging', accent_color: 'orange', icon_key: 'megaphone', sort_order: 70 },
  { name: 'Volunteer Team', description: 'Volunteer coordination and updates', accent_color: 'green', icon_key: 'users', sort_order: 80 },
]
const ACCENTS: Accent[] = ['violet', 'blue', 'teal', 'green', 'amber', 'orange', 'rose', 'indigo']
const ICONS: IconKey[] = ['message-circle', 'users', 'heart', 'hand-heart', 'megaphone', 'calendar', 'shield', 'sparkles', 'home', 'star']
const canManage = (role: string | null) => role === 'owner' || role === 'admin'
const displayProfile = (profile?: Profile) => profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'ReachWell member'
const iconFor = (key: IconKey) => ({ 'message-circle': MessageCircle, users: Users, heart: Heart, 'hand-heart': HandHeart, megaphone: Megaphone, calendar: CalendarDays, shield: Shield, sparkles: Sparkles, home: House, star: Star }[key] || MessageCircle)
const defaultPreferences: UserPreferences = { pinned_channel_ids: [], muted_channel_ids: [], density: 'comfortable', open_last_conversation: true }

export function CommunicationWorkspace() {
  const { organizationId, user, organizationRole } = useReachWellContext()
  const [channels, setChannels] = useState<Channel[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [presets, setPresets] = useState<Preset[]>(NATIVE_PRESETS)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingBody, setEditingBody] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newAccent, setNewAccent] = useState<Accent>('violet')
  const [newIcon, setNewIcon] = useState<IconKey>('message-circle')
  const [newTeamId, setNewTeamId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const selected = channels.find(channel => channel.id === selectedId) ?? null

  const loadChannels = async () => {
    if (!organizationId) return
    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase.from('communication_channels').select('id,name,description,channel_type,team_id,event_id,assignment_id,is_private,created_by,archived_at,accent_color,icon_key').eq('organization_id', organizationId).is('archived_at', null).order('name')
    if (loadError) {
      setError(loadError.message)
    } else {
      const next = (data ?? []) as Channel[]
      setChannels(next)
      setSelectedId(current => {
        if (current && next.some(channel => channel.id === current)) return current
        const preferred = preferences.open_last_conversation ? next.find(channel => preferences.pinned_channel_ids.includes(channel.id)) : null
        return preferred?.id ?? next[0]?.id ?? ''
      })
    }
    setLoading(false)
  }

  const loadTeams = async () => {
    if (!organizationId) return
    const { data, error: teamError } = await supabase.from('teams').select('id,name,description').eq('organization_id', organizationId).eq('active', true).order('name')
    if (!teamError) setTeams((data ?? []) as Team[])
  }

  const loadPresets = async () => {
    if (!organizationId) return
    const { data, error: presetError } = await supabase.from('communication_presets').select('id,name,description,accent_color,icon_key,sort_order').eq('organization_id', organizationId).order('sort_order').order('name')
    if (!presetError && data?.length) setPresets((data ?? []) as Preset[])
    else setPresets(NATIVE_PRESETS)
  }

  const loadPreferences = async () => {
    if (!organizationId || !user) return
    const { data, error: preferenceError } = await supabase.from('communication_user_preferences').select('pinned_channel_ids,muted_channel_ids,density,open_last_conversation').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle()
    if (!preferenceError && data) setPreferences({ ...defaultPreferences, ...(data as UserPreferences) })
  }

  const savePreferences = async (next: UserPreferences) => {
    if (!organizationId || !user) return
    setPreferences(next)
    const { error: saveError } = await supabase.from('communication_user_preferences').upsert({ user_id: user.id, organization_id: organizationId, ...next }, { onConflict: 'user_id,organization_id' })
    if (saveError) setError(saveError.message)
  }

  const markChannelRead = async (channelId: string, latestMessageId?: string) => {
    if (!user || !latestMessageId) return
    const { error: readError } = await supabase.from('communication_channel_reads').upsert({ user_id: user.id, channel_id: channelId, last_read_message_id: latestMessageId, last_read_at: new Date().toISOString() }, { onConflict: 'user_id,channel_id' })
    if (readError) setError(readError.message)
  }

  const loadMessages = async (markRead = true) => {
    if (!selectedId) {
      setMessages([])
      return
    }
    const { data, error: loadError } = await supabase.from('communication_messages').select('id,author_id,body,created_at,edited_at').eq('channel_id', selectedId).is('deleted_at', null).order('created_at', { ascending: false }).limit(500)
    if (loadError) {
      setError(loadError.message)
      return
    }
    const next = ((data ?? []) as Message[]).reverse()
    setMessages(next)
    const ids = [...new Set(next.map(item => item.author_id).filter((id): id is string => Boolean(id)))]
    if (ids.length) {
      const { data: people } = await supabase.from('profiles').select('id,full_name,first_name,last_name,email').in('id', ids)
      setProfiles(current => ({ ...current, ...Object.fromEntries(((people ?? []) as Profile[]).map(profile => [profile.id, profile])) }))
    }
    if (markRead && next.length) await markChannelRead(selectedId, next[next.length - 1].id)
  }

  useEffect(() => {
    if (!organizationId || !user) return
    void Promise.all([loadPreferences(), loadChannels(), loadTeams(), loadPresets()])
  }, [organizationId, user?.id])

  useEffect(() => { void loadMessages(true) }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    const realtime = supabase.channel(`reachwell-communication-${selectedId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'communication_messages', filter: `channel_id=eq.${selectedId}` }, () => { void loadMessages(false) }).subscribe()
    return () => { void supabase.removeChannel(realtime) }
  }, [selectedId])

  const filteredChannels = useMemo(() => {
    const query = search.trim().toLowerCase()
    const visible = channels.filter(channel => !query || `${channel.name} ${channel.description ?? ''} ${channel.channel_type}`.toLowerCase().includes(query))
    return [...visible].sort((a, b) => {
      const aPinned = preferences.pinned_channel_ids.includes(a.id) ? 0 : 1
      const bPinned = preferences.pinned_channel_ids.includes(b.id) ? 0 : 1
      return aPinned - bPinned || a.name.localeCompare(b.name)
    })
  }, [channels, preferences.pinned_channel_ids, search])

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return messages
    return messages.filter(message => `${message.body} ${displayProfile(profiles[message.author_id ?? ''])}`.toLowerCase().includes(query))
  }, [messages, profiles, search])

  const applyPreset = (preset: Preset) => {
    setNewName(preset.name)
    setNewDescription(preset.description)
    setNewAccent(preset.accent_color)
    setNewIcon(preset.icon_key)
  }

  const createChannel = async () => {
    if (!organizationId || !user || !newName.trim()) return
    setError('')
    const isTeamChat = Boolean(newTeamId)
    const { data, error: createError } = await supabase.from('communication_channels').insert({ organization_id: organizationId, name: newName.trim(), description: newDescription.trim() || null, channel_type: isTeamChat ? 'team' : 'organization', team_id: isTeamChat ? newTeamId : null, created_by: user.id, is_private: false, accent_color: newAccent, icon_key: newIcon }).select('id,name,description,channel_type,team_id,event_id,assignment_id,is_private,created_by,archived_at,accent_color,icon_key').single()
    if (createError) {
      setError(createError.message)
      return
    }
    setNewName('')
    setNewDescription('')
    setNewAccent('violet')
    setNewIcon('message-circle')
    setNewTeamId('')
    setShowCreate(false)
    await loadChannels()
    if (data?.id) setSelectedId(data.id)
  }

  const saveCustomization = async () => {
    if (!selected || !canManage(organizationRole) || !newName.trim()) return
    setError('')
    const { error: updateError } = await supabase.from('communication_channels').update({ name: newName.trim(), description: newDescription.trim() || null, accent_color: newAccent, icon_key: newIcon }).eq('id', selected.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setShowCustomize(false)
    await loadChannels()
  }

  const openCustomization = () => {
    if (!selected) return
    setNewName(selected.name)
    setNewDescription(selected.description ?? '')
    setNewAccent(selected.accent_color)
    setNewIcon(selected.icon_key)
    setShowCustomize(true)
  }

  const togglePinned = async (channelId: string) => {
    const pinned = new Set(preferences.pinned_channel_ids)
    if (pinned.has(channelId)) pinned.delete(channelId)
    else pinned.add(channelId)
    await savePreferences({ ...preferences, pinned_channel_ids: [...pinned] })
  }

  const sendMessage = async () => {
    if (!selectedId || !user || !draft.trim() || sending) return
    setSending(true)
    setError('')
    const { error: sendError } = await supabase.from('communication_messages').insert({ channel_id: selectedId, author_id: user.id, body: draft.trim() })
    if (sendError) setError(sendError.message)
    else {
      setDraft('')
      await loadMessages(true)
    }
    setSending(false)
  }

  const saveEdit = async () => {
    if (!editingId || !editingBody.trim()) return
    const { error: editError } = await supabase.from('communication_messages').update({ body: editingBody.trim(), edited_at: new Date().toISOString() }).eq('id', editingId).eq('author_id', user?.id ?? '')
    if (editError) setError(editError.message)
    else {
      setEditingId(null)
      setEditingBody('')
      await loadMessages(true)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!user || !window.confirm('Delete this message?')) return
    const { error: deleteError } = await supabase.from('communication_messages').update({ deleted_at: new Date().toISOString() }).eq('id', messageId).eq('author_id', user.id)
    if (deleteError) setError(deleteError.message)
    else await loadMessages(true)
  }

  const archiveChannel = async () => {
    if (!selected || !canManage(organizationRole)) return
    if (!window.confirm(`Archive “${selected.name}”?`)) return
    const { error: archiveError } = await supabase.from('communication_channels').update({ archived_at: new Date().toISOString() }).eq('id', selected.id)
    if (archiveError) setError(archiveError.message)
    else await loadChannels()
  }

  const SelectedIcon = selected ? iconFor(selected.icon_key) : MessageCircle

  return <div className="communication-workspace">
    <header className="money-trail-heading">
      <div><span className="rw-eyebrow">REACHWELL COMMUNICATION</span><h1>Communication</h1><p>Make team conversations feel like your organization.</p></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="rw-secondary-button" onClick={() => setShowPreferences(value => !value)}><Settings2 size={16}/> Preferences</button>
        <button className="rw-secondary-button" onClick={() => void loadChannels()} disabled={loading}><RefreshCw size={16}/> {loading ? 'Refreshing…' : 'Refresh'}</button>
        {canManage(organizationRole) && <button className="rw-primary-button" onClick={() => setShowCreate(value => !value)}><Plus size={16}/> New channel</button>}
      </div>
    </header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    {showPreferences && <div className="rw-card communication-customize-card">
      <div><span className="rw-eyebrow">MY COMMUNICATION</span><h2>Your chat experience</h2><p>These settings are personal and do not change the shared team identity.</p></div>
      <div className="communication-customize-grid">
        <label>Message density<select className="rw-input" value={preferences.density} onChange={event => void savePreferences({ ...preferences, density: event.target.value as UserPreferences['density'] })}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
        <label>Conversation startup<select className="rw-input" value={preferences.open_last_conversation ? 'last' : 'first'} onChange={event => void savePreferences({ ...preferences, open_last_conversation: event.target.value === 'last' })}><option value="last">Open my last/pinned conversation</option><option value="first">Open the first conversation</option></select></label>
      </div>
    </div>}
    {showCreate && canManage(organizationRole) && <div className="rw-card communication-customize-card">
      <div><span className="rw-eyebrow">CHANNEL SETUP</span><h2>Start with a ReachWell preset</h2><p>Use a native team identity, then personalize the name, color, and icon.</p></div>
      <div className="communication-preset-grid">{presets.map(preset => { const PresetIcon = iconFor(preset.icon_key); return <button key={preset.id ?? preset.name} className="communication-preset" onClick={() => applyPreset(preset)}><span className={`communication-color-dot ${preset.accent_color}`}><PresetIcon size={15}/></span><span><strong>{preset.name}</strong><small>{preset.description}</small></span></button> })}</div>
      <div className="communication-customize-grid">
        <label>Team / channel name<input className="rw-input" value={newName} onChange={event => setNewName(event.target.value)} placeholder="Channel name" /></label>
        <label>Description<input className="rw-input" value={newDescription} onChange={event => setNewDescription(event.target.value)} placeholder="What is this chat for?" /></label>
        <label>Team chat (optional)<select className="rw-input" value={newTeamId} onChange={event => setNewTeamId(event.target.value)}><option value="">Organization conversation</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
        <label>Color<select className="rw-input" value={newAccent} onChange={event => setNewAccent(event.target.value as Accent)}>{ACCENTS.map(accent => <option key={accent} value={accent}>{accent[0].toUpperCase() + accent.slice(1)}</option>)}</select></label>
        <label>Icon<select className="rw-input" value={newIcon} onChange={event => setNewIcon(event.target.value as IconKey)}>{ICONS.map(icon => <option key={icon} value={icon}>{icon.replaceAll('-', ' ')}</option>)}</select></label>
      </div>
      <button className="rw-primary-button" onClick={() => void createChannel()} disabled={!newName.trim()}>Create channel</button>
    </div>}
    <div className="communication-layout">
      <aside className="communication-channels">
        <div className="ops-search"><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search channels and messages" aria-label="Search communication" /></div>
        {filteredChannels.map(channel => { const ChannelIcon = iconFor(channel.icon_key); const pinned = preferences.pinned_channel_ids.includes(channel.id); return <div key={channel.id} style={{ display: 'flex', alignItems: 'stretch', gap: 4 }}><button className={channel.id === selectedId ? 'selected' : ''} onClick={() => setSelectedId(channel.id)} style={{ flex: 1 }}><span className={`communication-channel-icon ${channel.accent_color}`}><ChannelIcon size={16}/></span><span>{channel.name}<small>{channel.team_id ? `Team · ${teams.find(team => team.id === channel.team_id)?.name ?? 'Team'}` : channel.event_id ? 'Event' : channel.assignment_id ? 'Mission assignment' : 'Organization'}</small></span></button><button className="rw-icon-button" title={pinned ? 'Remove favorite' : 'Favorite conversation'} aria-label={pinned ? 'Remove favorite' : 'Favorite conversation'} onClick={() => void togglePinned(channel.id)}><Star size={14} fill={pinned ? 'currentColor' : 'none'} /></button></div> })}
        {!filteredChannels.length && <div className="rw-empty-state">No channels match your search.</div>}
      </aside>
      <section className="communication-thread">
        {selected ? <>
          <div className={`communication-thread-head ${selected.accent_color}`}>
            <div className="communication-thread-title"><span className={`communication-channel-icon large ${selected.accent_color}`}><SelectedIcon size={18}/></span><div><strong>{selected.name}</strong><small>{selected.description || 'Organization conversation'}</small></div></div>
            <div style={{ display: 'flex', gap: 8 }}>{canManage(organizationRole) && <button className="rw-secondary-button" onClick={openCustomization}><Settings2 size={15}/> Customize</button>}{canManage(organizationRole) && <button className="rw-secondary-button" onClick={() => void archiveChannel()}><Archive size={15}/> Archive</button>}</div>
          </div>
          {showCustomize && canManage(organizationRole) && <div className="communication-customize-inline"><div><strong>Personalize this team chat</strong><small>Admins and owners can change the shared team identity.</small></div><div className="communication-customize-grid"><label>Team / channel name<input className="rw-input" value={newName} onChange={event => setNewName(event.target.value)} /></label><label>Description<input className="rw-input" value={newDescription} onChange={event => setNewDescription(event.target.value)} /></label><label>Color<select className="rw-input" value={newAccent} onChange={event => setNewAccent(event.target.value as Accent)}>{ACCENTS.map(accent => <option key={accent} value={accent}>{accent[0].toUpperCase() + accent.slice(1)}</option>)}</select></label><label>Icon<select className="rw-input" value={newIcon} onChange={event => setNewIcon(event.target.value as IconKey)}>{ICONS.map(icon => <option key={icon} value={icon}>{icon.replaceAll('-', ' ')}</option>)}</select></label></div><div style={{ display:'flex', gap:8 }}><button className="rw-primary-button" onClick={() => void saveCustomization()}>Save changes</button><button className="rw-secondary-button" onClick={() => setShowCustomize(false)}>Cancel</button></div></div>}
          <div className="ops-message-list" aria-live="polite">{filteredMessages.map(item => <article className={`ops-message ${preferences.density === 'compact' ? 'compact' : ''}`} key={item.id}><div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><div><strong>{displayProfile(profiles[item.author_id ?? ''])}</strong><small style={{ display:'block' }}>{new Date(item.created_at).toLocaleString()}{item.edited_at ? ' · edited' : ''} {user && item.author_id === user.id && <CheckCheck size={13} aria-label="Your message" />}</small></div>{user && item.author_id === user.id && <div style={{ display:'flex', gap:4 }}><button className="rw-icon-button" title="Edit message" aria-label="Edit message" onClick={() => { setEditingId(item.id); setEditingBody(item.body) }}><Pencil size={14}/></button><button className="rw-icon-button" title="Delete message" aria-label="Delete message" onClick={() => void deleteMessage(item.id)}><Trash2 size={14}/></button></div>}</div>{editingId === item.id ? <div style={{ display:'flex', gap:8, marginTop:8 }}><input className="rw-input" value={editingBody} onChange={event => setEditingBody(event.target.value)} aria-label="Edit message" /><button className="rw-primary-button" onClick={() => void saveEdit()}>Save</button><button className="rw-secondary-button" onClick={() => setEditingId(null)}>Cancel</button></div> : <p>{item.body}</p>}</article>)}{!filteredMessages.length && <div className="rw-empty-state"><h2>No messages yet</h2><p>Start the conversation with this channel.</p></div>}</div>
          <div className="ops-composer"><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage() } }} placeholder="Write a message…" aria-label="Message" /><button className="rw-primary-button" onClick={() => void sendMessage()} disabled={!draft.trim() || sending}><Send size={15}/> {sending ? 'Sending…' : 'Send'}</button></div>
        </> : <div className="rw-empty-state"><MessageCircle size={28}/><h2>Select a channel</h2><p>Choose a conversation or create one if you have administration access.</p></div>}
      </section>
    </div>
  </div>
}
