import { cn } from '@/lib/cn'

/** Text-only FlowDesk logo: a lemon "fold" mark followed by the name. */
export function Wordmark({ className, size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  const lg = size === 'lg'
  return (
    <span className={cn('inline-flex items-center gap-2 font-display font-black tracking-tight text-ink-900', lg ? 'text-4xl' : 'text-xl', className)}>
      <span
        aria-hidden="true"
        className={cn('inline-block rounded-sm border-2 border-ink-900 bg-lemon-500 shadow-hard-sm', lg ? 'size-7' : 'size-5')}
        style={{ clipPath: 'polygon(0 0, 70% 0, 100% 30%, 100% 100%, 0 100%)' }}
      />
      <span>
        Flow<span className="text-terra-600">Desk</span>
      </span>
    </span>
  )
}
