import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/format'
import type { RequestSummary } from '../types'
import { PriorityBadge, StatusBadge, TypeLabel } from './Badges'

interface RequestListProps {
  requests: RequestSummary[]
}

/**
 * Table on desktop, stacked cards on small screens.
 * The list endpoint doesn't return per-request actions, so those live on the detail page.
 */
export function RequestList({ requests }: RequestListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg bg-white border-2 border-ink-900 shadow-hard-sm md:block">
        <table className="min-w-full divide-y divide-ink-200 text-sm">
          <thead className="bg-cream-200 text-left text-xs font-bold tracking-wider text-ink-700 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Title</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Owner</th>
              <th scope="col" className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.id} className="align-middle hover:bg-slate-50">
                <td className="max-w-xs px-4 py-3">
                  <Link to={`/requests/${request.id}`} className="block truncate font-medium text-indigo-700 hover:underline">
                    {request.title}
                  </Link>
                </td>
                <td className="px-4 py-3"><TypeLabel type={request.type} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={request.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                <td className="px-4 py-3 text-slate-700">{request.ownerName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(request.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {requests.map((request) => (
          <li key={request.id} className="space-y-3 rounded-lg bg-white p-4 border-2 border-ink-900 shadow-hard-sm">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/requests/${request.id}`} className="min-w-0 font-medium break-words text-indigo-700 hover:underline">
                {request.title}
              </Link>
              <StatusBadge status={request.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <TypeLabel type={request.type} />
              <PriorityBadge priority={request.priority} />
              <span>{request.ownerName}</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
