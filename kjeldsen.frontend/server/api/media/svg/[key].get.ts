import { fetchGraphicFile } from '../../../utils/graphic-file'

/**
 * A Generated Graphics item as a file: /api/media/svg/<media key>.svg
 *
 * The CMS serves the drawing at /media/svg/<key>.svg (GeneratedGraphicsFileController) and this
 * route puts it on this origin like every other piece of media. It sits beside the general media
 * route rather than inside it because that route's job is signing image-processing commands,
 * and an SVG has none - the only query parameter here is `v`, the drawing's revision, which
 * makes a regenerated drawing a new URL for Front Door and browsers.
 *
 * Social cards want a raster image; that is /api/media/card/<key>.jpg beside this.
 */
export default defineEventHandler(async (event) => {
  const upstream = await fetchGraphicFile(event, 'svg', 'svg')

  setResponseHeaders(event, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  return upstream.text()
})
