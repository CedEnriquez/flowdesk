import type { ButtonVariant } from '@/components/ui/Button'
import type { Priority, RequestStatus, RequestType } from './types'

export const PAGE_SIZE = 10
export const TITLE_MAX = 150
export const DESCRIPTION_MAX = 5000
export const COMMENT_MAX = 2000

export const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
}

export const STATUS_STYLES: Record<RequestStatus, string> = {
  SUBMITTED: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  IN_REVIEW: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  APPROVED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  FULFILLED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

/** Final states: no further transitions are possible (mirrors the backend workflow). */
export const FINAL_STATUSES: readonly RequestStatus[] = ['REJECTED', 'FULFILLED', 'CANCELLED']

export const TYPE_LABELS: Record<RequestType, string> = {
  GENERAL: 'General',
  SERVICE: 'Service',
  BOOKING: 'Booking',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-50 text-slate-600 ring-slate-500/20',
  MEDIUM: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  HIGH: 'bg-red-50 text-red-700 ring-red-600/30',
}

export interface ActionMeta {
  label: string
  variant: ButtonVariant
  successMessage: string
  /** Show a confirmation dialog before running. */
  confirm?: {
    title: string
    description: string
    confirmLabel: string
    /** When set, the dialog shows a comment box. Whether it is required comes from the backend. */
    commentLabel?: string
    commentPlaceholder?: string
  }
}

/**
 * How each transition is presented, keyed by TARGET status.
 * WHICH actions are available (and whether a comment is required) is decided by the backend
 * (`availableActions`); this table only controls labels, styling and confirmation UX.
 */
export const ACTION_META: Partial<Record<RequestStatus, ActionMeta>> = {
  IN_REVIEW: {
    label: 'Start review',
    variant: 'primary',
    successMessage: 'Request moved to In Review.',
  },
  APPROVED: {
    label: 'Approve',
    variant: 'success',
    successMessage: 'Request approved.',
  },
  REJECTED: {
    label: 'Reject',
    variant: 'danger',
    successMessage: 'Request rejected.',
    confirm: {
      title: 'Reject this request?',
      description: 'Rejection is final. The requester will see the reason you provide.',
      confirmLabel: 'Reject request',
      commentLabel: 'Rejection reason',
      commentPlaceholder: 'Explain why this request is rejected',
    },
  },
  FULFILLED: {
    label: 'Mark fulfilled',
    variant: 'success',
    successMessage: 'Request marked as fulfilled.',
    confirm: {
      title: 'Mark as fulfilled?',
      description: 'This completes the request. Fulfilled requests cannot be changed afterwards.',
      confirmLabel: 'Mark fulfilled',
      commentLabel: 'Fulfillment note',
    },
  },
  CANCELLED: {
    label: 'Cancel request',
    variant: 'danger',
    successMessage: 'Request cancelled.',
    confirm: {
      title: 'Cancel this request?',
      description: 'Cancelling withdraws your request. This cannot be undone.',
      confirmLabel: 'Cancel request',
      commentLabel: 'Reason',
    },
  },
}

/** Stable display order for action buttons. */
export const ACTION_ORDER: readonly RequestStatus[] = ['IN_REVIEW', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED']
