import { defineMultiCacheOptions } from 'nuxt-multi-cache/server-options'
import { getRequestURL, getHeader } from 'h3'
import { decryptSeg, sanitizeSegment } from './utils/seg-crypto'

/**
 * Global multi-cache server options
 * - Adds segment aware route cache key: {path}::seg:{segmentAlias}
 * - segmentAlias comes from engageSegment cookie (short alias) or defaults to 'default'
 */
export default defineMultiCacheOptions(() => {
  return {
    route: {
      async buildCacheKey(event) {
        const url = getRequestURL(event)
        const path = url.pathname || '/'
        const cookieHeader = getHeader(event, 'cookie') || ''
        let segment = 'anon'
        if (cookieHeader) {
          const match = cookieHeader.match(/(?:^|; )segTok=([^;]+)/)
          if (match && match[1]) {
            try {
              const raw = decodeURIComponent(match[1])
              const dec = await decryptSeg(raw)
              console.log('segtok', dec)
              if (dec) segment = sanitizeSegment(dec)
            } catch {}
          }
        }
        return `${path}::seg:${segment}`
      },
    },
  }
})
