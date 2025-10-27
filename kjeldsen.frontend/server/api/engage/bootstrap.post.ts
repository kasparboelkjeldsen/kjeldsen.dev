import { EngageClient } from '~~/server/api/engage/EngageClient'
import { parse } from 'cookie'
import { encryptSeg, sanitizeSegment } from '~~/server/utils/seg-crypto'

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'
const SEGMENT_COOKIE = 'segTok'

export default defineEventHandler(async (event) => {
  try {
    const started = Date.now()
    const config = useRuntimeConfig()
    const deliveryKey: string | undefined = config.deliveryKey
    let baseUrl = (config.public.cmsHost || '').replace(/\/$/, '')
    if (baseUrl && !/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`
    if (!baseUrl) {
      console.error('[engage/bootstrap] missing cmsHost runtime config')
      return { ok: false, error: 'missing-host' }
    }
    const engageClient = new EngageClient({ BASE: baseUrl })

    const body = await readBody<any>(event).catch(() => ({}))
    const { url: clientUrl } = body || {}
    const req = event.node.req
    const rawCookie = req.headers.cookie || ''
    const cookies = rawCookie ? parse(rawCookie) : {}
    const existingVisitorId = cookies[VISITOR_COOKIE]
    const segment = cookies[SEGMENT_COOKIE]

    // Debug flag via query (?engageDebug=1) or header
    const debugFlag =
      /[?&]engageDebug=1/.test(req.url || '') || req.headers['x-engage-debug'] === '1'

    // Build server-side request body similar to previous middleware
    const host = req.headers.host || ''
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
    // clientUrl may be a path or full URL; ensure query string retained.
    const rawPath = clientUrl || req.url || '/'
    let fullUrl = rawPath.startsWith('http') ? rawPath : `${proto}://${host}${rawPath}`
    // Normalize URL domain for analytics licensing:
    // 1. If localhost -> optionally remap to configured siteUrl / fallback (existing logic below)
    // 2. If NOT localhost -> force host to licensed domain kjeldsen.dev (retain path & query) over https
    const publicSiteRaw = (config.public.siteUrl || '').replace(/\/$/, '')
    const fallbackCanonical = 'https://www.kjeldsen.dev'
    const localhostRegex = /^https?:\/\/localhost(?::\d+)?\/?/i
    if (localhostRegex.test(fullUrl)) {
      const targetHost = publicSiteRaw || fallbackCanonical
      try {
        const u = new URL(fullUrl)
        const target = new URL(targetHost)
        u.host = target.host
        u.protocol = target.protocol
        fullUrl = u.toString()
        if (!publicSiteRaw) {
          console.warn(
            '[engage/bootstrap] siteUrl not configured; used fallback canonical host for analytics URL'
          )
        }
      } catch (errSwap) {
        console.warn(
          '[engage/bootstrap] failed to remap localhost URL, using fallback root',
          serializeError(errSwap)
        )
        fullUrl = targetHost + '/'
      }
    } else if (!publicSiteRaw) {
      // Not localhost but still missing siteUrl; optional info for diagnostics
      console.warn(
        '[engage/bootstrap] siteUrl not configured; consider setting runtimeConfig.public.siteUrl'
      )
    }

    // Force non-localhost hosts to the licensed domain
    try {
      if (!localhostRegex.test(fullUrl)) {
        const u = new URL(fullUrl)
        if (u.hostname !== 'kjeldsen.dev') {
          const prevHost = u.hostname
          u.hostname = 'kjeldsen.dev'
          u.protocol = 'https:'
          u.port = '' // remove any explicit port
          fullUrl = u.toString()
          // Minimal log only if host changed (avoid leaking paths)
          if (process.env.NODE_ENV !== 'production') {
            console.info('[engage/bootstrap] normalized analytics host', {
              from: prevHost,
              to: 'kjeldsen.dev',
            })
          }
        }
      }
    } catch {
      /* ignore URL normalization errors */
    }

    // Remote client address fallback chain
    const remoteClientAddress =
      ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
      // @ts-ignore node types
      req.socket?.remoteAddress ||
      '' ||
      '0.0.0.0'

    const baseForwardHeaders: Record<string, string> = {
      'X-Original-Url': fullUrl,
      'X-Referrer': req.headers.referer || '',
      'X-Browser-UserAgent': (req.headers['user-agent'] as string) || 'nuxt-app',
      'User-Agent': (req.headers['user-agent'] as string) || 'nuxt-app',
      'X-Remote-Client-Address': remoteClientAddress,
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
      remoteClientAddress,
      userIdentifier: '',
    }

    let response: any
    try {
      response = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
        apiKey: deliveryKey,
        externalVisitorId: existingVisitorId,
        requestBody,
      })
    } catch (firstErr) {
      try {
        response = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
          apiKey: deliveryKey,
          externalVisitorId: undefined,
          requestBody,
        })
      } catch (secondErr) {
        const errPayload: any = {
          durationMs: Date.now() - started,
          url: requestBody.url,
          baseUrl,
          hasVisitor: !!existingVisitorId,
          hasApiKey: !!deliveryKey,
          apiKeyLength: deliveryKey?.length,
          remoteClientAddress,
          firstError: serializeError(firstErr),
          secondError: serializeError(secondErr),
        }
        if (debugFlag) {
          errPayload.requestBody = requestBody
          errPayload.headersSample = Object.fromEntries(Object.entries(req.headers).slice(0, 12))
        }
        console.error('[engage/bootstrap] analytics request failed', errPayload)
        return { ok: false, error: 'analytics-failed' }
      }
    }

    const pageviewId = response?.pageviewId
    const externalVisitorId = response?.externalVisitorId || existingVisitorId

    // Note: The pageview API doesn't return segment information
    // For now, we'll default to 'anon' and might need to implement
    // a separate segmentation call if personalization is needed
    const activeSegmentAlias = sanitizeSegment('anon')

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

    return {
      ok: true,
      pageviewId,
      externalVisitorId,
      segment: activeSegmentAlias,
      segmentEmptyBeforeParsing: segment == null || segment == undefined,
    }
  } catch (e) {
    console.error('[engage/bootstrap] unexpected error', serializeError(e))
    return { ok: false, error: 'unexpected-error' }
  }
})

function serializeError(err: any) {
  if (!err) return { message: 'Unknown error' }
  const base: any = {
    message: err.message || String(err),
    name: err.name,
  }
  if (typeof err.status === 'number') base.status = err.status
  if (err.statusText) base.statusText = err.statusText
  if (err.body) {
    if (typeof err.body === 'object') {
      base.bodyKeys = Object.keys(err.body).slice(0, 8)
      if (err.body.error) base.bodyError = err.body.error
      if (err.body.message) base.bodyMessage = err.body.message
    } else if (typeof err.body === 'string') {
      base.bodyPreview = err.body.substring(0, 180)
      base.bodyLength = err.body.length
    }
  }
  if (err.stack) base.stack = err.stack.split('\n').slice(0, 5).join('\n')
  return base
}
