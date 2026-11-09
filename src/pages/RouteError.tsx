import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'

/** Router-level error boundary: shows a friendly message instead of a blank screen. */
export function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <Alert
        title={notFound ? 'Page not found' : 'Something went wrong'}
        action={<Link to="/" className="text-sm font-semibold underline">Back to requests</Link>}
      >
        {notFound ? "We couldn't find that page." : 'An unexpected error occurred. Try reloading the page.'}
      </Alert>
    </div>
  )
}
