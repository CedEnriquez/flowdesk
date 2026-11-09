import { Link, useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthContext'
import { canCreateRequest, isAdmin } from '@/features/auth/permissions'
import { cn } from '@/lib/cn'
import { PAGE_SIZE, STATUS_LABELS } from '../constants'
import { useRequestList } from '../hooks'
import { REQUEST_STATUSES, type RequestStatus } from '../types'
import { Pagination } from '../components/Pagination'
import { RequestList } from '../components/RequestList'
import { StatusFilter } from '../components/StatusFilter'

function parseStatus(value: string | null): RequestStatus | undefined {
  return REQUEST_STATUSES.find((status) => status === value)
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 0
}

export function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter + page live in the URL so they survive refresh and can be shared.
  const status = parseStatus(searchParams.get('status'))
  const page = parsePage(searchParams.get('page'))

  const { data, error, loading, reload } = useRequestList({ status, page, size: PAGE_SIZE })

  const updateParams = (next: { status?: RequestStatus; page?: number }) => {
    const params = new URLSearchParams()
    if (next.status) params.set('status', next.status)
    if (next.page) params.set('page', String(next.page))
    setSearchParams(params)
  }

  const admin = isAdmin(user)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">{admin ? 'All requests' : 'My requests'}</h1>
          <p className="text-sm text-slate-500">
            {admin ? 'Review, approve and fulfill requests from all users.' : 'Track the requests you have submitted.'}
          </p>
        </div>
        {canCreateRequest(user) && (
          <Link
            to="/requests/new"
            className="inline-flex items-center justify-center rounded-md border-2 border-ink-900 bg-lemon-500 px-4 py-2 text-sm font-semibold text-ink-900 shadow-hard-sm transition-all hover:-translate-y-px hover:bg-lemon-600"
          >
            New request
          </Link>
        )}
      </div>

      <StatusFilter value={status} onChange={(next) => updateParams({ status: next })} />

      {error && (
        <Alert title="Couldn't load requests" action={<Button size="sm" variant="secondary" onClick={reload}>Retry</Button>}>
          {error.message}
        </Alert>
      )}

      {!data && loading && <PageSpinner label="Loading requests…" />}

      {data && (
        <div className={cn('space-y-4 transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
          {data.items.length === 0 ? (
            <div className="rounded-lg bg-white px-6 py-12 text-center border-2 border-ink-900 shadow-hard-sm">
              <p className="font-medium text-slate-700">
                {status ? `No ${STATUS_LABELS[status].toLowerCase()} requests.` : 'No requests yet.'}
              </p>
              {canCreateRequest(user) && !status && (
                <Link to="/requests/new" className="mt-2 inline-block text-sm font-medium text-indigo-700 hover:underline">
                  Create your first request
                </Link>
              )}
            </div>
          ) : (
            <RequestList requests={data.items} />
          )}

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={(next) => updateParams({ status, page: next })}
          />
        </div>
      )}
    </div>
  )
}
