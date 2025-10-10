import { handleBlockPreview } from '../utils/middleware/blockPreview'
import { handleCacheControlMedia } from '../utils/middleware/cacheControlMedia'
import { handleSitemap } from '../utils/middleware/sitemap'
import { handleEngage } from '../utils/middleware/engage'

export default defineEventHandler(async (event) => {
  // Order matters: handlers may short-circuit by returning a value.
  await handleBlockPreview(event)
  handleCacheControlMedia(event)
  handleEngage(event)

  const sitemap = await handleSitemap(event)
  if (sitemap) return sitemap
})
