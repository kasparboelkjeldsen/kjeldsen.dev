import { getContent20 } from '../delivery-api'
import type { SeoCompositionContentPropertiesModel, WriterContentPropertiesModel } from '../delivery-api'
import { deliveryClient, isContentPath } from '../utils/delivery'
import { cached } from '../utils/cache/store'
import { sendJson } from '../utils/compress'

/** The picture a listing card shows. Width and height are the source media's, for aspect ratio. */
export interface ChildImage {
  url: string
  width: number | null
  height: number | null
}

/** The subset of a child document a listing actually needs. */
export interface ChildSummary {
  id: string
  name: string | null
  contentType: string | null
  path: string | null
  updateDate: string
  /**
   * Card fields, from the `seoComposition` the child's type is composed with. Null on children that
   * carry no such composition - writers, for one - so a listing can fall back to `name`.
   */
  title: string | null
  description: string | null
  date: string | null
  authors: string[]
  image: ChildImage | null
}

/** What the `fields`/`expand` below actually ask for, which the generated union cannot express. */
type CardProperties = Partial<SeoCompositionContentPropertiesModel> & {
  writer?: Array<{ name?: string | null; properties?: WriterContentPropertiesModel | null }> | null
  cacheKeys?: string[] | null
}

/**
 * Children of a content item, for container pages.
 *
 * Uses the delivery API's `fetch=children:<path>` so this is one request regardless of how many
 * children there are, and projects to a summary before returning. Returning the full documents
 * would put every child's entire block grid into the SSR payload - measured at 108KB for four
 * links on /blog/.
 *
 * Cached under every child's cache keys and the container's path, so publishing, unpublishing or
 * adding a post drops the listing.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '/')

  if (!isContentPath(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const children = await cached(`children:${path}`, async () => {
    const { data, error, response } = await getContent20({
      client: deliveryClient(),
      query: {
        fetch: `children:${path}`,
        // Only the take window: the real ordering happens below. The delivery API sorts on built-in
        // fields only, and a post's date is a property.
        sort: ['updateDate:desc'],
        take: 100,
        // Named rather than `$all`: everything else on a blog post is its block grid.
        fields: 'properties[seoTitle,seoDescription,seoPublishingDate,seoListImage,writer]',
        // A content picker is a reference until expanded, and the author's name lives on the writer.
        expand: 'properties[writer]',
      },
    })

    if (error || !data) {
      console.error(`[content-children] ${response?.status} for path "${path}"`, error)
      throw createError({ statusCode: 502, statusMessage: 'Failed to fetch children' })
    }

    const keys = new Set<string>([`path:${path.replace(/\/+$/, '') || '/'}`, `children:${path}`])

    const summaries = (data.items ?? [])
      .map((item): ChildSummary => {
        const props = (item.properties ?? {}) as CardProperties
        const image = props.seoListImage?.[0]

        for (const key of props.cacheKeys ?? []) keys.add(key)
        keys.add(`content-${item.id}`)

        return {
          id: item.id,
          name: item.name ?? null,
          contentType: item.contentType,
          path: item.route?.path ?? null,
          updateDate: item.updateDate,
          title: props.seoTitle || null,
          description: props.seoDescription || null,
          date: props.seoPublishingDate || null,
          authors: (props.writer ?? [])
            .map((w) => w.properties?.writerName || w.name || '')
            .filter(Boolean),
          image: image?.url ? { url: image.url, width: image.width ?? null, height: image.height ?? null } : null,
        }
      })
      // Newest first, on the date an editor set. `updateDate` is the fallback so children without a
      // publishing date - or a whole container of them, like writers - keep a stable order instead of
      // collapsing to one value.
      .sort((a, b) => published(b) - published(a))

    return { value: summaries, keys: [...keys] }
  })

  return sendJson(event, children)
})

function published(child: ChildSummary): number {
  return Date.parse(child.date ?? child.updateDate) || 0
}
