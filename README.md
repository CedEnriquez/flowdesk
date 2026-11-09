# FlowDesk — Frontend

React + TypeScript single-page app for **FlowDesk**, a request workflow & operations management system.
It talks to a separate **Spring Boot** REST API (session-cookie auth, PostgreSQL).

## Tech stack

| Concern | Choice |
|---|---|
| Build / dev server | Vite |
| UI | React 19 + TypeScript (strict) |
| Routing | React Router |
| HTTP | axios (single configured instance) |
| Forms & validation | react-hook-form + zod |
| Styling | Tailwind CSS v4 |
| Notifications | sonner |
| Tests | Vitest + React Testing Library |

## Getting started

```bash
npm install
cp .env.example .env.local   # then set VITE_API_BASE_URL
npm run dev                  # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm test` | Run the unit/component tests once |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | Lint with oxlint |
| `npm run typecheck` | TypeScript only |

### Configuration

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Spring Boot API, including `/api`. **Placeholder for now:** `http://localhost:8080/api`. |

The URL is read in exactly one place: [`src/config/env.ts`](src/config/env.ts).

## Project structure

```
src/
  app/                  App shell: providers + route table
  config/env.ts         Runtime config (API base URL placeholder)
  lib/
    http/client.ts      axios instance: credentials, CSRF header, 401 handling
    http/errors.ts      Normalizes every failure into one ApiError shape
    useAsyncData.ts     Small data-loading hook (loading / error / reload, abort on unmount)
    format.ts, cn.ts    Helpers
  components/
    ui/                 Reusable, feature-agnostic UI (Button, Alert, ConfirmDialog, …)
    layout/             App header + page container
  features/
    auth/               Session context, login page, route guards, role helpers
    requests/
      api.ts            Request endpoints (no "set status" call — only /transitions)
      hooks.ts          useRequestList / useRequestDetail / useRequestActivity / useStatusTransition
      types.ts          API contract types + enums
      constants.ts      Labels, colours, action presentation (ACTION_META)
      schemas.ts        zod schema for the create form
      components/       RequestList, RequestActions, ActivityTimeline, StatusFilter, …
      pages/            Dashboard, Request detail, New request
  pages/                Cross-feature pages (404)
```

**Why this structure:** code is grouped by feature (`auth`, `requests`) rather than by file type, so a new
workflow or domain can be added as a new folder without touching unrelated code. Each feature keeps its own
API calls, types and components; `components/ui` and `lib` hold only generic building blocks.

**Data flow:** page → feature hook → `requestsApi` → shared axios `http` instance → Spring Boot.
Every rejection is an `ApiError` (`status`, `code`, `message`, `fieldErrors`), so components handle one shape.

## Key design decisions

