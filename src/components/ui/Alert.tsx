import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'error' | 'warning' | 'info'

const TONES: Record<Tone, string> = {
  error: 'border-terra-600 bg-terra-100 text-terra-700',
  warning: 'border-lemon-600 bg-lemon-100 text-ink-900',
  info: 'border-ink-200 bg-cream-200 text-ink-700',
}

export function Alert({
  tone = 'error',
  title,
  children,
  action,
}: {
  tone?: Tone
  title?: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-md border-2 p-4 text-sm', TONES[tone])}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={cn(title && 'mt-1')}>{children}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
