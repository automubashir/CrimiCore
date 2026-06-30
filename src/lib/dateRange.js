const DAYS = {
  'Last 24 hours': 1,
  'Last 7 days':   7,
  'Last 30 days':  30,
  'Last 90 days':  90,
}

export const DATE_RANGE_OPTIONS = Object.keys(DAYS)

function fmt(d) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function dateRangeToParams(range) {
  const days = DAYS[range]
  if (!days) return {}
  const to   = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - days)
  return { from_date: fmt(from), to_date: fmt(to) }
}
