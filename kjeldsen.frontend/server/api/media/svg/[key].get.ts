import { cmsBaseUrl } from '../../../utils/delivery'

/**
 * A Generated Graphics item as a file: /api/media/svg/<media key>.svg
 *
 * Crawlers want `og:image` to point at an image URL, not at markup inlined in a page, so the CMS
 * serves the drawing at /media/svg/<key>.svg (GeneratedGraphicsSvgController) and this route
 * puts it on this origin like every other piece of media. It sits beside the general media
 * route rather than inside it because that route's job is signing image-processing commands,
 * and an SVG has none - the only query parameter here is `v`, the drawing's revision, which
 * makes a regenerated drawing a new URL for Front Door and browsers.
 */
export default defineEventHandler(async (event) => {
  const key = (getRouterParam(event, 'key') ?? '').replace(/\.svg$/i, '')

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'No such graphic' })
  }

  const upstream = await fetch(`${cmsBaseUrl()}/media/svg/${key}.svg`)
  if (!upstream.ok) {
    throw createError({ statusCode: upstream.status === 404 ? 404 : 502, statusMessage: 'No such graphic' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  return upstream.text()
})
