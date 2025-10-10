import type { H3Event } from 'h3'
import { parse } from 'cookie'
import { EngageClient } from '~~/server/api/engage/EngageClient'
import { ExtendedAnalyticsService } from '~~/server/api/engage/services/ExtendedAnalyticsService'

// Reuse a single client instance and wrap analytics for custom header forwarding
const engageClient = new EngageClient({ BASE: process.env.CMSHOST! })
const extendedAnalytics = new ExtendedAnalyticsService(engageClient.analytics as any)

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'

// Track only root or kebab segmented paths (no dots) and skip internal prefixes
const internalPrefixes = [
  '/umbraco',
  '/api/',
  '/__nuxt',
  '/_nuxt',
  '/favicon',
  '/robots',
  '/sitemap',
  '/__',
]
const slugPattern = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/i

export async function handleEngage(event: H3Event) {
  const req = event.node.req
  if (req.method !== 'GET') return
  const url = req.url || '/'

  if (internalPrefixes.some((p) => url.startsWith(p))) return
  if (url.includes('.')) return
  if (!slugPattern.test(url)) return

  const rawCookie = req.headers.cookie || ''
  const cookies = rawCookie ? parse(rawCookie) : {}
  const existingVisitorId = cookies[VISITOR_COOKIE]

  const host = req.headers.host || ''
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const fullUrl = `${proto}://${host}${url}`

  // Build forwardable headers + serialized variant for requestBody.headers (key=value&... format)
  const baseForwardHeaders: Record<string, string> = {
    'X-Original-Url': fullUrl,
    'X-Referrer': req.headers.referer || '',
    'X-Browser-UserAgent': req.headers['user-agent'] || 'nuxt-app',
    'User-Agent': req.headers['user-agent'] ?? 'nuxt-app',
    'X-Remote-Client-Address': ((req.headers['x-forwarded-for'] as string) || '')
      .split(',')[0]
      .trim(),
  }

  function serializeHeadersForBody(obj: Record<string, string>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${k}=${encodeURIComponent(v ?? '')}`)
      .join('&')
  }

  const requestBody: any = {
    url: fullUrl,
    referrerUrl: req.headers.referer || '',
    headers: serializeHeadersForBody(baseForwardHeaders),
    browserUserAgent: req.headers['user-agent'] || 'nuxt-app',
    remoteClientAddress: baseForwardHeaders['X-Remote-Client-Address'],
    userIdentifier: '',
  }

  let pageviewId: string | undefined
  let newVisitorId: string | undefined
  let firstError: any | undefined
  // First attempt with existing visitor id (if any)
  try {
    const response: any = await extendedAnalytics.postPageviewServer(
      {
        apiKey: process.env.DELIVERY_KEY,
        externalVisitorId: existingVisitorId,
        requestBody,
      },
      {
        headers: baseForwardHeaders,
      }
    )
    pageviewId = response?.pageviewId
    if (response?.externalVisitorId && response.externalVisitorId !== existingVisitorId) {
      newVisitorId = response.externalVisitorId
    }
    if (pageviewId) {
      console.log('[engage] pageviewId', pageviewId, 'path', url, '(attempt 1)')
    }
  } catch (err) {
    firstError = err
    console.warn('[engage] track error (attempt 1)', err)
  }

  // Retry once WITHOUT externalVisitorId if first attempt failed entirely (no pageviewId)
  if (!pageviewId) {
    try {
      const response: any = await extendedAnalytics.postPageviewServer(
        {
          apiKey: process.env.DELIVERY_KEY,
          externalVisitorId: undefined,
          requestBody,
        },
        {
          headers: { ...baseForwardHeaders, 'X-Retry-No-Visitor': '1' },
        }
      )
      // Reflect retry header inside body headers for downstream parsing
      requestBody.headers = serializeHeadersForBody({
        ...baseForwardHeaders,
        'X-Retry-No-Visitor': '1',
      })
      pageviewId = response?.pageviewId
      if (response?.externalVisitorId && response.externalVisitorId !== existingVisitorId) {
        newVisitorId = response.externalVisitorId
      }
      if (pageviewId) {
        console.log('[engage] pageviewId', pageviewId, 'path', url, '(retry without visitor id)')
      }
    } catch (err) {
      if (firstError) {
        console.warn('[engage] track error (attempt 2)', err)
      }
    }
  }

  if (pageviewId) {
    ;(event.context as any).engagePageviewId = pageviewId
  }

  if (newVisitorId) {
    setCookie(event, VISITOR_COOKIE, newVisitorId, {
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
}
