import { getRendered } from '../utils/cache/output'
import { readVisitor } from '../utils/engage/visitor'
import { segmentsFor } from '../utils/engage/segment-map'

/**
 * Serves a rendered page from the output cache, before Nuxt is asked to render anything.
 *
 * Only page requests: GET, no extension, not an API or build path. A visitor who has a segment
 * on a page that varies by segment skips the cache both ways - not served from it here, not
 * stored into it by the render hook - so a personalized render is never shared. The decision
 * mirrors the content route's: a known visitor plus a page in Engage's segment map.
 */
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') return
  const path = event.path.split('?')[0]!
  if (path.includes('.') || path.startsWith('/api/') || path.startsWith('/_') || path.startsWith('/__')) return

  const personalized = readVisitor(event) !== null && (await segmentsFor(path)).length > 0
  if (personalized) {
    event.context.outputCache = 'bypass'
    return
  }

  const hit = getRendered(path)
  if (!hit) {
    event.context.outputCache = 'store'
    return
  }

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'X-Output-Cache', 'hit')
  appendResponseHeader(event, 'Vary', 'Accept-Encoding')

  const accept = getHeader(event, 'accept-encoding') ?? ''
  if (/\bbr\b/.test(accept)) {
    setResponseHeader(event, 'Content-Encoding', 'br')
    return hit.br
  }
  if (/\bgzip\b/.test(accept)) {
    setResponseHeader(event, 'Content-Encoding', 'gzip')
    return hit.gzip
  }
  return hit.html
})
