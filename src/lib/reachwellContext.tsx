import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type WorkspaceLookup = {
  organization_id: string
  role: string
  status: string
  organization_name: string
  organization_slug: string
  organization_active: boolean
}

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
  refreshWorkspace: () => Promise<void>
}

const ReachWellContext = createContext<ReachWellContextValue | undefined>(undefined)

function readableError(error: unknown) {
  return error instanceof Error && error.message ? error.message : 'ReachWell could not complete that request. Please try again.'
}

export function ReachWellProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [membership, setMembership] = useState<OrganizationMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const requestRef = useRef(0)

  const loadWorkspace = async (nextSession: Session | null) => {
    const requestId = ++requestRef.current
    if (!nextSession?.user) {
      if (mountedRef.current && requestId === requestRef.current) {
        setMembership(null)
        setError(null)
        setLoading(false)
      }
      return
    }

    if (mountedRef.current) {
      setLoading(true)
      setError(null)
    }

    try {
      const { data, error: workspaceError } = await supabase
        .rpc('current_organization_membership')
        .maybeSingle()

      const workspace = data as WorkspaceLookup | null

      if (workspaceError) throw workspaceError
      if (!mountedRef.current || requestId !== requestRef.current) return

      if (!workspace) {
        setMembership(null)
        setError(null)
        return
      }

      setMembership({
        organization_id: workspace.organization_id,
        role: workspace.role,
        status: workspace.status,
        organization: {
          id: workspace.organization_id,
          name: workspace.organization_name,
          slug: workspace.organization_slug,
          active: workspace.organization_active,
        },
      })
      setError(null)
    } catch (workspaceError) {
      if (!mountedRef.current || requestId !== requestRef.current) return
      setMembership(null)
      setError(readableError(workspaceError))
    } finally {
      if (mountedRef.current && requestId === requestRef.current) setLoading(false)
    }
  }

  const refreshWorkspace = async () => {
    setLoading(true)
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!mountedRef.current) return
      setSession(data.session)
      await loadWorkspace(data.session)
    } catch (sessionError) {
      if (!mountedRef.current) return
      setSession(null)
      setMembership(null)
      setError(readableError(sessionError))
      setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    void refreshWorkspace()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mountedRef.current) return
      setSession(nextSession)
      window.setTimeout(() => {
        if (mountedRef.current) void loadWorkspace(nextSession)
      }, 0)
    })

    return () => {
      mountedRef.current = false
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
    refreshWorkspace,
  }), [session, membership, loading, error])

  return <ReachWellContext.Provider value={value}>{children}</ReachWellContext.Provider>
}

export function useReachWellContext() {
  const context = useContext(ReachWellContext)
  if (!context) throw new Error('useReachWellContext must be used inside ReachWellProvider')
  return context
}
