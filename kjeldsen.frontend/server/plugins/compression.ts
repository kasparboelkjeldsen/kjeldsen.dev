import { useCompression } from 'h3-compression'

/**
 * Compresses the server-rendered HTML.
 *
 * The page is the one response Front Door is told not to cache, and Front Door only compresses
 * what it caches - so without this a post's 105 KB of markup travelled uncompressed. Static
 * assets are precompressed at build time (`nitro.compressPublicAssets`) and cached at the edge;
 * API JSON is handled in server/utils/compress.ts.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', async (response, { event }) => {
    // The block preview is scraped by the CMS, which sends no Accept-Encoding; skipping it keeps
    // that path exactly as it was.
    if (event.context.blockPreview) return
    await useCompression(event, response)
  })
})
