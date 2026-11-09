import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/AuthContext'
import { canCreateRequest } from '@/features/auth/permissions'
import { ROLE_LABELS } from '@/features/auth/types'
import { Wordmark } from '@/components/ui/Wordmark'
import { cn } from '@/lib/cn'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-colors', isActive ? 'bg-ink-900 text-cream-100' : 'text-ink-700 hover:bg-cream-200')

export function AppLayout() {
  const { user, logout } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      toast.success('Signed out.')
    } catch {
      // The local session is cleared regardless; nothing else to do.
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b-2 border-ink-900 bg-cream-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="FlowDesk home"><Wordmark /></Link>
            <nav className="flex gap-1">
              <NavLink to="/" end className={navClass}>Requests</NavLink>
              {canCreateRequest(user) && <NavLink to="/requests/new" className={navClass}>New request</NavLink>}
            </nav>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right text-sm leading-tight">
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
              </div>
              <Button variant="secondary" size="sm" loading={signingOut} onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
