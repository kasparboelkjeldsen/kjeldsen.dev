import { getSegmentationContentActivesegmentsByPath } from '../../engage-api'
import { engageClient, engageEnabled } from './client'
import { segmentsFor } from './segment-map'
import { visitorHeaders, type VisitorRequest } from './request'

/**
 * The variant a visitor gets on a page.
 *
 * Two independent axes: an A/B test assignment and a personalization. Engage serves the A/B
 * variant when both apply, so `forced` is the single alias to ask the delivery API for.
 */
export interface ActiveSegments {
  abTest: string | null
  personalization: string | null
  /** The alias to send as Forced-Segment, or null for the default variant. */
  forced: string | null
}

const NONE: ActiveSegments = { abTest: null, personalization: null, forced: null }

/**
 * Resolves the visitor's segments for one page, asking Engage only when the page actually varies.
 *
 * The answer comes from Engage's own resolution - matched segments against the page's ranked
 * variants, control groups included - rather than from rules evaluated here. Engage keeps the
 * visitor's profile; the frontend keeps nothing but the visitor id. Errors and unknown visitors
 * resolve to the default variant: being a beat late is invisible, a failed page is not.
 */
export async function activeSegments(
  path: string,
  visitorId: string | null,
  req: VisitorRequest
): Promise<ActiveSegments> {
  if (!visitorId || !engageEnabled()) return NONE
  if ((await segmentsFor(path)).length === 0) return NONE

  const { data, error, response } = await getSegmentationContentActivesegmentsByPath({
    client: engageClient(),
    path: { path: path.replace(/^\/+/, '') },
    // Engage evaluates browser and device rules against this request's headers, so they carry the
    // visitor's rather than this server's. The visitor id selects the profile.
    headers: visitorHeaders(req, visitorId),
  })

  if (error || !data) {
    // 404 is Engage's answer to an id it does not know. The cookie is stale; the caller mints a
    // new one on the next tracked pageview.
    if (response?.status !== 404) console.warn('[engage] active segments failed', response?.status, error)
    return NONE
  }

  // An A/B variant carries the test type; a personalization carries the application type.
  const segments = data.segments ?? []
  const abTest = segments.find((s) => s.segmentType)?.umbracoSegmentAlias ?? null
  const personalization = segments.find((s) => !s.segmentType)?.umbracoSegmentAlias ?? null

  return { abTest, personalization, forced: abTest ?? personalization }
}
