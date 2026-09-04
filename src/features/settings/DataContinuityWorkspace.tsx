import { useEffect, useState } from 'react'
import { CheckCircle2, Download, FileArchive, RefreshCw, ShieldCheck } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'

type ExportRow = { id:string; export_type:string; format:string; status:string; created_at:string; completed_at:string|null; expires_at:string|null; error_message:string|null }
const canExport = (role:string|null) => role === 'owner' || role === 'admin' || role === 'director'

export function DataContinuityWorkspace() {
  const { organizationId, organizationRole } = useReachWellContext()
  const [rows,setRows] = useState<ExportRow[]>([])
  const [loading,setLoading] = useState(true)
  const [exporting,setExporting] = useState(false)
  const [error,setError] = useState('')
  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    const { data,error:loadError } = await supabase.from('organization_exports').select('id,export_type,format,status,created_at,completed_at,expires_at,error_message').eq('organization_id',organizationId).order('created_at',{ascending:false}).limit(25)
    if (loadError) setError(loadError.message); else setRows((data??[]) as ExportRow[])
    setLoading(false)
  }
  useEffect(()=>{ void load() },[organizationId])
  const exportNow = async () => {
    if (!organizationId || !canExport(organizationRole) || exporting) return
    setExporting(true); setError('')
    try {
      const { data, error:rpcError } = await supabase.rpc('export_organization_data', { p_organization_id: organizationId })
      if (rpcError) throw rpcError
      const blob = new Blob([JSON.stringify(data ?? {}, null, 2)], { type:'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `reachwell-${organizationId}-export-${new Date().toISOString().replaceAll(':','-')}.json`
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url)
      const { data:session } = await supabase.auth.getSession()
      await supabase.from('organization_exports').insert({ organization_id:organizationId, requested_by:session.session?.user.id ?? null, export_type:'full_archive', format:'json', status:'completed', completed_at:new Date().toISOString(), metadata:{ exported_from:'reachwell_settings', delivery:'browser_download' } })
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Export failed. No organization data was downloaded.') }
    finally { setExporting(false) }
  }
  return <div className="rw-overview"><header className="money-trail-heading"><div><span className="rw-eyebrow">DATA & CONTINUITY</span><h1>Data Continuity</h1><p>Download an authorized organization export and keep an auditable record of each export.</p></div><button className="rw-secondary-button" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/>{loading?'Refreshing…':'Refresh'}</button></header>
    {error && <div className="rw-context-alert" role="alert">{error}</div>}
    <section className="rw-card" style={{display:'grid',gap:14}}><div style={{display:'flex',gap:12,alignItems:'flex-start'}}><ShieldCheck size={24}/><div><h2 style={{margin:'0 0 4px'}}>Authorized export</h2><p style={{margin:0}}>Owner, admin, or director access is required. The export is generated only after the server verifies the caller's active organization role.</p></div></div><button className="rw-primary-button" onClick={()=>void exportNow()} disabled={!canExport(organizationRole)||exporting}><FileArchive size={16}/>{exporting?'Preparing export…':'Download full organization export'}</button>{!canExport(organizationRole)&&<small>Owner, admin, or director access is required.</small>}</section>
    <section className="rw-card" style={{marginTop:18}}><h2 style={{marginTop:0}}>Export history</h2>{!rows.length&&!loading?<div className="rw-empty-state"><Download size={24}/><h3>No exports yet</h3><p>Completed downloads will appear here for auditability.</p></div>:<div style={{display:'grid',gap:8}}>{rows.map(row=><div key={row.id} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,padding:'12px 0',borderBottom:'1px solid rgba(80,60,120,.1)'}}><div><strong>{row.export_type.replaceAll('_',' ')}</strong><small style={{display:'block'}}>{new Date(row.created_at).toLocaleString()} · {row.format.toUpperCase()}</small>{row.error_message&&<small style={{display:'block'}}>{row.error_message}</small>}</div><span style={{display:'inline-flex',alignItems:'center',gap:5}}>{row.status==='completed'&&<CheckCircle2 size={15}/>} {row.status}</span></div>)}</div>}</section>
  </div>
}
