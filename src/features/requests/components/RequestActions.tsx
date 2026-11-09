import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button, type ButtonSize } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toApiError } from '@/lib/http/errors'
import { ACTION_META, ACTION_ORDER, COMMENT_MAX } from '../constants'
import { useStatusTransition } from '../hooks'
import type { AvailableAction, RequestDetail, RequestStatus } from '../types'

export interface RequestActionsProps {
  requestId: number
  /** From the backend: the transitions the current user may perform right now. */
  availableActions: AvailableAction[]
  /** Called after a transition succeeds (with the updated request) or fails due to stale state. */
  onChanged: (updated?: RequestDetail) => void
  size?: ButtonSize
}

/** Errors meaning our view of the request is stale: reload so the UI shows the real state. */
const STALE_STATE_STATUSES = new Set([403, 404, 409])

export function RequestActions({ requestId, availableActions, onChanged, size = 'md' }: RequestActionsProps) {
  const { run, pending } = useStatusTransition()
  const [dialogFor, setDialogFor] = useState<AvailableAction | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const actions = ACTION_ORDER.map((status) => availableActions.find((action) => action.toStatus === status)).filter(
    (action): action is AvailableAction => Boolean(action && ACTION_META[action.toStatus]),
  )

  const execute = async (toStatus: RequestStatus, comment?: string, fromDialog = false) => {
    const meta = ACTION_META[toStatus]
    try {
      const updated = await run(requestId, { toStatus, comment: comment || undefined })
      if (!updated) return // a transition was already in flight
      toast.success(meta?.successMessage ?? 'Request updated.')
      setDialogFor(null)
      onChanged(updated)
    } catch (error) {
      const apiError = toApiError(error)
      // Validation errors (e.g. missing rejection reason) stay in the dialog so the user can fix them.
      if (fromDialog && apiError.status === 400) {
        setDialogError(apiError.fieldErrors[0]?.message ?? apiError.message)
        return
      }
      toast.error(apiError.message)
      setDialogFor(null)
      if (STALE_STATE_STATUSES.has(apiError.status)) onChanged()
    }
  }

  const handleClick = (action: AvailableAction) => {
    // Confirm important actions, and always when the backend says a comment is required.
    if (ACTION_META[action.toStatus]?.confirm || action.requiresComment) {
      setDialogError(null)
      setDialogFor(action)
    } else {
      void execute(action.toStatus)
    }
  }

  const closeDialog = useCallback(() => setDialogFor(null), [])

  if (actions.length === 0) return null

  const dialogMeta = dialogFor ? ACTION_META[dialogFor.toStatus] : undefined
  const confirm = dialogMeta?.confirm

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const meta = ACTION_META[action.toStatus]!
          return (
            <Button
              key={action.toStatus}
              size={size}
              variant={meta.variant}
              loading={pending === action.toStatus && !dialogFor}
              disabled={pending !== null}
              onClick={() => handleClick(action)}
            >
              {meta.label}
            </Button>
          )
        })}
      </div>

      {dialogFor && dialogMeta && (
        <ConfirmDialog
          title={confirm?.title ?? dialogMeta.label}
          description={confirm?.description ?? 'Please provide a comment to continue.'}
          confirmLabel={confirm?.confirmLabel ?? dialogMeta.label}
          confirmVariant={dialogMeta.variant}
          comment={
            confirm?.commentLabel || dialogFor.requiresComment
              ? {
                  label: confirm?.commentLabel ?? 'Comment',
                  required: dialogFor.requiresComment,
                  placeholder: confirm?.commentPlaceholder,
                  maxLength: COMMENT_MAX,
                }
              : undefined
          }
          loading={pending === dialogFor.toStatus}
          error={dialogError}
          onCancel={closeDialog}
          onConfirm={(comment) => void execute(dialogFor.toStatus, comment, true)}
        />
      )}
    </>
  )
}
