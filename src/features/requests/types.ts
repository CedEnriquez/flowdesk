/**
 * API contract shared with the Spring Boot backend. Enum values match the Java enums
 * and the database CHECK constraints (UPPER_SNAKE_CASE).
 */
export const REQUEST_STATUSES = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED'] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const REQUEST_TYPES = ['GENERAL', 'SERVICE', 'BOOKING'] as const
export type RequestType = (typeof REQUEST_TYPES)[number]

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const
export type Priority = (typeof PRIORITIES)[number]

/** A transition the CURRENT user may perform right now, computed by the backend. */
export interface AvailableAction {
  toStatus: RequestStatus
  requiresComment: boolean
}

export interface RequestSummary {
  id: number
  title: string
  type: RequestType
  priority: Priority
  status: RequestStatus
  ownerName: string
  createdAt: string
  updatedAt: string
}

export interface RequestDetail extends RequestSummary {
  description: string
  ownerEmail: string
  availableActions: AvailableAction[]
}

export interface Activity {
  id: number
  /** null for the creation event. */
  previousStatus: RequestStatus | null
  newStatus: RequestStatus
  actorName: string
  comment: string | null
  createdAt: string
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListRequestsParams {
  status?: RequestStatus
  page?: number
  size?: number
}

export interface CreateRequestPayload {
  title: string
  description: string
  type: RequestType
  priority: Priority
}

export interface TransitionPayload {
  toStatus: RequestStatus
  comment?: string
}
