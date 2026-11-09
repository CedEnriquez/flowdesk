import { useCallback, useRef, useState } from 'react'
import { useAsyncData } from '@/lib/useAsyncData'
import { requestsApi } from './api'
import type { ListRequestsParams, RequestDetail, RequestStatus, TransitionPayload } from './types'

export function useRequestList(params: ListRequestsParams) {
  return useAsyncData((signal) => requestsApi.list(params, signal), [params.status, params.page, params.size])
}

export function useRequestDetail(id: string) {
  return useAsyncData((signal) => requestsApi.get(id, signal), [id])
}

export function useRequestActivity(id: string) {
  return useAsyncData((signal) => requestsApi.activity(id, signal), [id])
}

/**
 * Runs a status transition. Ignores repeat calls while one is in flight,
 * so double-clicks don't send duplicate requests (the backend still guards with optimistic locking).
 */
export function useStatusTransition() {
  const inFlight = useRef(false)
  const [pending, setPending] = useState<RequestStatus | null>(null)

  const run = useCallback(async (id: number, payload: TransitionPayload): Promise<RequestDetail | undefined> => {
    if (inFlight.current) return undefined
    inFlight.current = true
    setPending(payload.toStatus)
    try {
      return await requestsApi.transition(id, payload)
    } finally {
      inFlight.current = false
      setPending(null)
    }
  }, [])

  return { run, pending }
}
