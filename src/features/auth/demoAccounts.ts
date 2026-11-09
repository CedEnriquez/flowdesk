/**
 * Seeded demo accounts (created by the backend when `app.seed.enabled=true`).
 * Shown on the login page so evaluators can switch roles quickly.
 * Keep in sync with the backend DataSeeder. Local-only throwaway credentials.
 */
export const DEMO_ACCOUNTS = [
  { label: 'Requester (Alice)', email: 'alice@flowdesk.test', password: 'Password123!' },
  { label: 'Requester (Bob)', email: 'bob@flowdesk.test', password: 'Password123!' },
  { label: 'Administrator', email: 'admin@flowdesk.test', password: 'Admin123!' },
] as const
