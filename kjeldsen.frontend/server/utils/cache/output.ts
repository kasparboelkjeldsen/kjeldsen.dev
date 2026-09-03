import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

/**
 * The output cache: rendered HTML per path, held in memory.
 *
 * Sits in front of the query cache for the common case - a page nobody is personalized on - and
 * turns a request into a memory read. Entries are pre-compressed when stored, so a hit does not
 * compress either. Everything is dropped on any purge from the CMS: a publish changes at most a
 * handful of pages, but listings and navigation appear on all of them, and re-rendering twenty
 * pages is cheaper than being clever about which twenty.
 *
 * What is never cached: anything but a 200, a response that set a cookie, a request whose visitor
 * has a segment on a page that varies (see server/middleware/output-cache.ts), and the block
 * preview.
 */
export interface RenderedPage {
  html: string
  br: Buffer
  gzip: Buffer
  expires: number
}

const TTL_MS = 60 * 60 * 1000
const MAX_PAGES = 500

const pages = new Map<string, RenderedPage>()
const stats = { hits: 0, misses: 0, stores: 0, purges: 0 }

export function outputKey(path: string): string {
  const clean = path.split('?')[0]!.replace(/\/+$/, '')
  return clean || '/'
}

export function getRendered(path: string): RenderedPage | null {
  const hit = pages.get(outputKey(path))
  if (hit && hit.expires > Date.now()) {
    stats.hits++
    return hit
  }
  if (hit) pages.delete(outputKey(path))
  stats.misses++
  return null
}

export function storeRendered(path: string, html: string): void {
  if (pages.size >= MAX_PAGES) {
    const oldest = pages.keys().next().value
    if (oldest !== undefined) pages.delete(oldest)
  }
  pages.set(outputKey(path), {
    html,
    br: brotliCompressSync(html, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }),
    gzip: gzipSync(html, { level: 6 }),
    expires: Date.now() + TTL_MS,
  })
  stats.stores++
}

export function purgeRendered(): number {
  const n = pages.size
  pages.clear()
  stats.purges += n
  return n
}

export function outputStats() {
  return { ...stats, pages: pages.size }
}
