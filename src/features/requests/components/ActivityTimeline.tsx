import { formatDateTime } from '@/lib/format'
import type { Activity } from '../types'
import { StatusBadge } from './Badges'

/** Read-only audit trail, oldest first. There is intentionally no edit/delete UI. */
export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">No activity recorded yet.</p>
  }

  // The backend already orders by time; sort defensively so the view is always chronological.
  const sorted = [...activities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id,
  )

  return (
    <ol className="relative space-y-5 border-l border-slate-200 pl-5">
      {sorted.map((activity) => (
        <li key={activity.id} className="relative">
          <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-lemon-500 border-2 border-ink-900 ring-4 ring-cream-100" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-900">{activity.actorName}</span>
            {activity.previousStatus ? (
              <>
                <span className="text-slate-500">changed status</span>
                <StatusBadge status={activity.previousStatus} />
                <span className="text-slate-400" aria-label="to">→</span>
                <StatusBadge status={activity.newStatus} />
              </>
            ) : (
              <>
                <span className="text-slate-500">created the request as</span>
                <StatusBadge status={activity.newStatus} />
              </>
            )}
          </div>
          <time dateTime={activity.createdAt} className="mt-0.5 block text-xs text-slate-500">
            {formatDateTime(activity.createdAt)}
          </time>
          {activity.comment && (
            <blockquote className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm whitespace-pre-wrap text-slate-700 border-2 border-ink-900 shadow-hard-sm">
              {activity.comment}
            </blockquote>
          )}
        </li>
      ))}
    </ol>
  )
}
