import { cmsBaseUrl } from '../../utils/delivery'
import { engageEnabled } from '../../utils/engage/client'
import { readVisitor } from '../../utils/engage/visitor'
import type { EngageCollectBatch } from '~~/types/engage'

/**
 * Engagement data for one pageview - time on page, scroll depth, outbound clicks, queued events -
 * sent by the client plugin when the page is left.
 *
 * Forwarded to the site's own collect endpoint on the CMS
 * (kjeldsen.backend/code/engage/Api/HeadlessPageDataController.cs), which files it as client-side
 * data against the pageview, the same way Engage's own tracking script does for a rendered page.
 * Engage's stock headless API has no equivalent for these measurements, only for single events.
 *
 * The visitor id is taken from the cookie here, never from the client.
 */
const GUID = /^[0-9a-f-]{36}$/i

export default defineEventHandler(async (event) => {
  const visitorId = readVisitor(event)
  const batch = await readBody<Partial<EngageCollectBatch>>(event)

  if (!engageEnabled() || !visitorId || !batch?.pageviewId || !GUID.test(batch.pageviewId)) {
    setResponseStatus(event, 204)
    return null
  }

  const key = useRuntimeConfig().deliveryKey

  // Fire and forget from the client's point of view; a lost batch is a lost batch.
  await $fetch(`${cmsBaseUrl()}/umbraco/engageextensions/pagedata/collect`, {
    method: 'POST',
    headers: { 'Api-Key': key ?? '', 'Content-Type': 'application/json' },
    body: {
      pageViewGuid: batch.pageviewId,
      externalVisitorId: visitorId,
      version: '5',
      timeOnPage: batch.timeOnPage ?? null,
      scrollDepth: batch.scrollDepth ?? null,
      links: batch.links ?? [],
      events: batch.events ?? [],
      videos: [],
      umbracoForms: [],
      serverReceivedAt: new Date().toISOString(),
    },
  }).catch((e) => console.warn('[engage] collect failed', e))

  setResponseStatus(event, 204)
  return null
})
