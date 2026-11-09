import type { ReactNode } from 'react'

export const inputClass =
  'block w-full rounded-md border-2 border-ink-900 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 outline-none ' +
  'focus:shadow-hard-sm focus:ring-2 focus:ring-lemon-500 aria-[invalid=true]:border-terra-600 disabled:bg-cream-200'

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-600" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}
