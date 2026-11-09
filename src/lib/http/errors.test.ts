import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from './errors'

function axiosErrorWith(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() }
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response)
}

describe('toApiError', () => {
  it('keeps the backend message, code and field errors for 4xx responses', () => {
    const error = toApiError(
      axiosErrorWith(400, {
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: [{ field: 'comment', message: 'A rejection reason is required' }],
      }),
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.code).toBe('VALIDATION_FAILED')
    expect(error.message).toBe('Validation failed')
    expect(error.fieldErrors).toEqual([{ field: 'comment', message: 'A rejection reason is required' }])
  })

  it('hides server internals for 5xx responses', () => {
    const error = toApiError(axiosErrorWith(500, { message: 'NullPointerException at RequestService.java:42' }))
    expect(error.message).not.toContain('NullPointerException')
  })

  it('falls back to a friendly message when the body has none', () => {
    expect(toApiError(axiosErrorWith(403, '')).message).toMatch(/permission/i)
  })

  it('reports network failures with status 0', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'))
    expect(error.status).toBe(0)
    expect(error.isNetworkError).toBe(true)
  })
})
