import { isContentPath } from '../utils/delivery'
import { loadChildren } from '../utils/children'
import { sendJson } from '../utils/compress'

export type { ChildImage, ChildSummary } from '../utils/children'

/**
 * Children of a content item, for container pages.
 *
 * Returns the summaries `loadChildren` builds rather than the documents themselves: the full
 * documents put every child's entire block grid into the SSR payload, measured at 108KB for four
 * links on /blog/.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '/')

  if (!isContentPath(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  return sendJson(event, await loadChildren(path))
})
