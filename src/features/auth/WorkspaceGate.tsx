import { AppShell } from '../../app/AppShell'
import { useReachWellContext } from '../../lib/reachwellContext'
import { OrganizationAccessState } from './OrganizationAccessState'

export function WorkspaceGate() {
  const { session, organizationId, loading, error } = useReachWellContext()

  if (!session || loading) return null
  if (!organizationId || error) return <OrganizationAccessState />
  return <AppShell />
}
