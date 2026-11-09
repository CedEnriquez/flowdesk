import { describe, expect, it } from 'vitest'
import { createRequestSchema } from './schemas'

const valid = { title: 'New laptop', description: 'Need a laptop for onboarding', type: 'SERVICE', priority: 'HIGH' }

describe('createRequestSchema', () => {
  it('accepts a valid request and trims text', () => {
    const result = createRequestSchema.safeParse({ ...valid, title: '  New laptop  ' })
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('New laptop')
  })

  it('rejects a whitespace-only title', () => {
    const result = createRequestSchema.safeParse({ ...valid, title: '   ' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Title is required')
  })

  it('rejects unknown request types and priorities', () => {
    expect(createRequestSchema.safeParse({ ...valid, type: 'URGENT' }).success).toBe(false)
    expect(createRequestSchema.safeParse({ ...valid, priority: 'CRITICAL' }).success).toBe(false)
  })
})
