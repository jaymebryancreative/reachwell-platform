import { AppShell } from '../../app/AppShell'
import { useReachWellContext } from '../../lib/reachwellContext'
import { OrganizationAccessState } from './OrganizationAccessState'

export function WorkspaceGate() {
  const { session, organizationId, loading, error } = useReachWellContext()

  if (!session) return null
  if (loading && !organizationId) return <div className="rw-auth-loading"><div className="rw-auth-mark">R</div><strong>Opening ReachWell</strong><span>Loading your workspace…</span></div>
  if (!organizationId || error) return <OrganizationAccessState />
  return <AppShell />
}
