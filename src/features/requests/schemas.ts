import { z } from 'zod'
import { DESCRIPTION_MAX, TITLE_MAX } from './constants'
import { PRIORITIES, REQUEST_TYPES } from './types'

/**
 * Client-side validation for fast feedback. Mirrors the backend Bean Validation rules;
 * the server re-validates everything and its field errors are mapped back onto the form.
 */
export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer`),
  type: z.enum(REQUEST_TYPES, { error: 'Select a request type' }),
  priority: z.enum(PRIORITIES, { error: 'Select a priority' }),
})

export type CreateRequestFormValues = z.infer<typeof createRequestSchema>
