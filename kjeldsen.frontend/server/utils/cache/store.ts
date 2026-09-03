/**
 * The query cache: delivery API responses, held in memory, dropped by cache key on publish.
 *
 * Not an output cache. The slow part of a page is the hop to Umbraco, not rendering it, so what is
 * stored is the payload each Nitro route would otherwise fetch, keyed by what it asked for. Every
 * payload carries its own `cacheKeys` (Kraftvaerk.Umbraco.Headless.CacheKeys), which lists the
 * content this payload depends on; those are indexed in reverse, so when the CMS publishes or
 * unpublishes something and posts the affected keys to the purge endpoint, every entry that
 * depended on it goes.
 *
 * A TTL backs the purge up: a missed webhook then costs at most an hour of staleness, not
 * forever. In-process on purpose - at this site's size the whole corpus is well under a megabyte,
 * and a second instance or a shared store is a later decision (see
 * knowledge/caching-and-personalization.md).
 */
interface Entry {
  value: unknown
  keys: string[]
  expires: number
}

export interface Loaded<T> {
  value: T
  /** The cache keys this value depends on. Purging any of them drops the entry. */
  keys: string[]
}

const DEFAULT_TTL_MS = 60 * 60 * 1000
const MAX_ENTRIES = 5000

const entries = new Map<string, Entry>()
const byKey = new Map<string, Set<string>>()
const inflight = new Map<string, Promise<unknown>>()

const stats = { hits: 0, misses: 0, purges: 0 }

function normalise(key: string): string {
  return key.trim().toLowerCase()
}

function drop(id: string): void {
  const entry = entries.get(id)
  if (!entry) return
  entries.delete(id)
  for (const key of entry.keys) {
    const ids = byKey.get(key)
    ids?.delete(id)
    if (ids && ids.size === 0) byKey.delete(key)
  }
}

function put(id: string, loaded: Loaded<unknown>, ttlMs: number): void {
  drop(id)
  if (entries.size >= MAX_ENTRIES) {
    // Oldest first; Map iteration is insertion order.
    const oldest = entries.keys().next().value
    if (oldest !== undefined) drop(oldest)
  }
  const keys = [...new Set(loaded.keys.map(normalise))]
  entries.set(id, { value: loaded.value, keys, expires: Date.now() + ttlMs })
  for (const key of keys) {
    let ids = byKey.get(key)
    if (!ids) byKey.set(key, (ids = new Set()))
    ids.add(id)
  }
}

/**
 * Returns the cached value for `id`, loading and storing it on a miss.
 *
 * Concurrent misses for the same id share one load. A loader that throws stores nothing, so an
 * error - a 404, the CMS being down - is never remembered.
 */
export async function cached<T>(id: string, load: () => Promise<Loaded<T>>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const hit = entries.get(id)
  if (hit && hit.expires > Date.now()) {
    stats.hits++
    return hit.value as T
  }
  if (hit) drop(id)

  stats.misses++
  const pending = inflight.get(id) as Promise<T> | undefined
  if (pending) return pending

  const loading = load()
    .then((loaded) => {
      put(id, loaded, ttlMs)
      return loaded.value
    })
    .finally(() => inflight.delete(id))

  inflight.set(id, loading)
  return loading
}

/** Drops every entry that depends on any of these keys. Returns how many entries went. */
export function purge(keys: string[]): number {
  let dropped = 0
  for (const raw of keys) {
    const ids = byKey.get(normalise(raw))
    if (!ids) continue
    for (const id of [...ids]) {
      drop(id)
      dropped++
    }
  }
  stats.purges += dropped
  return dropped
}

export function purgeAll(): number {
  const n = entries.size
  entries.clear()
  byKey.clear()
  stats.purges += n
  return n
}

export function cacheStats() {
  return { ...stats, entries: entries.size, keys: byKey.size }
}
