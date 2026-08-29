import { getContentItemByPath20 } from '../delivery-api'
import { deliveryClient, isContentPath } from '../utils/delivery'

/**
 * Server-side proxy for a single content item, addressed by `?path=`.
 *
 * The delivery key stays on the server; the browser only ever talks to this route.
 *
 * The path is a query parameter rather than a catch-all segment on purpose. A catch-all
 * (`/api/content/[...slug]`) does not match the *root* request `/api/content/`, and an unmatched
 * `/api/**` request falls through to the SSR renderer rather than 404ing - which turns "fetch the
 * home page" into a render that fetches itself, recursively, until the worker runs out of memory.
 * A query parameter has no empty-segment case.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '').replace(/^\/+|\/+$/g, '')

  if (!isContentPath(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const { data, error, response } = await getContentItemByPath20({
    client: deliveryClient(),
    path: { path },
  })

  if (response?.status === 404) {
    throw createError({ statusCode: 404, statusMessage: 'Content not found' })
  }

  if (error || !data) {
    console.error(`[content] ${response?.status} for path "${path}"`, error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch content' })
  }

  return data
})
