import { Button } from '@/components/ui/Button'

export function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 text-sm text-slate-600">
      <span>
        Page {page + 1} of {totalPages} · {totalElements} requests
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="secondary" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  )
}
