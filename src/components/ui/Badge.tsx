import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap', className)}>
      {children}
    </span>
  )
}
