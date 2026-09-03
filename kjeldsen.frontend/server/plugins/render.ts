import { useCompression } from 'h3-compression'
import { storeRendered } from '../utils/cache/output'

/**
 * Two things that happen to every server-rendered page, in this order:
 *
 * 1. Its HTML goes into the output cache, when the middleware decided this request may fill it
 *    (a 200, no cookie set, no personalization). Next time, the middleware answers from memory.
 * 2. It is compressed. The page is the one response Front Door is told not to cache, and Front
 *    Door only compresses what it caches, so without this a post's 105 KB of markup travelled
 *    uncompressed. Static assets are precompressed at build time; API JSON is handled in
 *    server/utils/compress.ts.
 *
 * One plugin rather than two because the order matters: the cache must see the HTML before it is
 * compressed.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', async (response, { event }) => {
    // The block preview is scraped by the CMS, which sends no Accept-Encoding; leaving it
    // untouched keeps that path exactly as it was.
    if (event.context.blockPreview) return

    const status = getResponseStatus(event)
    const setsCookie = Boolean(getResponseHeader(event, 'set-cookie'))
    if (event.context.outputCache === 'store' && status === 200 && !setsCookie && typeof response.body === 'string') {
      storeRendered(event.path, response.body)
      setResponseHeader(event, 'X-Output-Cache', 'miss')
    }

    await useCompression(event, response)
  })
})
