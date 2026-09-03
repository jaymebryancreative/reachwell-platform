import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, DollarSign, RefreshCw, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'
import { useReachWellContext } from '../../lib/reachwellContext'
import { supabase } from '../../lib/supabaseClient'
import './money-trail.css'

type Transaction = { id: string; transaction_type: string; amount: number | string; currency: string; transaction_date: string; payee_or_source: string | null; description: string | null; status: string; reference_number: string | null; entered_by: string | null; approved_by: string | null; approved_at: string | null }
type Profile = { id: string; full_name: string | null; first_name: string | null; last_name: string | null }
const nameFor = (profile?: Profile | undefined, id?: string | null) => profile ? profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'ReachWell member' : id ? `User ${id.slice(0, 8)}` : 'System / unavailable'
const amountFor = (row: Transaction) => Number(row.amount ?? 0)
const isIncome = (type: string) => type === 'income'
const isExpense = (type: string) => type === 'expense'
const money = (amount: number) => amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

export function MoneyTrailWorkspace() {
  const { organizationId } = useReachWellContext()
  const [rows, setRows] = useState<Transaction[]>([])
  const [previousRows, setPreviousRows] = useState<Transaction[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState<'30'|'90'|'365'>('30')
  const [error, setError] = useState('')
  const load = async () => {
    if (!organizationId) return
    setLoading(true); setError('')
    try {
      const days = Number(range)
      const end = new Date()
      const start = new Date(end.getTime() - days * 86400000)
      const previousStart = new Date(start.getTime() - days * 86400000)
      const previousEnd = new Date(start.getTime() - 1)
      const base = 'id,transaction_type,amount,currency,transaction_date,payee_or_source,description,status,reference_number,entered_by,approved_by,approved_at'
      const [currentResult, previousResult] = await Promise.all([
        supabase.from('financial_transactions').select(base).eq('organization_id', organizationId).gte('transaction_date', start.toISOString().slice(0, 10)).lte('transaction_date', end.toISOString().slice(0, 10)).order('transaction_date', { ascending: false }).limit(500),
        supabase.from('financial_transactions').select(base).eq('organization_id', organizationId).gte('transaction_date', previousStart.toISOString().slice(0, 10)).lte('transaction_date', previousEnd.toISOString().slice(0, 10)).order('transaction_date', { ascending: false }).limit(500),
      ])
      if (currentResult.error || previousResult.error) throw currentResult.error || previousResult.error
      const nextRows = (currentResult.data ?? []) as Transaction[]
      const priorRows = (previousResult.data ?? []) as Transaction[]
      setRows(nextRows); setPreviousRows(priorRows)
      const actorIds = [...new Set([...nextRows, ...priorRows].flatMap(row => [row.entered_by, row.approved_by]).filter((id): id is string => Boolean(id)))]
      if (actorIds.length) {
        const { data: actorRows, error: actorError } = await supabase.from('profiles').select('id,full_name,first_name,last_name').in('id', actorIds)
        if (actorError) throw actorError
        setProfiles(Object.fromEntries(((actorRows ?? []) as Profile[]).map(profile => [profile.id, profile])))
      } else setProfiles({})
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load the money trail.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [organizationId, range])
  const summarize = (items: Transaction[]) => items.reduce((acc, row) => { const amount = amountFor(row); if (isIncome(row.transaction_type)) acc.income += amount; if (isExpense(row.transaction_type)) acc.expenses += amount; return acc }, { income: 0, expenses: 0 })
  const summary = useMemo(() => summarize(rows), [rows])
  const previous = useMemo(() => summarize(previousRows), [previousRows])
  const net = summary.income - summary.expenses
  const previousNet = previous.income - previous.expenses
  const delta = net - previousNet
  const trendPositive = delta >= 0
  const pending = rows.filter(row => ['draft','pending_approval'].includes(row.status)).length
  const approved = rows.filter(row => ['approved','posted'].includes(row.status)).length

  return <div className="money-trail"><header className="money-trail-heading"><div><span className="rw-eyebrow">GIVING & FINANCE</span><h1>Money Trail</h1><p>Follow every recorded transaction from source to approval, with a clear view of what came in, what went out, and who handled it.</p></div><div className="money-trail-actions"><select value={range} onChange={event => setRange(event.target.value as '30'|'90'|'365')} aria-label="Money trail date range"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option></select><button className="rw-secondary-button" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> {loading ? 'Refreshing…' : 'Refresh'}</button></div></header>{error && <div className="rw-context-alert" role="alert">{error}</div>}<div className="money-trail-summary"><div><span>Income / giving</span><strong>{money(summary.income)}</strong><small><ArrowUpRight size={14} /> recorded inflow</small></div><div><span>Expenses</span><strong>{money(summary.expenses)}</strong><small><ArrowDownRight size={14} /> recorded outflow</small></div><div><span>Net movement</span><strong>{money(net)}</strong><small className={trendPositive ? 'money-trend-up' : 'money-trend-down'}>{trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {money(Math.abs(delta))} vs previous period</small></div><div><span>Approval state</span><strong>{pending}</strong><small>{approved} approved / posted records</small></div></div><div className="money-trail-list">{loading && <div className="rw-empty-state">Loading the money trail…</div>}{!loading && rows.map(row => <article className="money-trail-row" key={row.id}><div className={`money-type ${isExpense(row.transaction_type) ? 'expense' : isIncome(row.transaction_type) ? 'income' : 'other'}`}><DollarSign size={17} /></div><div className="money-main"><strong>{row.payee_or_source || row.description || row.transaction_type}</strong><span>{row.transaction_type} · {row.status} · {row.transaction_date}{row.reference_number ? ` · Ref ${row.reference_number}` : ''}</span><small>Entered by {nameFor(profiles[row.entered_by || ''], row.entered_by)}{row.approved_by ? ` · Approved by ${nameFor(profiles[row.approved_by], row.approved_by)}` : ' · Awaiting approval'}</small></div><strong className={`money-amount ${isExpense(row.transaction_type) ? 'expense' : 'income'}`}>{isExpense(row.transaction_type) ? '−' : isIncome(row.transaction_type) ? '+' : ''}{money(amountFor(row))}</strong></article>)}{!loading && !rows.length && <div className="rw-empty-state"><ShieldCheck size={28} /><h2>No financial records in this period</h2><p>When transactions are recorded, this view will preserve the accountability trail without exposing unrelated organizations.</p></div>}</div></div>
}
