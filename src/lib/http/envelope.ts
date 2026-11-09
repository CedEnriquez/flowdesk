import type { AxiosResponse } from 'axios'
import type { FieldError } from './errors'

/** The wrapper the Spring Boot API puts around every successful response. */
export interface ApiEnvelope<T> {
  timestamp: string
  status: number
  code: string
  message: string
  data: T
  fieldErrors: FieldError[]
}

/** Use as `.then(unwrap)` to get the payload out of the envelope. */
export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data
}
