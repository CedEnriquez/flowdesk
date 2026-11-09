import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { setUnauthorizedHandler } from '@/lib/http/client'
import { authApi } from './api'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'
import type { LoginCredentials, User } from './types'

/**
 * Holds the current user. The session itself lives in an HttpOnly cookie managed by the
 * backend; the frontend only asks "who am I?" (`/auth/me`) and never stores credentials or tokens.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const userRef = useRef<User | null>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  // Any 401 from the API (expired session, server restart) signs the user out locally.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (userRef.current) toast.error('Your session has expired. Please sign in again.')
      setUser(null)
      setStatus('anonymous')
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Restore an existing session on page load.
  useEffect(() => {
    const controller = new AbortController()
    authApi
      .me(controller.signal)
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setUser(null)
        setStatus('anonymous')
      })
    return () => controller.abort()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const me = await authApi.login(credentials)
    setUser(me)
    setStatus('authenticated')
    return me
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
