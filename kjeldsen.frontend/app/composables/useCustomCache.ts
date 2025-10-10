import type { Ref } from 'vue'

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

  const data = content?.value
  const cacheKeys = data?.properties?.cacheKeys || []
  if (!cacheKeys.length) return { applied: false, cacheKeys: [] }

  const tags = ['reset', ...cacheKeys.map((k) => (prefix ? `${prefix}:${k}` : k))]

  if (import.meta.server) {
    // Console diagnostic table
    console.table(cacheKeys.map((key: string, i: number) => ({ '#': i + 1, 'Cache Key': key })))

    const iso = new Date().toISOString()
    const utc = new Date().toUTCString()
    const safe = (s: string) => s.replace(/-->/g, '--&gt;')
    const tableLines = cacheKeys.map((k: string, i: number) => `#${i + 1} ${safe(k)}`)
    const comment = `<!-- Cache Keys (${cacheKeys.length}) | ISO: ${iso} | UTC: ${utc} | CacheEnabled: ${useCache} | MaxAge: ${maxAge}\n${tableLines.join('\n')}\n-->`
    const event = useRequestEvent()
    if (event) {
      ;(event.context as any).cacheDebugComment = comment
    }
  }

  if (useCache && enabled) {
    useRouteCache((helper) => {
      helper.setMaxAge(maxAge).setCacheable().addTags(tags)
    })
  }

  return { applied: true, cacheKeys, tags, maxAge }
}
