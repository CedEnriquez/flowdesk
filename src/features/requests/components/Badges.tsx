import { Badge } from '@/components/ui/Badge'
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES, TYPE_LABELS } from '../constants'
import type { Priority, RequestStatus, RequestType } from '../types'

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}

export function TypeLabel({ type }: { type: RequestType }) {
  return <span className="text-slate-700">{TYPE_LABELS[type]}</span>
}
