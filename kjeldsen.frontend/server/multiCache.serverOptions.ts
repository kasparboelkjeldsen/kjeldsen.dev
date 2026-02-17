import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import { getRequestURL, getHeader } from 'h3'

/**
 * Global multi-cache server options
 * - Returns null when no engageSegment cookie exists (skip cache for first-time visitors)
 * - Server middleware handles bootstrap and sets cookie
 * - segmentAlias comes from engageSegment cookie (plain alias) for subsequent requests
 */
export default defineMultiCacheOptions(() => {
  return {
    route: {
      buildCacheKey(event) {
        const url = getRequestURL(event)
        const path = url.pathname || '/'

        // Skip internal routes - let default caching behavior apply
        if (path.startsWith('/_nuxt') || path.startsWith('/__') || path.startsWith('/api/')) {
          return `${path}::seg:default`
        }

        // Skip cookie logic if in preview mode
        if (url.searchParams.has('engagePreviewAbTestVariantId')) {
          return `${path}::seg:default`
        }

        // If segmentbreak is present, skip cache to allow middleware to re-run
        if (url.searchParams.has('segmentbreak')) {
          return null
        }

        // Access cookie header manually (avoid allocating cookie parser for perf)
        let segment: string | null = null
        try {
          const cookieHeader = getHeader(event, 'cookie') || ''
          if (cookieHeader) {
            const match = cookieHeader.match(/(?:^|; )engageSegment=([^;]+)/)
            if (match && match[1]) {
              segment = decodeURIComponent(match[1])
            }
          }
        } catch (e) {
          // Fallback to null if cookie access fails
          segment = null
        }

        // No cookie = first-time visitor → return null to skip cache entirely
        // Server middleware (engageBootstrap.ts) will bootstrap engage and set the cookie
        if (!segment) {
          return null
        }

        // Normalize segment alias to safe subset
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(segment)) segment = 'default'
        return `${path}::seg:${segment}`
      },
    },
  }
})
