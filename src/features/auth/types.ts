export const ROLES = ['REQUESTER', 'ADMIN'] as const
export type Role = (typeof ROLES)[number]

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface LoginCredentials {
  email: string
  password: string
}

export const ROLE_LABELS: Record<Role, string> = {
  REQUESTER: 'Requester',
  ADMIN: 'Administrator',
}
