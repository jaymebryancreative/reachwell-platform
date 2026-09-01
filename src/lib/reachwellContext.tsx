import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type OrganizationMembership = {
  organization_id: string
  role: string
  status: string
  organization: { id: string; name: string; slug: string; active: boolean } | null
}

type ReachWellContextValue = {
  session: Session | null
  user: User | null
  organizationId: string | null
  organizationName: string | null
  organizationRole: string | null
  loading: boolean
  error: string | null
}

const ReachWellContext = createContext<ReachWellContextValue | undefined>(undefined)

export function ReachWellProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [membership, setMembership] = useState<OrganizationMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadMembership = async (nextSession: Session | null) => {
      if (!nextSession?.user) {
        if (mounted) {
          setMembership(null)
          setError(null)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)
      const { data, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, role, status, organization:organizations(id, name, slug, active)')
        .eq('user_id', nextSession.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!mounted) return
      if (membershipError) {
        setMembership(null)
        setError(membershipError.message)
      } else {
        setMembership(data as OrganizationMembership | null)
      }
      setLoading(false)
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      void loadMembership(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      void loadMembership(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<ReachWellContextValue>(() => ({
    session,
    user: session?.user ?? null,
    organizationId: membership?.organization_id ?? null,
    organizationName: membership?.organization?.name ?? null,
    organizationRole: membership?.role ?? null,
    loading,
    error,
  }), [session, membership, loading, error])

  return <ReachWellContext.Provider value={value}>{children}</ReachWellContext.Provider>
}

export function useReachWellContext() {
  const context = useContext(ReachWellContext)
  if (!context) throw new Error('useReachWellContext must be used inside ReachWellProvider')
  return context
}
