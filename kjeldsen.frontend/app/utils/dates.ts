// A fixed locale, not the ambient one: server and browser must format identically or hydration
// reports a mismatch on every date.
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(raw: string | null | undefined): string {
  if (!raw) return ''
  const date = new Date(raw)
  return isNaN(date.getTime()) ? '' : dateFormat.format(date)
}

/** Words per minute a reader manages on technical prose, roughly. */
const WPM = 220

/** Minutes to read a run of markup, never less than one. */
export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / WPM))
}
