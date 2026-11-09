const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function parse(iso: string): Date | null {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(iso: string): string {
  const date = parse(iso)
  return date ? dateFormatter.format(date) : '—'
}

export function formatDateTime(iso: string): string {
  const date = parse(iso)
  return date ? dateTimeFormatter.format(date) : '—'
}