- **The backend is the source of truth for permissions.** The UI never decides which workflow actions a
  user can perform. Each request from the API includes `availableActions` (computed server-side from the
  user's role, ownership and the current status); the UI only renders those. `ACTION_META` controls
  labels, styling and confirmation dialogs — not authorization.
- **No identity in payloads.** The client never sends a user id, owner id or role. The backend derives
  the user from the session cookie.
- **Status only changes through `/transitions`.** There is no generic "update request" call, so the UI
  cannot bypass the workflow.
- **Confirmation before important actions.** Reject (reason required), Cancel and Mark fulfilled open a
  confirmation dialog. The rejection reason is validated client-side for fast feedback and server-side
  for enforcement; server validation errors are shown inside the dialog.
- **Duplicate-submit guard.** `useStatusTransition` ignores repeat clicks while a transition is in flight,
  and buttons are disabled meanwhile. Concurrency between different admins is the backend's job
  (optimistic locking → `409`); on `409`/`403`/`404` the UI shows the message and reloads the request.
- **Session handling.** Any `401` clears the local user and redirects to `/login`, preserving the page the
  user was on.
- **Filters in the URL.** `?status=…&page=…` survive refresh and can be shared.

## Backend API contract

Implemented by `flowdesk-be` (Spring Boot). All paths are relative to `VITE_API_BASE_URL`.

**Every response is wrapped in one envelope**, success or error:
`{ timestamp, status, code, message, data, fieldErrors[] }`. The frontend unwraps `data`
in one place ([`src/lib/http/envelope.ts`](src/lib/http/envelope.ts)).

### Auth (session cookie)
| Method | Path | Body | `data` |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `User` · `401` on bad credentials |
| POST | `/auth/logout` | — | `null` |
| GET | `/auth/me` | — | `User` · `401` if not signed in |

`User = { id, name, email, role: "REQUESTER" | "ADMIN" }`

### Requests
| Method | Path | Body / query | `data` |
|---|---|---|---|
| GET | `/requests` | `?status=&page=&size=` (page is 0-based) | `PageResponse<RequestSummary>` |
| GET | `/requests/{id}` | — | `RequestDetail` · `404` if missing **or not visible to the user** |
| GET | `/requests/{id}/activity` | — | `Activity[]` (chronological) |
| POST | `/requests` | `{ title, description, type, priority }` | `RequestDetail` (status `SUBMITTED`) |
| POST | `/requests/{id}/transitions` | `{ toStatus, comment? }` | `RequestDetail` |

```ts
RequestSummary  = { id, title, type, priority, status, ownerName, createdAt, updatedAt }
RequestDetail   = RequestSummary & { description, ownerEmail,
                    availableActions: { toStatus: Status, requiresComment: boolean }[] }
Activity        = { id, previousStatus: Status | null, newStatus, actorName, comment: string | null, createdAt }
PageResponse<T> = { items: T[], page, size, totalElements, totalPages }
Status          = SUBMITTED | IN_REVIEW | APPROVED | REJECTED | FULFILLED | CANCELLED
```

`availableActions` exists **only on the detail response** (computed server-side for the current user), so
actions are shown on the request detail page, not in the dashboard table.

### Errors
`400` validation (with `fieldErrors`) · `401` no session · `403` role not allowed or CSRF failure ·
`404` not found / not visible · `409` invalid transition or concurrent update.
Messages from `5xx` responses are never shown to users.

## Running with the backend

1. Start the backend (`flowdesk-be`: `./mvnw spring-boot:run`, needs PostgreSQL; see its README).
2. Set `VITE_API_BASE_URL` in `.env.local` to the backend's `/api` URL. If port 8080 is taken, run the
   backend on another port (`-Dspring-boot.run.arguments=--server.port=8081`) and use that here.
3. `npm run dev` and open http://localhost:5173 (the origin the backend's CORS allows).

Demo accounts (seeded by the backend): `admin@flowdesk.test / Admin123!`,
`alice@flowdesk.test` and `bob@flowdesk.test / Password123!`.

How the two sides fit together: CORS allows exactly one origin with credentials; the session lives in an
`HttpOnly` `JSESSIONID` cookie; CSRF uses the `XSRF-TOKEN` cookie that axios echoes as `X-XSRF-TOKEN`.
Cookies ignore ports, so `localhost:5173` and `localhost:8081` share cookies. Another local app on
`localhost` that uses the same cookie names (`JSESSIONID`, `XSRF-TOKEN`) can interfere; clear site data if
login behaves oddly.

## Testing

```bash
npm test                       # run all tests once (14)
npm run test:watch             # re-run on file changes
npx vitest run src/lib         # only the tests under one folder
npm run typecheck && npm run lint
```

The tests mock the API, so the backend does not need to be running.

| Test file | What it covers |
|---|---|
| `features/requests/components/RequestActions.test.tsx` | Only backend-allowed actions are rendered; no buttons on final states; **reject cannot be confirmed without a reason** (API not called); reason is trimmed and sent; comment optional when the backend doesn't require one; backend `400` shown inside the dialog; a `409` triggers a reload |
| `lib/http/errors.test.ts` | Backend error body → `ApiError` mapping, field errors kept, 5xx internals hidden, network errors |
| `features/requests/schemas.test.ts` | Create-form validation: required/trimmed title, unknown type/priority rejected |

**Manual end-to-end check (real browser + running backend):** sign-in/out and bad credentials; empty-form
validation; create a request; dashboard and status filter; admin start review → reject (dialog, reason
required) → final state; history persists after refresh; another requester can't see or open the request;
requester cancels own Submitted request; role-based UI (`Access denied` on `/requests/new` for admins);
no horizontal scroll at 390px. All passed against the live backend.

**Limitations:** the automated tests mock the API; the end-to-end run above was a throwaway script and is not
in the repo. Business rules are enforced and tested in the Spring Boot backend. With more time: commit a
Playwright suite for the requester → admin workflow, route-guard tests, and accessibility checks.

## Known limitations / next steps

- The API URL is a placeholder until the backend is wired up.
- Simplified auth: seeded accounts and a server session; no registration, password reset or SSO.
- The JS bundle is a single chunk (~550 kB); route-level code splitting (`React.lazy`) would reduce it.
- The dashboard table has no action buttons: the list endpoint doesn't return `availableActions`. Adding it to the summary response would allow row-level actions.
- No server-side search or sorting beyond the status filter.
- Data is not cached between pages; each page fetches fresh data (acceptable at this scale).
