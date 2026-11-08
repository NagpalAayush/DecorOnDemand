export function formatBookingDate(value) {
  if (!value) return 'Date unavailable'

  const rawValue = String(value)
  const dateOnly = rawValue.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  const date = dateOnly
    ? new Date(`${dateOnly}T00:00:00`)
    : new Date(rawValue)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleDateString('en-IN', { dateStyle: 'long' })
}
