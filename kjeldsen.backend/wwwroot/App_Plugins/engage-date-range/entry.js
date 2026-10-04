/**
 * Engage's analytics views remember the date picker in localStorage (`ue:analyticsContext`): the
 * mode ("last-7-days", "this-month", ...) and the dates it resolved to at the time. On the next
 * visit Engage restores the dates as stored and does not resolve the mode again, so "last 7 days"
 * picked in April still means a week in April in October. On a heatmap that shows up as "no
 * heatmap data", with nothing to say why.
 *
 * Before Engage reads it, this resolves a relative mode against today with the same rules as
 * Engage's picker. A custom range is the editor's own choice and is left alone. A compared
 * period is moved by the same distance, so "previous period" and "previous year" still line up.
 * Anything unexpected leaves the stored value untouched; at worst Engage behaves as it does
 * without this file.
 */
const KEY = 'ue:analyticsContext'
const DAY = 86_400_000

const pad = (n) => String(n).padStart(2, '0')
// Engage's own format: local time, no zone.
const format = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
const daysAgo = (n) => new Date(new Date().setDate(new Date().getDate() - n))

function resolve(mode) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (mode) {
    case 'yesterday':
      return [startOfDay(daysAgo(1)), endOfDay(daysAgo(1))]
    case 'last-7-days':
      return [startOfDay(daysAgo(7)), endOfDay(daysAgo(1))]
    case 'last-30-days':
      return [startOfDay(daysAgo(30)), endOfDay(daysAgo(1))]
    case 'this-month':
      return [new Date(y, m, 1), endOfDay(now)]
    case 'last-month':
      return [new Date(y, m - 1, 1), endOfDay(new Date(y, m, 0))]
    case 'this-year':
      return [new Date(y, 0, 1), endOfDay(now)]
    case 'last-year':
      return [new Date(y - 1, 0, 1), endOfDay(new Date(y - 1, 11, 31))]
    default:
      return null // custom, or a mode this file does not know
  }
}

function refresh() {
  const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null')
  const primary = stored?.dateRange?.primary
  if (!primary?.range?.from) return

  const resolved = resolve(primary.mode)
  if (!resolved) return

  const [from, to] = resolved
  const shift = from.getTime() - new Date(primary.range.from).getTime()
  if (shift === 0 || Number.isNaN(shift)) return

  primary.range = { from: format(from), to: format(to) }

  const secondary = stored.dateRange.secondary?.range
  if (secondary?.from && secondary?.to) {
    // Whole days, so a daylight-saving change in between does not shift the times.
    const days = Math.round(shift / DAY)
    const move = (s) => {
      const d = new Date(s)
      d.setDate(d.getDate() + days)
      return format(d)
    }
    stored.dateRange.secondary.range = { from: move(secondary.from), to: move(secondary.to) }
  }

  localStorage.setItem(KEY, JSON.stringify(stored))
}

try {
  refresh()
} catch {
  // Storage blocked or not JSON: leave Engage to it.
}

export const onInit = () => {}
