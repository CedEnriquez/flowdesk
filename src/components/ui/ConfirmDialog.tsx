import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button, type ButtonVariant } from './Button'
import { inputClass } from './FormField'

export interface ConfirmDialogComment {
  label: string
  required: boolean
  placeholder?: string
  maxLength?: number
}

/**
 * Confirmation modal. Render it only while it should be visible (mount = open),
 * so its internal state starts fresh every time.
 */
export interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: ButtonVariant
  /** When set, the dialog asks for a comment (e.g. a rejection reason). */
  comment?: ConfirmDialogComment
  loading?: boolean
  /** Error returned by the server, shown inside the dialog. */
  error?: string | null
  onConfirm: (comment: string) => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  comment,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const commentId = useId()
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Remember what opened the dialog and give focus back to it on close.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return () => opener?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onCancel()
        return
      }
      // Keep Tab / Shift+Tab inside the dialog.
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [loading, onCancel])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (comment?.required && !trimmed) {
      setValidationError(`${comment.label} is required.`)
      return
    }
    onConfirm(trimmed)
  }

  const shownError = validationError ?? error

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-4 sm:items-center">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border-2 border-ink-900 bg-white shadow-hard"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-3 p-5">
            <h2 id={titleId} className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{description}</p>

            {comment && (
              <div className="space-y-1.5">
                <label htmlFor={commentId} className="block text-sm font-medium text-slate-700">
                  {comment.label}
                  {comment.required ? <span className="ml-0.5 text-rose-600">*</span> : <span className="ml-1 text-slate-400">(optional)</span>}
                </label>
                <textarea
                  autoFocus
                  id={commentId}
                  rows={3}
                  value={value}
                  maxLength={comment.maxLength}
                  placeholder={comment.placeholder}
                  aria-invalid={Boolean(validationError) || undefined}
                  onChange={(event) => {
                    setValue(event.target.value)
                    if (validationError) setValidationError(null)
                  }}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            )}

            {shownError && (
              <p role="alert" className="text-sm text-rose-600">{shownError}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:justify-end rounded-b-lg">
            <Button variant="secondary" onClick={onCancel} disabled={loading} autoFocus={!comment}>
              Go back
            </Button>
            <Button type="submit" variant={confirmVariant} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
