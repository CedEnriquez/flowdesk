import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '../AuthContext'

/** Route guard: only renders child routes for a signed-in user. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageSpinner label="Checking your session…" />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
