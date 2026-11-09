import { cn } from '@/lib/cn'

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)} />
  )
}

export function PageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner className="size-5" label={label} />
      <span>{label}</span>
    </div>
  )
}
