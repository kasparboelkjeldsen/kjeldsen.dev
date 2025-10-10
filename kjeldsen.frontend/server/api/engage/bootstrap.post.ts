import { EngageClient } from '~~/server/api/engage/EngageClient'
import { parse } from 'cookie'

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'

// Single shared client
const engageClient = new EngageClient({ BASE: process.env.CMSHOST! })

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<any>(event).catch(() => ({}))
    const { url: clientUrl } = body || {}
    const req = event.node.req
    const rawCookie = req.headers.cookie || ''
    const cookies = rawCookie ? parse(rawCookie) : {}
    const existingVisitorId = cookies[VISITOR_COOKIE]

    // Build server-side request body similar to previous middleware
    const host = req.headers.host || ''
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
    const path = clientUrl || req.url || '/'
    const fullUrl = path.startsWith('http') ? path : `${proto}://${host}${path}`

    const requestBody: any = {
      url: fullUrl,
      referrerUrl: req.headers.referer || '',
      headers: '',
      browserUserAgent: req.headers['user-agent'] || 'nuxt-app',
      remoteClientAddress: ((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim(),
      userIdentifier: '',
    }

    let response: any
    try {
      response = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
        apiKey: process.env.DELIVERY_KEY,
        externalVisitorId: existingVisitorId,
        requestBody,
      })
    } catch (err) {
      // Retry without externalVisitorId
      try {
        response = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
          apiKey: process.env.DELIVERY_KEY,
          externalVisitorId: undefined,
          requestBody,
        })
      } catch (err2) {
        console.warn('[engage/bootstrap] failed', err2)
        return { ok: false }
      }
    }

    const pageviewId = response?.pageviewId
    const externalVisitorId = response?.externalVisitorId || existingVisitorId

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

    return { ok: true, pageviewId, externalVisitorId }
  } catch (e) {
    console.warn('[engage/bootstrap] unexpected error', e)
    return { ok: false }
  }
})
