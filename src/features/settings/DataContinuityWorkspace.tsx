import { useEffect, useState } from 'react'
import { Download, FileArchive, RefreshCw, ShieldCheck } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type ExportRow = { id:string; export_type:string; format:string; status:string; created_at:string; completed_at:string|null; expires_at:string|null; error_message:string|null }
const canExport = (role:string|null) => role === 'owner' || role === 'admin' || role === 'director'

export function DataContinuityWorkspace() {
  const { organizationId, organizationRole } = useReachWellContext()
  const [rows,setRows] = useState<ExportRow[]>([])
  const [loading,setLoading] = useState(true)
  const [requesting,setRequesting] = useState(false)
  const [error,setError] = useState('')
  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    const { data,error:loadError } = await supabase.from('organization_exports').select('id,export_type,format,status,created_at,completed_at,expires_at,error_message').eq('organization_id',organizationId).order('created_at',{ascending:false}).limit(25)
    if (loadError) setError(loadError.message); else setRows((data??[]) as ExportRow[])
    setLoading(false)
  }
  useEffect(()=>{ void load() },[organizationId])
  const requestExport = async () => {
    if (!organizationId || !canExport(organizationRole) || requesting) return
    setRequesting(true); setError('')
    const { data:session } = await supabase.auth.getSession()
    const { error:insertError } = await supabase.from('organization_exports').insert({ organization_id:organizationId, requested_by:session.session?.user.id ?? null, export_type:'full_archive', format:'json', status:'requested', metadata:{ requested_from:'reachwell_settings' } })
    if (insertError) setError(insertError.message); else await load()
    setRequesting(false)
  }
  return <div className="rw-overview"><header className="money-trail-heading"><div><span className="rw-eyebrow">DATA & CONTINUITY</span><h1>Data Continuity</h1><p>Keep authorized organization exports visible and auditable. Export requests never expose data to another organization.</p></div><button className="rw-secondary-button" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/>{loading?'Refreshing…':'Refresh'}</button></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    <section className="rw-card" style={{display:'grid',gap:14}}><div style={{display:'flex',gap:12,alignItems:'flex-start'}}><ShieldCheck size={24}/><div><h2 style={{margin:'0 0 4px'}}>Authorized exports</h2><p style={{margin:0}}>Only organization leadership can request continuity exports. Export records are retained in the organization database for auditability.</p></div></div><button className="rw-primary-button" onClick={()=>void requestExport()} disabled={!canExport(organizationRole)||requesting}><FileArchive size={16}/>{requesting?'Requesting…':'Request full organization export'}</button>{!canExport(organizationRole)&&<small>Owner, admin, or director access is required.</small>}</section>
    <section className="rw-card" style={{marginTop:18}}><h2 style={{marginTop:0}}>Export history</h2>{!rows.length&&!loading?<div className="rw-empty-state"><Download size={24}/><h3>No exports requested</h3><p>When an authorized administrator requests an export, its status will appear here.</p></div>:<div style={{display:'grid',gap:8}}>{rows.map(row=><div key={row.id} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,padding:'12px 0',borderBottom:'1px solid rgba(80,60,120,.1)'}}><div><strong>{row.export_type.replaceAll('_',' ')}</strong><small style={{display:'block'}}>{new Date(row.created_at).toLocaleString()} · {row.format.toUpperCase()}</small>{row.error_message&&<small style={{display:'block'}}>{row.error_message}</small>}</div><span>{row.status}</span></div>)}</div>}</section>
  </div>
}
