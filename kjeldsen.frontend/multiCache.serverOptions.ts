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
        // Access cookie header manually (avoid allocating cookie parser for perf)
        const cookieHeader = getHeader(event, 'cookie') || ''
        let segment = 'default'
        if (cookieHeader) {
          const match = cookieHeader.match(/(?:^|; )engageSegment=([^;]+)/)
          match && match[1] && (segment = decodeURIComponent(match[1]))
        }
        // Normalize segment alias to safe subset
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(segment)) segment = 'default'
        return `${path}::seg:${segment}`
      },
    },
  }
})
