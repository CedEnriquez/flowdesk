import { http } from '@/lib/http/client'
import { unwrap, type ApiEnvelope } from '@/lib/http/envelope'
import type {
  Activity,
  CreateRequestPayload,
  ListRequestsParams,
  PageResponse,
  RequestDetail,
  RequestSummary,
  TransitionPayload,
} from './types'

type Id = number | string

/**
 * All request endpoints. Note there is deliberately no "update status" call:
 * status only changes through `/transitions`, which the backend validates against the workflow.
 */
export const requestsApi = {
  list: (params: ListRequestsParams, signal?: AbortSignal) =>
    http.get<ApiEnvelope<PageResponse<RequestSummary>>>('/requests', { params, signal }).then(unwrap),

  get: (id: Id, signal?: AbortSignal) =>
    http.get<ApiEnvelope<RequestDetail>>(`/requests/${id}`, { signal }).then(unwrap),

  activity: (id: Id, signal?: AbortSignal) =>
    http.get<ApiEnvelope<Activity[]>>(`/requests/${id}/activity`, { signal }).then(unwrap),

  create: (payload: CreateRequestPayload) =>
    http.post<ApiEnvelope<RequestDetail>>('/requests', payload).then(unwrap),

  transition: (id: Id, payload: TransitionPayload) =>
    http.post<ApiEnvelope<RequestDetail>>(`/requests/${id}/transitions`, payload).then(unwrap),
}
