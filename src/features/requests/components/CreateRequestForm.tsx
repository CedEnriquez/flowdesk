import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField, inputClass } from '@/components/ui/FormField'
import { toApiError } from '@/lib/http/errors'
import { requestsApi } from '../api'
import { DESCRIPTION_MAX, PRIORITY_LABELS, TITLE_MAX, TYPE_LABELS } from '../constants'
import { createRequestSchema, type CreateRequestFormValues } from '../schemas'
import { PRIORITIES, REQUEST_TYPES } from '../types'

const FIELDS = ['title', 'description', 'type', 'priority'] as const

export function CreateRequestForm() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: { title: '', description: '', type: 'GENERAL', priority: 'MEDIUM' },
  })

  const onSubmit = async (values: CreateRequestFormValues) => {
    setFormError(null)
    try {
      const created = await requestsApi.create(values)
      toast.success('Request submitted.')
      navigate(`/requests/${created.id}`)
    } catch (error) {
      const apiError = toApiError(error)
      // Map backend Bean Validation errors onto the matching inputs.
      let mapped = false
      for (const fieldError of apiError.fieldErrors) {
        const field = FIELDS.find((name) => name === fieldError.field)
        if (field) {
          setError(field, { type: 'server', message: fieldError.message })
          mapped = true
        }
      }
      setFormError(mapped ? 'Please fix the highlighted fields.' : apiError.message)
    }
  }

  const describedBy = (field: (typeof FIELDS)[number]) => (errors[field] ? `${field}-error` : undefined)
  const descriptionLength = useWatch({ control, name: 'description' })?.length ?? 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-lg bg-white p-6 border-2 border-ink-900 shadow-hard-sm">
      {formError && <Alert>{formError}</Alert>}

      <FormField id="title" label="Title" required error={errors.title?.message}>
        <input
          id="title"
          type="text"
          maxLength={TITLE_MAX}
          aria-invalid={Boolean(errors.title) || undefined}
          aria-describedby={describedBy('title')}
          className={inputClass}
          {...register('title')}
        />
      </FormField>

      <FormField
        id="description"
        label="Description"
        required
        error={errors.description?.message}
        hint={`${descriptionLength}/${DESCRIPTION_MAX} characters`}
      >
        <textarea
          id="description"
          rows={6}
          maxLength={DESCRIPTION_MAX}
          aria-invalid={Boolean(errors.description) || undefined}
          aria-describedby={describedBy('description') ?? 'description-hint'}
          className={inputClass}
          {...register('description')}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="type" label="Request type" required error={errors.type?.message}>
          <select id="type" aria-invalid={Boolean(errors.type) || undefined} aria-describedby={describedBy('type')} className={inputClass} {...register('type')}>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>
        </FormField>

        <FormField id="priority" label="Priority" required error={errors.priority?.message}>
          <select id="priority" aria-invalid={Boolean(errors.priority) || undefined} aria-describedby={describedBy('priority')} className={inputClass} {...register('priority')}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{PRIORITY_LABELS[priority]}</option>
            ))}
          </select>
        </FormField>
      </div>

      <p className="text-xs text-slate-500">
        The submission date and owner are set automatically. New requests start as <strong>Submitted</strong>.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link to="/" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
