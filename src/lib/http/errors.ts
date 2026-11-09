import axios from 'axios'

export interface FieldError {
  field: string
  message: string
}

/** Error body the Spring Boot API returns from its @RestControllerAdvice. */
export interface ApiErrorBody {
  timestamp?: string
  status?: number
  code?: string
  message?: string
  fieldErrors?: FieldError[]
}

/** Normalized error every API call rejects with, so the UI handles one shape. */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors: FieldError[]

  constructor(params: { status: number; message: string; code?: string; fieldErrors?: FieldError[] }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.fieldErrors = params.fieldErrors ?? []
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Some of the information you entered is invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  409: 'This action conflicts with the current state of the request. It may have been updated by someone else.',
}

/** 5xx codes whose message is written for end users and is safe to display. */
const USER_FACING_5XX_CODES = new Set(['FULFILLMENT_OUTCOME_UNKNOWN', 'FULFILLMENT_REJECTED'])

const SERVER_ERROR_MESSAGE = 'Something went wrong on the server. Please try again later.'

function isErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === 'object' && data !== null
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      return new ApiError({
        status: 0,
        code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: timedOut
          ? 'The server took too long to respond. Please try again.'
          : 'Cannot reach the server. Check your connection and try again.',
      })
    }

    const { status, data } = error.response
    const body = isErrorBody(data) ? data : undefined
    const fieldErrors = Array.isArray(body?.fieldErrors) ? body.fieldErrors : []

    // Never surface raw server-side messages for 5xx: they may leak internals.
    // Exception: codes the backend deliberately writes for users (e.g. "safe to retry").
    const message =
      status >= 500 && !USER_FACING_5XX_CODES.has(body?.code ?? '')
        ? SERVER_ERROR_MESSAGE
        : body?.message?.trim() || DEFAULT_MESSAGES[status] || 'The request could not be completed.'

    return new ApiError({ status, code: body?.code, message, fieldErrors })
  }

  return new ApiError({ status: 0, code: 'UNKNOWN', message: 'An unexpected error occurred.' })
}
