import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthContext'
import { isAdmin } from '@/features/auth/permissions'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { FINAL_STATUSES, STATUS_LABELS } from '../constants'
import { useRequestActivity, useRequestDetail } from '../hooks'
import type { RequestDetail } from '../types'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { PriorityBadge, StatusBadge, TypeLabel } from '../components/Badges'
import { RequestActions } from '../components/RequestActions'

const backLink = (
  <Link to="/" className="text-sm font-medium text-indigo-700 hover:underline">
    ← Back to requests
  </Link>
)

export function RequestDetailPage() {
  const { id = '' } = useParams()
  const validId = /^\d+$/.test(id)

  if (!validId) {
    return (
      <div className="space-y-4">
        {backLink}
        <Alert title="Request not found">This request ID is not valid.</Alert>
      </div>
    )
  }
  return <RequestDetailView id={id} />
}

function RequestDetailView({ id }: { id: string }) {
  const detail = useRequestDetail(id)
  const activity = useRequestActivity(id)

  const reloadAll = () => {
    detail.reload()
    activity.reload()
  }

  if (!detail.data && detail.loading) return <PageSpinner label="Loading request…" />

  if (detail.error && !detail.data) {
    // 404 also covers "exists but belongs to someone else": the backend doesn't reveal which.
    const notFound = detail.error.status === 404 || detail.error.status === 403
    return (
      <div className="space-y-4">
        {backLink}
        <Alert
          title={notFound ? 'Request not found' : "Couldn't load this request"}
          action={!notFound && <Button size="sm" variant="secondary" onClick={detail.reload}>Retry</Button>}
        >
          {notFound ? "This request doesn't exist or you don't have access to it." : detail.error.message}
        </Alert>
      </div>
    )
  }

  const request = detail.data
  if (!request) return null

  return (
    <div className={cn('space-y-6 transition-opacity', detail.loading && 'opacity-60')}>
      {backLink}

      <div className="space-y-4 rounded-lg bg-white p-6 border-2 border-ink-900 shadow-hard-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Request #{request.id}</p>
            <h1 className="text-xl font-semibold break-words text-slate-900">{request.title}</h1>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Type"><TypeLabel type={request.type} /></Detail>
          <Detail label="Priority"><PriorityBadge priority={request.priority} /></Detail>
          <Detail label="Owner">{request.ownerName}</Detail>
          <Detail label="Submitted">{formatDateTime(request.createdAt)}</Detail>
        </dl>

        <div>
          <h2 className="text-sm font-medium text-slate-500">Description</h2>
          <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">{request.description}</p>
        </div>
      </div>

      <section className="space-y-3 rounded-lg bg-white p-6 border-2 border-ink-900 shadow-hard-sm">
        <h2 className="text-base font-semibold text-slate-900">Actions</h2>
        {request.availableActions.length > 0 ? (
          <RequestActions requestId={request.id} availableActions={request.availableActions} onChanged={reloadAll} />
        ) : (
          <p className="text-sm text-slate-500"><NoActionsReason request={request} /></p>
        )}
      </section>

      <section className="space-y-4 rounded-lg bg-white p-6 border-2 border-ink-900 shadow-hard-sm">
        <h2 className="text-base font-semibold text-slate-900">Activity history</h2>
        {activity.error ? (
          <Alert action={<Button size="sm" variant="secondary" onClick={activity.reload}>Retry</Button>}>
            {activity.error.message}
          </Alert>
        ) : !activity.data ? (
          <PageSpinner label="Loading history…" />
        ) : (
          <ActivityTimeline activities={activity.data} />
        )}
      </section>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-800">{children}</dd>
    </div>
  )
}

function NoActionsReason({ request }: { request: RequestDetail }) {
  const { user } = useAuth()
  if (FINAL_STATUSES.includes(request.status)) {
    return <>This request is {STATUS_LABELS[request.status].toLowerCase()}. It is final and can no longer change.</>
  }
  if (!isAdmin(user)) {
    return <>No actions available. An administrator will process this request.</>
  }
  return <>No actions are available for this request right now.</>
}
