import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold text-terra-600">404</p>
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <Link to="/" className="text-sm font-medium text-indigo-700 hover:underline">Go to requests</Link>
    </div>
  )
}
