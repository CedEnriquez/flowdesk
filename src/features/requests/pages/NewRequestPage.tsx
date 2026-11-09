import { CreateRequestForm } from '../components/CreateRequestForm'

export function NewRequestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New request</h1>
        <p className="text-sm text-slate-500">Describe what you need. An administrator will review it.</p>
      </div>
      <CreateRequestForm />
    </div>
  )
}
