import type { User } from './types'

/**
 * UI-only permission helpers: they decide what to SHOW.
 * The Spring Boot API is the source of truth and enforces every rule server-side.
 * Per-request actions come from the backend's `availableActions`, not from here.
 */
export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'ADMIN'

export const canCreateRequest = (user: User | null | undefined): boolean => user?.role === 'REQUESTER'
