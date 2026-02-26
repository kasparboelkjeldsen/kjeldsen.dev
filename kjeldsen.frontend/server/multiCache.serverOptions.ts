import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import { getRequestURL, getHeader } from 'h3'

/**
 * Global multi-cache server options.
 *
 * buildCacheKey is called TWICE per request:
 *  1. By serveCachedHandler (runs BEFORE server middleware via h3 stack.unshift)
 *     → event.context.engageSegment is NOT set yet
 *  2. By afterResponse hook (runs AFTER middleware + SSR rendering)
 *     → event.context.engageSegment IS set by serverMiddleware.ts
 *
 * CRITICAL: Never return null. nuxt-multi-cache uses the return value as a
 * literal storage key — returning null means ALL requests without a segment
 * share the single key "null", so the first page cached (e.g. homepage) is
 * served for every subsequent cache-miss URL.
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

        // Resolve segment from two sources (in priority order):
        //  1. event.context.engageSegment — set by serverMiddleware during this
        //     request; available in the afterResponse call (call #2).
        //  2. Cookie header — sent by the browser from a previous response;
        //     available in both calls.
        let segment: string | null = null

        // Context segment (set by middleware — only present in call #2)
        if (event.context?.engageSegment) {
          segment = event.context.engageSegment as string
        }

        // Fall back to cookie header
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

        // --- segmentbreak handling ---
        // ?segmentbreak=true forces a cache miss so middleware can re-evaluate
        // the visitor's segment.  We distinguish the two calls:
        //   Call #1 (serveCachedRoute, before middleware): context is NOT set
        //     → return a unique timestamped key that will never match a stored
        //       entry, guaranteeing a cache miss.
        //   Call #2 (afterResponse, after middleware): context IS set
        //     → return the proper segment key so the freshly rendered page is
        //       stored under the correct (possibly new) segment.
        if (url.searchParams.has('segmentbreak')) {
          if (event.context?.engageSegment) {
            const seg = event.context.engageSegment as string
            return `${path}::seg:${/^[A-Za-z0-9_-]{1,64}$/.test(seg) ? seg : 'default'}`
          }
          // Before middleware — unique key ensures cache miss
          return `${path}::seg:__break_${Date.now()}`
        }

        // No segment at all (first-time visitor, no cookie, call #1).
        // Return a path-scoped 'default' key instead of null so each page gets
        // its own cache slot.  This key will almost always miss on lookup
        // (afterResponse stores under the real segment), which is the desired
        // behaviour: first-time visitors always get a fresh SSR + middleware
        // bootstrap.
        if (!segment) {
          return `${path}::seg:default`
        }

        // Normalize segment alias to safe subset
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(segment)) segment = 'default'
        return `${path}::seg:${segment}`
      },
    },
  }
})
