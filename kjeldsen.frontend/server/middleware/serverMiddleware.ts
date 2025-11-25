import { handleBlockPreview } from '../utils/middleware/blockPreview'
import { handleCacheControlMedia } from '../utils/middleware/cacheControlMedia'
import { handleSitemap } from '../utils/middleware/sitemap'
import { SetForcedSegmentFromRules, type EngagePageRules } from '../utils/engageRules'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  // Order matters: handlers may short-circuit by returning a value.
  await handleBlockPreview(event)
  handleCacheControlMedia(event)

  // Engage Rules Check
  const url = getRequestURL(event)
  // Check if there are any query parameters
  if (Array.from(url.searchParams.keys()).length > 0) {
    const path = url.pathname
    const config = useRuntimeConfig()

    try {
      const text = await $fetch(
        `${config.public.cmsHost}/umbraco/engageextensions/pageview/rules`,
        {
          query: { path },
          headers: {
            'Api-Key': config.deliveryKey,
          },
        }
      )

      const jsonTest = JSON.parse(text as unknown as string)
      const rules = jsonTest as EngagePageRules

      if (rules) {
        SetForcedSegmentFromRules(rules, event)
      }
    } catch (e) {
      // Fail silently or log debug
      // console.debug('Failed to fetch engage rules', e)
    }
  }

  // engage middleware removed (moved to on-demand API bootstrap)

  const sitemap = await handleSitemap(event)
  if (sitemap) return sitemap
})
