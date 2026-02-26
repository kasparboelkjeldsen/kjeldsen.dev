import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import { getRequestURL, getHeader } from 'h3'
import { identifyVisitor, SEGMENT_ALIAS_COOKIE, SEGMENT_ALIAS_PATTERN, DEFAULT_SEGMENT } from './utils/engage'

/**
 * Route cache configuration with segment-aware cache keys.
 * 
 * KEY INSIGHT: buildCacheKey runs BEFORE middleware during cache LOOKUP.
 * To ensure first-time visitors can hit existing segment caches, we perform
 * visitor identification directly in buildCacheKey when no cookie is present.
 * 
 * Flow:
 *   1. LOOKUP (pre-middleware):
 *      - Cookie present → use cookie segment (fast, no API call)
 *      - No cookie → call Engage API to identify → use returned segment
 *   2. STORE (post-middleware):
 *      - Uses segment from event.context (set during LOOKUP)
 * 
 * This ensures LOOKUP and STORE always produce the same key, and first-time
 * visitors benefit from existing cached content for their segment.
 */
export default defineMultiCacheOptions(() => ({
  route: {
    async buildCacheKey(event) {
      const url = getRequestURL(event)
      const path = url.pathname || '/'

      // Skip internal routes
      if (path.startsWith('/_nuxt') || path.startsWith('/__') || path.startsWith('/api/')) {
        return `${path}::seg:${DEFAULT_SEGMENT}`
      }

      // Skip in preview mode
      if (url.searchParams.has('engagePreviewAbTestVariantId')) {
        return `${path}::seg:${DEFAULT_SEGMENT}`
      }

      // Parse segment from cookie
      const cookieSegment = getSegmentFromCookie(event)

      // STORE phase: context was set during LOOKUP
      if (event.context?.engageSegment) {
        const seg = event.context.engageSegment as string
        return `${path}::seg:${seg}`
      }

      // LOOKUP with segmentbreak: force re-identification
      if (url.searchParams.has('segmentbreak')) {
        const segment = await identifyVisitor(event)
        event.context.engageSegment = segment
        return `${path}::seg:${segment}`
      }

      // LOOKUP with cookie: use it directly (fast path)
      if (cookieSegment) {
        event.context.engageSegment = cookieSegment
        return `${path}::seg:${cookieSegment}`
      }

      // LOOKUP without cookie: identify visitor via Engage API
      const segment = await identifyVisitor(event)
      event.context.engageSegment = segment
      return `${path}::seg:${segment}`
    },
  },
}))

/**
 * Extracts the segment alias from the cookie header.
 */
function getSegmentFromCookie(event: any): string | null {
  try {
    const cookieHeader = getHeader(event, 'cookie') || ''
    if (!cookieHeader) return null
    
    const match = cookieHeader.match(new RegExp(`(?:^|; )${SEGMENT_ALIAS_COOKIE}=([^;]+)`))
    if (match && match[1]) {
      const segment = decodeURIComponent(match[1])
      return SEGMENT_ALIAS_PATTERN.test(segment) ? segment : null
    }
  } catch {
    // Ignore parse errors
  }
  return null
}
