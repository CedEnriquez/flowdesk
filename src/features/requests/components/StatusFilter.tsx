import { cn } from '@/lib/cn'
import { STATUS_LABELS } from '../constants'
import { REQUEST_STATUSES, type RequestStatus } from '../types'

export function StatusFilter({
  value,
  onChange,
}: {
  value: RequestStatus | undefined
  onChange: (status: RequestStatus | undefined) => void
}) {
  const options: Array<{ value: RequestStatus | undefined; label: string }> = [
    { value: undefined, label: 'All' },
    ...REQUEST_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
  ]

  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-pill px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              active ? 'bg-ink-900 text-cream-100 ring-ink-900' : 'bg-white text-ink-700 ring-ink-200 hover:bg-cream-200',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
