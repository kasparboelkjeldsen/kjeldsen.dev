import { EngageClient } from '~~/server/api/engage/EngageClient'
import { parse } from 'cookie'
import { encryptSeg, sanitizeSegment } from '~~/server/utils/seg-crypto'

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'
const SEGMENT_COOKIE = 'segTok'
// Single shared client - ensure BASE URL is properly formatted
let baseUrl = process.env.CMSHOST!
// Ensure the BASE URL has a protocol
if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  baseUrl = `https://${baseUrl}`
}
// Remove trailing slash to avoid double slashes in the final URL
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1)
}

console.debug('[engage/bootstrap] initializing client', {
  originalCmsHost: process.env.CMSHOST,
  processedBaseUrl: baseUrl,
})

const engageClient = new EngageClient({ BASE: baseUrl })

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<any>(event).catch(() => ({}))
    const { url: clientUrl } = body || {}
    const req = event.node.req
    const rawCookie = req.headers.cookie || ''
    const cookies = rawCookie ? parse(rawCookie) : {}
    const existingVisitorId = cookies[VISITOR_COOKIE]
    const segment = cookies[SEGMENT_COOKIE]

    console.debug('[engage/bootstrap] request received', {
      clientUrl,
      hasExistingVisitorId: !!existingVisitorId,
      hasSegmentCookie: !!segment,
      userAgent: req.headers['user-agent'],
    })

    // Build server-side request body similar to previous middleware
    const host = req.headers.host || ''
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
    // clientUrl may be a path or full URL; ensure query string retained.
    const rawPath = clientUrl || req.url || '/'
    const fullUrl = rawPath.startsWith('http') ? rawPath : `${proto}://${host}${rawPath}`

    const baseForwardHeaders: Record<string, string> = {
      'X-Original-Url': fullUrl,
      'X-Referrer': req.headers.referer || '',
      'X-Browser-UserAgent': (req.headers['user-agent'] as string) || 'nuxt-app',
      'User-Agent': (req.headers['user-agent'] as string) || 'nuxt-app',
      'X-Remote-Client-Address': ((req.headers['x-forwarded-for'] as string) || '')
        .split(',')[0]
        .trim(),
    }
    // Flatten headers object into key=value&key2=value2 format (same pattern as other endpoints)
    const serializedHeaders = Object.entries(baseForwardHeaders)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    const requestBody: any = {
      url: fullUrl,
      referrerUrl: req.headers.referer || '',
      headers: serializedHeaders,
      browserUserAgent: req.headers['user-agent'] || 'nuxt-app',
      remoteClientAddress: ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim(),
      userIdentifier: '',
    }

    console.debug('[engage/bootstrap] making analytics call', {
      hasVisitorId: !!existingVisitorId,
      requestUrl: fullUrl,
      baseUrl: baseUrl,
      originalCmsHost: process.env.CMSHOST,
    })

    let response: any
    try {
      // Test if we can construct a valid URL first
      const testUrl = `${baseUrl}/umbraco/engage/api/v1/analytics/pageview/trackpageview/server`
      new URL(testUrl) // This will throw if the URL is invalid

      response = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
        apiKey: process.env.DELIVERY_KEY,
        externalVisitorId: existingVisitorId,
        requestBody,
      })
      console.debug('[engage/bootstrap] first attempt succeeded', {
        hasPageviewId: !!response?.pageviewId,
        hasExternalVisitorId: !!response?.externalVisitorId,
        activeSegmentAlias: response?.activeSegmentAlias,
        responseKeys: Object.keys(response || {}),
      })
    } catch (err) {
      console.warn('[engage/bootstrap] first attempt failed', {
        error: err,
        baseUrl,
        testUrl: `${baseUrl}/umbraco/engage/api/v1/analytics/pageview/trackpageview/server`,
      })
      // Retry without externalVisitorId
      try {
        response = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
          apiKey: process.env.DELIVERY_KEY,
          externalVisitorId: undefined,
          requestBody,
        })
        console.debug('[engage/bootstrap] second attempt succeeded', {
          hasPageviewId: !!response?.pageviewId,
          hasExternalVisitorId: !!response?.externalVisitorId,
          activeSegmentAlias: response?.activeSegmentAlias,
          responseKeys: Object.keys(response || {}),
        })
      } catch (err2) {
        console.error('[engage/bootstrap] both attempts failed', {
          firstError: err,
          secondError: err2,
          baseUrl,
          requestBody,
          constructedUrl: `${baseUrl}/umbraco/engage/api/v1/analytics/pageview/trackpageview/server`,
        })
        return { ok: false, error: 'api-failed' }
      }
    }

    const pageviewId = response?.pageviewId
    const externalVisitorId = response?.externalVisitorId || existingVisitorId

    // Note: The pageview API doesn't return segment information
    // For now, we'll default to 'anon' and might need to implement
    // a separate segmentation call if personalization is needed
    const activeSegmentAlias = sanitizeSegment('anon')

    console.debug('[engage/bootstrap] processed response', {
      pageviewId,
      externalVisitorId,
      activeSegmentAlias,
      originalResponse: response,
    })

    if (externalVisitorId && externalVisitorId !== existingVisitorId) {
      setCookie(event, VISITOR_COOKIE, externalVisitorId, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure: proto === 'https',
        maxAge: 60 * 60 * 24 * 365,
      })
    }
    if (pageviewId) {
      setCookie(event, PAGEVIEW_COOKIE, pageviewId, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure: proto === 'https',
        maxAge: 60 * 30,
      })
    }

    // Encrypt segment alias into segTok cookie (stateless segment token)
    try {
      if (activeSegmentAlias != 'anon') {
        const segTok = await encryptSeg(activeSegmentAlias)
        setCookie(event, SEGMENT_COOKIE, segTok, {
          path: '/',
          sameSite: 'lax',
          httpOnly: false, // accessible by client if needed, but opaque
          secure: proto === 'https',
          maxAge: 7 * 24 * 3600, // 7 days
        })
      }
    } catch (e) {
      console.warn('[engage/bootstrap] segment encryption failed', e)
    }

    const finalResponse = {
      ok: true,
      pageviewId,
      externalVisitorId,
      segment: activeSegmentAlias,
      segmentEmptyBeforeParsing: segment == null || segment == undefined,
    }

    console.debug('[engage/bootstrap] returning response', finalResponse)
    return finalResponse
  } catch (e) {
    console.error('[engage/bootstrap] unexpected error', {
      error: e,
      cmsHost: process.env.CMSHOST,
      hasDeliveryKey: !!process.env.DELIVERY_KEY,
    })
    return { ok: false, error: 'unexpected-error' }
  }
})
