/**
 * Runtime configuration — the ONLY place the API URL lives.
 * Set VITE_API_BASE_URL (see `.env.example`). Production builds refuse to start without it,
 * so a missing variable can never silently point the app at the wrong backend.
 */
const DEV_FALLBACK_API_URL = 'http://localhost:8081/api'

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured
  if (import.meta.env.PROD) {
    throw new Error('VITE_API_BASE_URL is not set. Configure it before building for production.')
  }
  console.warn(`VITE_API_BASE_URL is not set; using ${DEV_FALLBACK_API_URL}`)
  return DEV_FALLBACK_API_URL
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  /** Request timeout for API calls, in milliseconds. */
  apiTimeoutMs: 15_000,
} as const
