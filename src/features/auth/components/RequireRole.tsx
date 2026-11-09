import { Link, Outlet } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '../AuthContext'
import type { Role } from '../types'

/** Route guard for role-specific pages. The backend still enforces the same rule. */
export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return (
      <Alert
        title="Access denied"
        action={<Link to="/" className="text-sm font-medium underline">Back to requests</Link>}
      >
        Your role does not have permission to view this page.
      </Alert>
    )
  }
  return <Outlet />
}
