/**
 * Reads the short-lived `engage-tax` cookie set by identifyVisitor() on the
 * server when a cookieless (first-time) visitor triggered a live Engage API
 * call during cache key generation.
 *
 * Because the SSR HTML is cached, we can't surface this value there — it would
 * always reflect the original miss, not the current request. Instead we read
 * the cookie here on the client and inject an HTML comment into the DOM so it
 * shows up in DevTools / view-source equivalents for that specific visitor.
 *
 * The cookie is cleared immediately after reading so it only appears once.
 */
export default defineNuxtPlugin(() => {
  const match = document.cookie.match(/(?:^|; )engage-tax=([^;]+)/)
  if (!match) return

  const raw = decodeURIComponent(match[1])

  // Clear the cookie immediately — it's a one-shot diagnostic value.
  document.cookie = 'engage-tax=; Max-Age=0; path=/'

  const label = raw.startsWith('err:')
    ? `Engage API error after ${raw.slice(4)} ms`
    : `${raw} ms`

  // Inject as the first child of <html> so it's easy to spot in DevTools.
  const comment = document.createComment(` Engage Tax: ${label} `)
  document.documentElement.insertBefore(comment, document.documentElement.firstChild)

  // Also log to console for convenience.
  console.debug(`[engage-tax] personalization tax on this request: ${label}`)
})
