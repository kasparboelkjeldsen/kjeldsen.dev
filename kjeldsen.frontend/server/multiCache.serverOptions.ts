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

        // CRITICAL FIX: Consistent LOOKUP/STORE keys to prevent cache interference.
        //
        // Key insight: Cookie in request header = segment visitor ALREADY had.
        // Context.engageSegment = segment middleware assigned (may be new).
        //
        // Rules:
        //   - LOOKUP always uses cookie (or 'default' if none)
        //   - STORE for RETURNING visitor (had cookie): use cookie segment
        //   - STORE for NEW visitor (no cookie): use 'default' (NOT context segment!)
        //
        // Why: If new visitor stores under context segment, they overwrite cache
        // that returning visitors depend on. By storing under 'default', new visitors
        // share a cache pool without affecting segment-specific caches.
        
        // Parse segment from cookie header (what browser actually sent)
        const cookieHeader = getHeader(event, 'cookie') || ''
        let cookieSegment: string | null = null
        try {
          if (cookieHeader) {
            const match = cookieHeader.match(/(?:^|; )engageSegment=([^;]+)/)
            if (match && match[1]) {
              cookieSegment = decodeURIComponent(match[1])
            }
          }
        } catch {
          cookieSegment = null
        }
        
        // Normalize cookie segment
        if (cookieSegment && !/^[A-Za-z0-9_-]{1,64}$/.test(cookieSegment)) {
          cookieSegment = null
        }

        // Determine if this is STORE phase (context set by middleware)
        const isStorePhase = !!event.context?.engageSegment

        // --- segmentbreak handling ---
        // ?segmentbreak=true forces a cache miss so middleware can re-evaluate
        // the visitor's segment. This is the ONE exception where we use context
        // segment for STORE - the segment intentionally CHANGED.
        if (url.searchParams.has('segmentbreak')) {
          if (isStorePhase) {
            // STORE: Use new segment from context so updated cookie will find it
            const seg = event.context.engageSegment as string
            const key = `${path}::seg:${/^[A-Za-z0-9_-]{1,64}$/.test(seg) ? seg : 'default'}`
            console.log(`[Cache] STORE segmentbreak key=${key}`)
            return key
          }
          // LOOKUP: Force cache miss with unique key
          const breakKey = `${path}::seg:__break_${Date.now()}`
          console.log(`[Cache] LOOKUP segmentbreak bypass key=${breakKey}`)
          return breakKey
        }

        // Standard cache key resolution
        if (isStorePhase) {
          // STORE phase: Use cookie segment if visitor had one, else 'default'
          // This prevents new visitors from overwriting segment-specific caches
          const key = cookieSegment 
            ? `${path}::seg:${cookieSegment}`
            : `${path}::seg:default`
          console.log(`[Cache] STORE key=${key} (cookie=${cookieSegment || 'none'})`)
          return key
        }
        
        // LOOKUP phase: Use cookie segment if available, else 'default'
        const key = cookieSegment 
          ? `${path}::seg:${cookieSegment}`
          : `${path}::seg:default`
        console.log(`[Cache] LOOKUP key=${key}`)
        return key
      },
    },
  }
})
