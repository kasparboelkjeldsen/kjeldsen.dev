import { handleBlockPreview } from '../utils/middleware/blockPreview'
import { handleCacheControlMedia } from '../utils/middleware/cacheControlMedia'
import { handleSitemap } from '../utils/middleware/sitemap'

export default defineEventHandler(async (event) => {
  console.log('middleware', event.path)
  // Order matters: handlers may short-circuit by returning a value.
  await handleBlockPreview(event)
  handleCacheControlMedia(event)
  // engage middleware removed (moved to on-demand API bootstrap)

  const sitemap = await handleSitemap(event)
  if (sitemap) return sitemap
})
