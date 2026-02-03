import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import { getRequestURL, getHeader } from 'h3'

/**
 * Global multi-cache server options
 * - Adds segment aware route cache key: {path}::seg:{segmentAlias}
 * - segmentAlias comes from engageSegment cookie (short alias) or defaults to 'default'
 */
export default defineMultiCacheOptions(() => {
  return {
    route: {
      buildCacheKey(event) {
        const url = getRequestURL(event)
        const path = url.pathname || '/'

        // Skip cookie logic if in preview mode
        if (url.searchParams.has('engagePreviewAbTestVariantId')) {
          return `${path}::seg:default`
        }

        // Access cookie header manually (avoid allocating cookie parser for perf)
        let segment = 'default'
        try {
          const cookieHeader = getHeader(event, 'cookie') || ''
          if (cookieHeader) {
            const match = cookieHeader.match(/(?:^|; )engageSegment=([^;]+)/)
            match && match[1] && (segment = decodeURIComponent(match[1]))
          }
        } catch (e) {
          // Fallback to default if cookie access fails (e.g. cross-origin iframe restrictions)
          segment = 'default'
        }
        // Normalize segment alias to safe subset
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(segment)) segment = 'default'
        return `${path}::seg:${segment}`
      },
    },
  }
})
