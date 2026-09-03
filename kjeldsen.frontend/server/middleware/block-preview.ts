import { timingSafeEqual } from 'node:crypto'
import type { AnyBlock } from '~~/types/content'

/**
 * Receives a single block from Kraftvaerk.Umbraco.Headless.BlockPreview and hands it to the page
 * that renders it.
 *
 * The package posts one serialised `IApiElement` per block in the backoffice grid to
 * `HeadlessBlockPreview:Host` + `:Api`, scrapes the element named by `:Selector` out of the HTML we
 * answer with, and drops that fragment into a shadow root beside the block in the editor. There is
 * no GET form of this and no id to look up: the block being edited is unsaved, so the payload on the
 * request is the only place its content exists.
 *
 * A middleware rather than a route handler because the response has to be a server-rendered Vue
 * page - the whole point is that the backoffice sees what the site's own components produce. Nitro
 * hands unmatched paths to the page renderer whatever the method, so this only has to park the
 * payload where the page can read it.
 */
const PATH = '/__blockpreview'
const HEADER = 'kuhb-header'

export default defineEventHandler(async (event) => {
  if (event.path !== PATH) return

  // The header carries the CMS's delivery API key - `HeadlessBlockPreview:ApiKey`, which the package
  // defaults to `Umbraco:CMS:DeliveryApi:ApiKey`. That is the same secret this app already holds to
  // read content, so the two match without any extra configuration; set `:ApiKey` on the CMS and
  // DELIVERY_KEY here has to move with it. Without this the endpoint would render arbitrary posted
  // JSON for anyone who found it.
  if (event.method !== 'POST' || !authorised(getHeader(event, HEADER))) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const body = await readBody<{ content?: AnyBlock }>(event)
  event.context.blockPreview = body?.content ?? null
})

function authorised(sent: string | undefined): boolean {
  const expected = useRuntimeConfig().deliveryKey
  if (!expected || !sent) return false

  // Same length first: timingSafeEqual throws rather than returning false on a length mismatch.
  const a = Buffer.from(sent)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
