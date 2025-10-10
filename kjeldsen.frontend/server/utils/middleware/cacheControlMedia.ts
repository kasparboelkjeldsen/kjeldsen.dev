import type { H3Event } from 'h3'

/**
 * Sets Cache-Control header for media API GET requests.
 * Matches any URL containing '/api/media'.
 */
export function handleCacheControlMedia(event: H3Event) {
  const req = event.node.req
  if (req.method !== 'GET') return
  const url = req.url || ''
  if (!url.includes('/api/media')) return
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
}
