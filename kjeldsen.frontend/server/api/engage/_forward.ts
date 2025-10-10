import { defineEventHandler, readBody, getQuery, H3Event } from 'h3'

// Shared constants
const VISITOR_COOKIE = 'engage_visitor'

interface ForwardOptions {
  targetPath: string
}

async function performForward(event: H3Event, opts: ForwardOptions) {
  const config = useRuntimeConfig()
  const cmsHost = (config.public.cmsHost || '').replace(/\/$/, '')
  if (!cmsHost) {
    return { status: 'disabled', reason: 'cmsHost missing' }
  }

  const body = await readBody<any>(event)
  const query = getQuery(event)

  // Extract visitor id from cookie (server-side set previously by engage middleware)
  const visitorId = getCookie(event, VISITOR_COOKIE) || ''
  const pageviewGuid = (query.pageviewGuid as string) || body?.pageviewGuid

  if (!visitorId) {
    // Skip forwarding until we have an established visitor id; client can retry on next flush.
    return { status: 'skipped', reason: 'missing externalVisitorId cookie', pageviewGuid }
  }

  const enriched = {
    ...(body || {}), // merge original fields
    pageviewGuid,
    version: query.version || body?.version,
    externalVisitorId: visitorId,
    serverReceivedAt: new Date().toISOString(),
  }

  const targetUrl = `${cmsHost}/umbraco/engageextensions/pagedata/${opts.targetPath}`
  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'External-Visitor-Id': visitorId,
        'X-Forwarded-Pageview': pageviewGuid || '',
      },
      body: JSON.stringify(enriched),
    })
    const text = await res.text() // controller might not return JSON yet
    return { status: 'ok', upstreamStatus: res.status, body: text }
  } catch (err: any) {
    console.warn('[engage] forward error', err)
    return sendError(
      event,
      createError({ statusCode: 502, statusMessage: 'Engage forward failed' })
    )
  }
}

export function buildForwardHandler(targetPath: string) {
  return defineEventHandler(async (event) => {
    return performForward(event, { targetPath })
  })
}
