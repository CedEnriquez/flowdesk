import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/http/errors'
import { requestsApi } from '../api'
import type { AvailableAction, RequestDetail } from '../types'
import { RequestActions } from './RequestActions'

vi.mock('../api', () => ({
  requestsApi: { transition: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const transition = vi.mocked(requestsApi.transition)

const updated = { id: 1, status: 'REJECTED' } as RequestDetail

const cancel: AvailableAction = { toStatus: 'CANCELLED', requiresComment: false }
const approve: AvailableAction = { toStatus: 'APPROVED', requiresComment: false }
const reject: AvailableAction = { toStatus: 'REJECTED', requiresComment: true }

describe('RequestActions', () => {
  beforeEach(() => {
    transition.mockReset()
  })

  it('renders only the actions the backend allows', () => {
    render(<RequestActions requestId={1} availableActions={[cancel]} onChanged={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Cancel request' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
  })

  it('renders nothing when no actions are available (e.g. final status)', () => {
    const { container } = render(<RequestActions requestId={1} availableActions={[]} onChanged={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('requires a reason before rejecting and does not call the API without one', async () => {
    const user = userEvent.setup()
    render(<RequestActions requestId={1} availableActions={[approve, reject]} onChanged={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Reject' }))
    await user.click(screen.getByRole('button', { name: 'Reject request' }))

    expect(await screen.findByText('Rejection reason is required.')).toBeInTheDocument()
    expect(transition).not.toHaveBeenCalled()
  })

  it('sends the rejection reason and reports the updated request', async () => {
    transition.mockResolvedValue(updated)
    const onChanged = vi.fn()
    const user = userEvent.setup()
    render(<RequestActions requestId={7} availableActions={[reject]} onChanged={onChanged} />)

    await user.click(screen.getByRole('button', { name: 'Reject' }))
    await user.type(screen.getByLabelText(/Rejection reason/), '  Out of budget  ')
    await user.click(screen.getByRole('button', { name: 'Reject request' }))

    expect(transition).toHaveBeenCalledWith(7, { toStatus: 'REJECTED', comment: 'Out of budget' })
    expect(onChanged).toHaveBeenCalledWith(updated)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('treats the comment as optional when the backend does not require one', async () => {
    transition.mockResolvedValue(updated)
    const user = userEvent.setup()
    render(<RequestActions requestId={2} availableActions={[cancel]} onChanged={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Cancel request' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel request' }))

    expect(transition).toHaveBeenCalledWith(2, { toStatus: 'CANCELLED', comment: undefined })
  })

  it('shows the backend validation message inside the dialog on a 400', async () => {
    transition.mockRejectedValue(
      new ApiError({
        status: 400,
        message: 'Validation failed',
        fieldErrors: [{ field: 'comment', message: 'A comment is required when moving to REJECTED' }],
      }),
    )
    const user = userEvent.setup()
    render(<RequestActions requestId={4} availableActions={[reject]} onChanged={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Reject' }))
    await user.type(screen.getByLabelText(/Rejection reason/), 'x')
    await user.click(screen.getByRole('button', { name: 'Reject request' }))

    expect(await screen.findByText('A comment is required when moving to REJECTED')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('reloads the request when the backend rejects the transition as a conflict', async () => {
    transition.mockRejectedValue(new ApiError({ status: 409, message: 'Cannot move a request from IN_REVIEW to FULFILLED' }))
    const onChanged = vi.fn()
    const user = userEvent.setup()
    render(<RequestActions requestId={3} availableActions={[approve]} onChanged={onChanged} />)

    await user.click(screen.getByRole('button', { name: 'Approve' }))

    expect(onChanged).toHaveBeenCalledWith()
  })
})
