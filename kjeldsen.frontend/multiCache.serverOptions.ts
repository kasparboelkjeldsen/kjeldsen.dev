import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import { getRequestURL, getHeader } from 'h3'

/**
 * ⚠️  STALE / UNUSED — nuxt-multi-cache v4 resolves the server options file
 * from Nuxt's <serverDir> first (server/multiCache.serverOptions.ts).
 * This root-level copy is kept only as a reference / fallback.
 * The authoritative version lives at server/multiCache.serverOptions.ts.
 *
 * buildCacheKey is called TWICE per request:
 *  1. By serveCachedHandler (before middleware) — no event.context.engageSegment
 *  2. By afterResponse (after middleware + SSR) — event.context.engageSegment set
 *
 * CRITICAL: Never return null — it becomes a single shared storage key.
 */
export default defineMultiCacheOptions(() => {
  return {
    route: {
      buildCacheKey(event) {
        const url = getRequestURL(event)
        const path = url.pathname || '/'

        if (path.startsWith('/_nuxt') || path.startsWith('/__') || path.startsWith('/api/')) {
          return `${path}::seg:default`
        }

        if (url.searchParams.has('engagePreviewAbTestVariantId')) {
          return `${path}::seg:default`
        }

        // Resolve segment: context first (afterResponse), then cookie
        let segment: string | null = null

        if (event.context?.engageSegment) {
          segment = event.context.engageSegment as string
        }

        if (!segment) {
          try {
            const cookieHeader = getHeader(event, 'cookie') || ''
            if (cookieHeader) {
              const match = cookieHeader.match(/(?:^|; )engageSegment=([^;]+)/)
              if (match && match[1]) {
                segment = decodeURIComponent(match[1])
              }
            }
          } catch {
            segment = null
          }
        }

        // segmentbreak: force cache miss before middleware, proper key after
        if (url.searchParams.has('segmentbreak')) {
          if (event.context?.engageSegment) {
            const seg = event.context.engageSegment as string
            return `${path}::seg:${/^[A-Za-z0-9_-]{1,64}$/.test(seg) ? seg : 'default'}`
          }
          return `${path}::seg:__break_${Date.now()}`
        }

        if (!segment) {
          return `${path}::seg:default`
        }

        if (!/^[A-Za-z0-9_-]{1,64}$/.test(segment)) segment = 'default'
        return `${path}::seg:${segment}`
      },
    },
  }
})
