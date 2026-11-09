import axios from 'axios'
import { env } from '@/config/env'
import { toApiError } from './errors'

/**
 * Single axios instance for the whole app.
 *
 * - withCredentials: sends the Spring Security session cookie (JSESSIONID).
 * - withXSRFToken + XSRF names: reads the `XSRF-TOKEN` cookie issued by Spring's
 *   CookieCsrfTokenRepository and sends it back as `X-XSRF-TOKEN` on mutating requests.
 * - The client never sends the user id or role: the backend derives identity from the session.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { Accept: 'application/json' },
})

type UnauthorizedHandler = () => void
let unauthorizedHandler: UnauthorizedHandler | null = null

/** Registered by AuthProvider so any 401 drops the user back to the login screen. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Leave cancellations untouched so callers can ignore them.
    if (axios.isCancel(error)) return Promise.reject(error)

    const apiError = toApiError(error)
    if (apiError.status === 401) unauthorizedHandler?.()
    return Promise.reject(apiError)
  },
)
