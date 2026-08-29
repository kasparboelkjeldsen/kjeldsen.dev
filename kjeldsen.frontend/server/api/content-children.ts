import { getContent20 } from '../delivery-api'
import { deliveryClient, isContentPath } from '../utils/delivery'

/** The subset of a child document a listing actually needs. */
export interface ChildSummary {
  id: string
  name: string | null
  contentType: string | null
  path: string | null
  updateDate: string
}

/**
 * Children of a content item, for container pages.
 *
 * Uses the delivery API's `fetch=children:<path>` so this is one request regardless of how many
 * children there are, and projects to a summary before returning. Returning the full documents
 * would put every child's entire block grid into the SSR payload - measured at 108KB for four
 * links on /blog/.
 */
export default defineEventHandler(async (event): Promise<ChildSummary[]> => {
  const path = String(getQuery(event).path ?? '/')

  if (!isContentPath(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const { data, error, response } = await getContent20({
    client: deliveryClient(),
    query: {
      fetch: `children:${path}`,
      sort: ['updateDate:desc'],
      take: 100,
      // Ask the CMS for no properties at all - the summary needs none of them.
      fields: 'properties[$none]',
    },
  })

  if (error || !data) {
    console.error(`[content-children] ${response?.status} for path "${path}"`, error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch children' })
  }

  return (data.items ?? []).map((item) => ({
    id: item.id,
    name: item.name ?? null,
    contentType: item.contentType,
    path: item.route?.path ?? null,
    updateDate: item.updateDate,
  }))
})
