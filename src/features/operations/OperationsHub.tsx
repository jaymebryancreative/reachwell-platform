import { useEffect, useMemo, useState } from 'react'
import { Activity, BookOpen, Check, DollarSign, HeartPulse, MessageCircle, RefreshCw, Search, ShieldCheck, Upload, ExternalLink } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { createOrganizationFileUrl, uploadOrganizationFile } from '../../lib/resourceApi'
import { supabase } from '../../lib/supabaseClient'
import './operations.css'

type Section = 'relationships' | 'followups' | 'activity' | 'communication' | 'resources' | 'finance' | 'admin'
type LooseRow = Record<string, unknown>
type FinanceTotals = { income: number; expenses: number }
const titles: Record<Section, string> = { relationships: 'Relationship Health', followups: 'Follow-Up Center', activity: 'Unified Activity', communication: 'Team Communication', resources: 'Resource Center', finance: 'Giving & Finance', admin: 'Administration Center' }
const asText = (value: unknown) => typeof value === 'string' ? value : ''
const asNumber = (value: unknown) => typeof value === 'number' ? value : Number(value ?? 0)

export function OperationsHub({ section }: { section: Section }) {
  const { organizationId, user, organizationRole } = useReachWellContext()
  const [rows, setRows] = useState<LooseRow[]>([])
  const [channels, setChannels] = useState<LooseRow[]>([])
  const [channel, setChannel] = useState('')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    try {
      if (section === 'relationships') {
        const [people, followUps, needs, prayers] = await Promise.all([
          supabase.from('people').select('id,first_name,last_name,preferred_name').eq('organization_id', organizationId).eq('status', 'active').order('first_name'),
          supabase.from('follow_ups').select('person_id,household_id,title,due_at,priority,status').eq('organization_id', organizationId).neq('status', 'completed'),
          supabase.from('needs').select('person_id,household_id,title,urgency,status').eq('organization_id', organizationId).in('status', ['open', 'in_progress']),
          supabase.from('prayer_requests').select('person_id,household_id,request_text,status').eq('organization_id', organizationId).eq('status', 'active'),
        ])
        if (people.error || followUps.error || needs.error || prayers.error) throw people.error || followUps.error || needs.error || prayers.error
        const followRows = followUps.data ?? [], needRows = needs.data ?? [], prayerRows = prayers.data ?? []
        setRows((people.data ?? []).map(person => ({ person, followups: followRows.filter(item => item.person_id === person.id).length, needs: needRows.filter(item => item.person_id === person.id), prayers: prayerRows.filter(item => item.person_id === person.id).length })))
      } else if (section === 'followups') {
        const { data, error: loadError } = await supabase.from('follow_ups').select('id,title,description,due_at,priority,status,assigned_to,person_id,household_id,assignment_id,created_at').eq('organization_id', organizationId).neq('status', 'completed').order('due_at', { ascending: true, nullsFirst: false })
        if (loadError) throw loadError
        setRows(data ?? [])
      } else if (section === 'activity') {
        const { data, error: loadError } = await supabase.from('assignment_activity').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(100)
        if (loadError) throw loadError
        setRows(data ?? [])
      } else if (section === 'communication') {
        const { data, error: loadError } = await supabase.from('communication_channels').select('*').eq('organization_id', organizationId).is('archived_at', null).order('name')
        if (loadError) throw loadError
        setChannels(data ?? []); setChannel(current => current && data?.some(item => asText(item.id) === current) ? current : asText(data?.[0]?.id) || '')
      } else if (section === 'resources') {
        const { data, error: loadError } = await supabase.from('organization_files').select('id,file_name,folder,mime_type,size_bytes,storage_path,created_at,uploaded_by').eq('organization_id', organizationId).is('deleted_at', null).order('created_at', { ascending: false })
        if (loadError) throw loadError
        setRows(data ?? [])
      } else if (section === 'finance') {
        const { data, error: loadError } = await supabase.from('financial_transactions').select('id,transaction_type,amount,currency,transaction_date,payee_or_source,description,status,reference_number,entered_by,approved_by,approved_at').eq('organization_id', organizationId).order('transaction_date', { ascending: false }).limit(200)
        if (loadError) throw loadError
        setRows(data ?? [])
      } else {
        const [members, invitations] = await Promise.all([
          supabase.from('organization_members').select('id,user_id,role,status,joined_at,created_at').eq('organization_id', organizationId).order('role').order('created_at'),
          supabase.from('organization_invitations').select('id,email,role,team_id,status,expires_at,created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(50),
        ])
        if (members.error || invitations.error) throw members.error || invitations.error
        setRows([...(members.data ?? []).map(row => ({ ...row, record_type: 'member' })), ...(invitations.data ?? []).map(row => ({ ...row, record_type: 'invitation' }))])
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load workspace.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, section])
  const filtered = useMemo(() => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  const send = async () => {
    if (!channel || !user || !message.trim()) return
    const { error: sendError } = await supabase.from('communication_messages').insert({ channel_id: channel, author_id: user.id, body: message.trim() })
    if (sendError) setError(sendError.message); else setMessage('')
  }
  return <div className="ops-hub"><header className="ops-heading"><div><span className="rw-eyebrow">REACHWELL OPERATIONS</span><h1>{titles[section]}</h1><p>{section === 'relationships' ? 'See the people and households where a next step, need, or prayer deserves attention.' : section === 'followups' ? 'Prioritize overdue work, upcoming commitments, and the next action for every relationship.' : section === 'activity' ? 'A durable operational story that keeps field work accountable.' : section === 'communication' ? 'Keep conversations close to the teams, events, and assignments they support.' : section === 'resources' ? 'One searchable home for organizational knowledge and field resources.' : section === 'finance' ? 'A clear, accountable money trail with transaction status and source details.' : 'Manage organizational membership, invitations, and access visibility.'}</p></div><button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> {loading ? 'Refreshing…' : 'Refresh'}</button></header>{error && <div className="rw-context-alert" role="alert">{error}</div>}{section === 'communication' ? <Communication channels={channels} channel={channel} setChannel={setChannel} message={message} setMessage={setMessage} send={() => void send()} query={query} setQuery={setQuery} /> : section === 'resources' ? <ResourceCenter rows={rows} query={query} setQuery={setQuery} loading={loading} organizationId={organizationId} userId={user?.id ?? null} organizationRole={organizationRole} onReload={() => void load()} /> : section === 'finance' ? <FinanceWorkspace rows={rows} query={query} setQuery={setQuery} loading={loading} /> : <><div className="ops-toolbar"><div className="ops-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${titles[section].toLowerCase()}`} /></div><span className="ops-count">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</span></div><div className="ops-list">{loading && <div className="rw-empty-state">Loading…</div>}{!loading && filtered.map((row, index) => <OperationCard key={asText(row.id) || `${section}-${index}`} section={section} row={row} />)}{!loading && !filtered.length && <div className="rw-empty-state"><h2>Nothing here yet</h2><p>This workspace will fill as the organization uses ReachWell.</p></div>}</div></>}</div>
}
function OperationCard({ section, row }: { section: Section; row: LooseRow }) {
  if (section === 'relationships') { const person = (row.person ?? {}) as LooseRow, name = (asText(person.preferred_name) || `${asText(person.first_name)} ${asText(person.last_name)}`).trim(), needs = (row.needs as LooseRow[] | undefined) ?? []; return <article className={`ops-card ${needs.some(item => ['high', 'critical'].includes(asText(item.urgency))) ? 'urgent' : ''}`}><HeartPulse size={18} /><div><strong>{name || 'Unnamed person'}</strong><small>{needs.length} needs · {asNumber(row.prayers)} prayers · {asNumber(row.followups)} follow-ups</small>{needs.slice(0, 2).map(item => <span className="ops-inline-alert" key={`${asText(item.title)}-${asText(item.urgency)}`}>{asText(item.urgency)} · {asText(item.title)}</span>)}</div></article> }
  if (section === 'followups') return <article className="ops-card"><Check size={18} /><div><strong>{asText(row.title)}</strong><small>{row.due_at ? `Due ${new Date(asText(row.due_at)).toLocaleString()}` : 'No due date'} · {asText(row.priority)} · {asText(row.status)}</small><span className="ops-context-line">{asText(row.person_id) ? 'Connected to a person' : asText(row.household_id) ? 'Connected to a household' : asText(row.assignment_id) ? 'Created from field work' : 'Standalone follow-up'}</span></div></article>
  if (section === 'activity') return <article className="ops-card"><Activity size={18} /><div><strong>{asText(row.activity_type)}</strong><small>{new Date(asText(row.created_at)).toLocaleString()}</small><span className="ops-context-line">Assignment {asText(row.assignment_id).slice(0, 8)}</span></div></article>
  if (section === 'resources') return <article className="ops-card"><BookOpen size={18} /><div><strong>{asText(row.file_name)}</strong><small>{asText(row.folder) || 'General'} · {asText(row.mime_type) || 'File'}</small><span className="ops-context-line">{row.size_bytes ? `${Math.round(asNumber(row.size_bytes) / 1024)} KB` : 'Size unavailable'}</span></div></article>
  if (section === 'admin') return <article className="ops-card"><ShieldCheck size={18} /><div><strong>{asText(row.record_type) === 'invitation' ? asText(row.email) : asText(row.role)}</strong><small>{asText(row.status)} · {asText(row.record_type) === 'invitation' ? `Expires ${new Date(asText(row.expires_at)).toLocaleDateString()}` : `User ${asText(row.user_id).slice(0, 8)}`}</small><span className="ops-context-line">{asText(row.record_type) === 'invitation' ? `Invited as ${asText(row.role)}` : row.joined_at ? `Joined ${new Date(asText(row.joined_at)).toLocaleDateString()}` : 'Membership record'}</span></div></article>
  return <article className="ops-card"><ShieldCheck size={18} /><div><strong>{asText(row.role)}</strong><small>{asText(row.status)} · User {asText(row.user_id).slice(0, 8)}</small><span className="ops-context-line">{row.joined_at ? `Joined ${new Date(asText(row.joined_at)).toLocaleDateString()}` : 'Membership record'}</span></div></article>
}
function ResourceCenter({ rows, query, setQuery, loading, organizationId, userId, organizationRole, onReload }: { rows: LooseRow[]; query: string; setQuery: (value: string) => void; loading: boolean; organizationId: string | null; userId: string | null; organizationRole: string | null; onReload: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [folder, setFolder] = useState('General')
  const [uploading, setUploading] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const canUpload = ['owner', 'admin', 'director', 'coordinator', 'team_leader'].includes(organizationRole ?? '')
  const filtered = useMemo(() => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  const upload = async () => {
    if (!organizationId || !userId || !file) return
    setUploading(true); setResourceError('')
    try { await uploadOrganizationFile(organizationId, userId, file, folder); setFile(null); onReload() } catch (err) { setResourceError(err instanceof Error ? err.message : 'Unable to upload file.') } finally { setUploading(false) }
  }
  const openFile = async (path: string) => {
    try { const url = await createOrganizationFileUrl(path); window.open(url, '_blank', 'noopener,noreferrer') } catch (err) { setResourceError(err instanceof Error ? err.message : 'Unable to open file.') }
  }
  return <>
    <div className="ops-toolbar"><div className="ops-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search resource names, folders, and file types" /></div><span className="ops-count">{filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}</span></div>
    {canUpload && <div className="ops-card" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><Upload size={18} /><input type="file" onChange={event => setFile(event.target.files?.[0] ?? null)} accept=".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp" /><input value={folder} onChange={event => setFolder(event.target.value)} placeholder="Folder" aria-label="Resource folder" /><button className="rw-primary-button" onClick={() => void upload()} disabled={!file || uploading}>{uploading ? 'Uploading…' : 'Upload resource'}</button></div>}
    {resourceError && <div className="rw-context-alert" role="alert">{resourceError}</div>}
    <div className="ops-list">{loading && <div className="rw-empty-state">Loading resources…</div>}{!loading && filtered.map(row => <article className="ops-card" key={asText(row.id)}><BookOpen size={18} /><div style={{ flex: 1 }}><strong>{asText(row.file_name)}</strong><small>{asText(row.folder) || 'General'} · {asText(row.mime_type) || 'File'} · {row.size_bytes ? `${Math.round(asNumber(row.size_bytes) / 1024)} KB` : 'Size unavailable'}</small><span className="ops-context-line">Added {new Date(asText(row.created_at)).toLocaleString()}</span></div><button className="rw-secondary-button" onClick={() => void openFile(asText(row.storage_path))} disabled={!asText(row.storage_path)}><ExternalLink size={15} /> Open</button></article>)}{!loading && !filtered.length && <div className="rw-empty-state"><h2>No resources yet</h2><p>Upload handbooks, training, forms, images, and other organizational resources here.</p></div>}</div>
  </>
}
function FinanceWorkspace({ rows, query, setQuery, loading }: { rows: LooseRow[]; query: string; setQuery: (value: string) => void; loading: boolean }) {
  const totals = useMemo<FinanceTotals>(() => rows.reduce<FinanceTotals>((acc, row) => { const amount = asNumber(row.amount); const type = asText(row.transaction_type).toLowerCase(); if (type.includes('income') || type.includes('gift') || type.includes('donation') || type.includes('giving')) acc.income += amount; else if (type.includes('expense') || type.includes('payment')) acc.expenses += amount; return acc }, { income: 0, expenses: 0 }), [rows])
  const filtered = useMemo(() => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  return <><div className="ops-finance-summary"><div><span>Income / Giving</span><strong>{totals.income.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</strong></div><div><span>Expenses</span><strong>{totals.expenses.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</strong></div><div><span>Net</span><strong>{(totals.income - totals.expenses).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</strong></div><div><span>Records</span><strong>{rows.length}</strong></div></div><div className="ops-toolbar"><div className="ops-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search transactions, sources, references…" /></div><span className="ops-count">{filtered.length} records</span></div><div className="ops-list">{loading && <div className="rw-empty-state">Loading…</div>}{!loading && filtered.map(row => <article className="ops-card" key={asText(row.id)}><DollarSign size={18} /><div><strong>{asText(row.transaction_type)} · {asNumber(row.amount).toLocaleString(undefined, { style: 'currency', currency: asText(row.currency) || 'USD' })}</strong><small>{asText(row.payee_or_source) || asText(row.description) || 'No description'} · {asText(row.transaction_date)}</small><span className="ops-context-line">Status: {asText(row.status)}{asText(row.reference_number) ? ` · Ref ${asText(row.reference_number)}` : ''}{asText(row.entered_by) ? ` · Entered by ${asText(row.entered_by).slice(0, 8)}` : ''}{asText(row.approved_by) ? ' · Approved' : ''}</span></div></article>)}{!loading && !filtered.length && <div className="rw-empty-state"><h2>No matching transactions</h2><p>Try a source, reference number, status, or transaction type.</p></div>}</div></>
}
function Communication({ channels, channel, setChannel, message, setMessage, send, query, setQuery }: { channels: LooseRow[]; channel: string; setChannel: (value: string) => void; message: string; setMessage: (value: string) => void; send: () => void; query: string; setQuery: (value: string) => void }) { return <div className="ops-communication"><aside><div className="ops-channel-heading"><strong>Channels</strong><span>{channels.length}</span></div>{channels.map(item => <button key={asText(item.id)} className={channel === asText(item.id) ? 'selected' : ''} onClick={() => setChannel(asText(item.id))}><MessageCircle size={16} />{asText(item.name)}<small>{channelContext(item)}</small></button>)}{!channels.length && <p className="ops-muted">No channels yet.</p>}</aside><section><div className="ops-toolbar"><div className="ops-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this channel or all loaded messages" /></div></div><Messages channelId={channel} query={query} /><div className="ops-composer"><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Write to the team…" onKeyDown={event => { if (event.key === 'Enter') send() }} /><button className="rw-primary-button" onClick={send} disabled={!message.trim()}>Send</button></div></section></div> }
function channelContext(item: LooseRow) { if (asText(item.team_id)) return 'Team channel'; if (asText(item.event_id)) return 'Event channel'; if (asText(item.assignment_id)) return 'Mission assignment'; return asText(item.channel_type) || 'Organization channel' }
function Messages({ channelId, query }: { channelId: string; query: string }) { const [items, setItems] = useState<LooseRow[]>([]); const [error, setError] = useState(''); useEffect(() => { if (!channelId) { setItems([]); return } let active = true; const run = async () => { const { data, error: loadError } = await supabase.from('communication_messages').select('id,author_id,body,created_at').eq('channel_id', channelId).is('deleted_at', null).order('created_at', { ascending: true }); if (!active) return; if (loadError) setError(loadError.message); else { setError(''); setItems(data ?? []) } }; void run(); const realtime = supabase.channel(`reachwell-messages-${channelId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'communication_messages', filter: `channel_id=eq.${channelId}` }, () => { void run() }).subscribe(); return () => { active = false; void supabase.removeChannel(realtime) } }, [channelId]); const filtered = items.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())); return <div className="ops-message-list" aria-live="polite">{error && <div className="rw-context-alert">{error}</div>}{filtered.map(item => <div className="ops-message" key={asText(item.id)}><strong>{asText(item.author_id).slice(0, 8) || 'Member'}</strong><p>{asText(item.body)}</p><small>{new Date(asText(item.created_at)).toLocaleString()}</small></div>)}{!error && !filtered.length && <div className="ops-empty-inline">No matching messages.</div>}</div> }
