import { http } from '@/lib/http/client'
import { unwrap, type ApiEnvelope } from '@/lib/http/envelope'
import type { LoginCredentials, User } from './types'

export const authApi = {
  me: (signal?: AbortSignal) => http.get<ApiEnvelope<User>>('/auth/me', { signal }).then(unwrap),

  login: (credentials: LoginCredentials) => http.post<ApiEnvelope<User>>('/auth/login', credentials).then(unwrap),

  logout: () => http.post<ApiEnvelope<null>>('/auth/logout').then(() => undefined),
}
