import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-lemon-500 text-ink-900 border-2 border-ink-900 shadow-hard-sm hover:-translate-y-px hover:bg-lemon-600 focus-visible:outline-ink-900',
  secondary: 'bg-white text-ink-900 border-2 border-ink-900 shadow-hard-sm hover:-translate-y-px hover:bg-cream-200 focus-visible:outline-ink-900',
  success: 'bg-olive-600 text-white border-2 border-ink-900 shadow-hard-sm hover:-translate-y-px hover:bg-emerald-700 focus-visible:outline-ink-900',
  danger: 'bg-terra-600 text-white border-2 border-ink-900 shadow-hard-sm hover:-translate-y-px hover:bg-terra-700 focus-visible:outline-ink-900',
  ghost: 'text-ink-700 hover:bg-cream-200 focus-visible:outline-ink-900',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-all active:translate-x-px active:translate-y-px active:shadow-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner className="size-3.5" label="Working" />}
      {children}
    </button>
  )
}
