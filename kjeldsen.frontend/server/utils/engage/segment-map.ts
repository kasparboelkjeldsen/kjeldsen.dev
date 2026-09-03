import { getSegmentationContentSegments } from '../../engage-api'
import type { SegmentDetailsResponseModel } from '../../engage-api'
import { engageClient, engageEnabled } from './client'

/**
 * Which pages vary by segment, and by which segments.
 *
 * Engage publishes this as one document: every content item with an A/B test or a personalization
 * on it, with its URLs and the segments defined. Pages absent from it do not vary at all, which on
 * this site is every page - so for them the visitor is never consulted, nothing is fragmented and
 * the default payload is the only payload.
 *
 * Held in memory and refreshed on a short interval. Personalization config changes on a
 * different cadence from content publishing, so a TTL rather than a publish hook, until the CMS
 * tells us otherwise (see invalidateSegmentMap).
 */
const TTL_MS = 5 * 60 * 1000

type SegmentMap = Map<string, SegmentDetailsResponseModel[]>

let map: SegmentMap = new Map()
let fetchedAt = 0
let inflight: Promise<SegmentMap> | null = null

function normalise(path: string): string {
  const trimmed = path.trim().replace(/^https?:\/\/[^/]+/i, '').split('?')[0] ?? ''
  const noSlashes = trimmed.replace(/^\/+|\/+$/g, '')
  return noSlashes ? `/${noSlashes}/` : '/'
}

async function fetchMap(): Promise<SegmentMap> {
  const { data, error } = await getSegmentationContentSegments({ client: engageClient() })
  if (error || !data) {
    console.warn('[engage] segment map fetch failed', error)
    return map
  }

  const next: SegmentMap = new Map()
  for (const item of data.segmentedContent ?? []) {
    if (!item.segments?.length) continue
    for (const url of item.contentUrls ?? []) {
      next.set(normalise(url), item.segments)
    }
  }
  return next
}

async function current(): Promise<SegmentMap> {
  if (!engageEnabled()) return new Map()
  if (Date.now() - fetchedAt < TTL_MS) return map

  inflight ??= fetchMap()
    .then((next) => {
      map = next
      fetchedAt = Date.now()
      return next
    })
    .finally(() => {
      inflight = null
    })

  // A stale map is better than a slow request: serve what we have while the refresh runs, unless
  // there is nothing yet.
  return fetchedAt ? map : inflight
}

/** The segments a page varies by, or an empty list when it does not vary. */
export async function segmentsFor(path: string): Promise<SegmentDetailsResponseModel[]> {
  return (await current()).get(normalise(path)) ?? []
}

/** Forces the next lookup to refetch. For a publish or personalization webhook, when one exists. */
export function invalidateSegmentMap(): void {
  fetchedAt = 0
}
