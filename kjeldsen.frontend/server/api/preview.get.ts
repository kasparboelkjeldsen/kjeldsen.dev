import { getContentItemById20 } from '../delivery-api'
import { deliveryClient } from '../utils/delivery'
import { sendJson } from '../utils/compress'
import { highlightContent } from '../utils/highlight'
import { isGuid, isValidPreviewPass } from '../utils/preview'

/**
 * One document as it stands in the CMS, saved but not necessarily published, for the preview page.
 *
 * Addressed by id, not path: a document that has never been published has no URL (the delivery
 * API reports a placeholder `/preview-<id>/` route that resolves to nothing). Behind the preview
 * pass, never cached here, and marked so no cache or crawler keeps it.
 */
export default defineEventHandler(async (event) => {
  const { id, t } = getQuery(event)

  if (!isGuid(id) || typeof t !== 'string' || !isValidPreviewPass(id, t)) {
    throw createError({ statusCode: 401, statusMessage: 'Preview pass missing or expired' })
  }

  const { data, error, response } = await getContentItemById20({
    client: deliveryClient(),
    path: { id },
    headers: { Preview: true },
  })

  if (response?.status === 404) {
    throw createError({ statusCode: 404, statusMessage: 'Content not found' })
  }
  if (error || !data) {
    console.error(`[preview] ${response?.status} for "${id}"`, error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch preview' })
  }

  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  setResponseHeader(event, 'X-Robots-Tag', 'noindex')
  return sendJson(event, await highlightContent(data))
})
