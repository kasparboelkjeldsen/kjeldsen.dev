import { fetchGraphicFile } from '../../../utils/graphic-file'

/**
 * A Generated Graphics item as a social card: /api/media/card/<media key>.jpg
 *
 * Crawlers want `og:image` to point at an image they can show, and hardly any of them render an
 * SVG, so the CMS rasterises the drawing to a 1200x630 JPEG (GeneratedGraphicsFileController).
 * Like the SVG route beside it, `v` in the query is the drawing's revision and only there to make
 * a regenerated drawing a new URL for Front Door.
 */
export default defineEventHandler(async (event) => {
  const upstream = await fetchGraphicFile(event, 'card', 'jpg')

  setResponseHeaders(event, {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  return Buffer.from(await upstream.arrayBuffer())
})
