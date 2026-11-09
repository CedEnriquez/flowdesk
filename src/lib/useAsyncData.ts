import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { toApiError, type ApiError } from './http/errors'

interface AsyncState<T> {
  data: T | undefined
  error: ApiError | undefined
  loading: boolean
}

export interface AsyncResult<T> extends AsyncState<T> {
  reload: () => void
}

/**
 * Minimal data-loading hook around a promise-returning loader (axios call).
 * - Aborts the in-flight request when deps change or the component unmounts.
 * - Keeps the previous data while reloading, so lists don't flash empty.
 */
export function useAsyncData<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, loading: true })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: undefined, loading: false })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState((prev) => ({ ...prev, error: toApiError(error), loading: false }))
      })

    return () => controller.abort()
    // The loader is intentionally excluded: callers pass the values it depends on as `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, reload }
}
