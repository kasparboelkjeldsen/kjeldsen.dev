import type { Ref } from 'vue'

// We rely on nuxt-multi-cache utilities
// (Assuming they are globally auto-imported or available; otherwise import from 'nuxt-multi-cache')
// Using inline dynamic import fallback if not present would be overkill here.

interface CacheContentLike {
  properties?: {
    cacheKeys?: string[]
  }
}

interface UseCustomCacheOptions {
  maxAgeSeconds?: number
  tagPrefix?: string
  enable?: boolean
}

/**
 * Encapsulates route caching + debug HTML comment emission for cache keys.
 * Call on a page (SSR) with the resolved content ref.
 */
export function useCustomCache(
  content: Ref<CacheContentLike | null | undefined>,
  opts: UseCustomCacheOptions = {}
) {
  const runtimeConfig = useRuntimeConfig()
  const useCache = runtimeConfig.public.useCache === 'true'
  const enabled = opts.enable ?? true
  const maxAge = opts.maxAgeSeconds ?? 3600 * 24
  const prefix = opts.tagPrefix ?? ''
  const event = useRequestEvent()

  // Derive segment (server-side; cookie may not exist client yet during SSR)
  let segmentAlias = 'default'
  try {
    if (import.meta.server) {
      if (event) {
        const cookie = getCookie(event, 'engageSegment')
        if (cookie && /[A-Za-z0-9_-]{1,32}/.test(cookie)) segmentAlias = cookie
      }
    } else if (typeof document !== 'undefined') {
      const m = document.cookie.match(/(?:^|; )engageSegment=([^;]+)/)
      if (m && m[1]) segmentAlias = decodeURIComponent(m[1])
    }
  } catch {}

  // Unique cache key base: path + segment alias (fallback path-default)
  const path = event?.path || (import.meta.client ? window.location.pathname : '') || '/'
  const segmentKeyComponent = `${path}-${segmentAlias}`

  const data = content?.value
  const cacheKeys = data?.properties?.cacheKeys || []
  if (!cacheKeys.length) return { applied: false, cacheKeys: [], segment: segmentAlias }

  const tags = ['reset', ...cacheKeys.map((k) => (prefix ? `${prefix}:${k}` : k))]

  // Global buildCacheKey now handled in multiCache.serverOptions.ts

  if (import.meta.server) {
    // Console diagnostic table
    console.table(cacheKeys.map((key: string, i: number) => ({ '#': i + 1, 'Cache Key': key })))

    const iso = new Date().toISOString()
    const utc = new Date().toUTCString()
    const safe = (s: string) => s.replace(/-->/g, '--&gt;')
    const tableLines = cacheKeys.map((k: string, i: number) => `#${i + 1} ${safe(k)}`)
    const comment = `<!-- Cache Keys (${cacheKeys.length}) | ISO: ${iso} | UTC: ${utc} | CacheEnabled: ${useCache} | MaxAge: ${maxAge} | Segment: ${segmentAlias} | DerivedKeyPart: ${segmentKeyComponent}\n${tableLines.join('\n')}\n-->`
    if (event) {
      ;(event.context as any).cacheDebugComment = comment
    }
  }

  if (useCache && enabled) {
    useRouteCache((helper) => {
      helper.setMaxAge(maxAge).setCacheable().addTags(tags)
    })
  }

  return { applied: true, cacheKeys, tags, maxAge, segment: segmentAlias }
}
