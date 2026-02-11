import { DeliveryClient } from '@/../server/delivery-api'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slug } = event.context.params!

  const slugPath = Array.isArray(slug) ? slug.join('/') : slug

  // Priority for segment:
  // 1. X-Engage-Segment header (passed from useContent during SSR for first-time visitors)
  // 2. engageSegment cookie (subsequent requests)
  // 3. event.context.engageSegment (fallback)
  let segment: string | null = getHeader(event, 'X-Engage-Segment') || null
  if (!segment) {
    const cookie = getCookie(event, 'engageSegment')
    if (cookie && /^[A-Za-z0-9_-]{1,64}$/.test(cookie) && cookie !== 'default') {
      segment = cookie
    }
  }
  if (!segment && event.context.engageSegment && event.context.engageSegment !== 'default') {
    segment = event.context.engageSegment
  }

  // Same for visitor ID
  let externalVisitorId: string | null = getHeader(event, 'X-Engage-Visitor') || null
  if (!externalVisitorId) {
    externalVisitorId = getCookie(event, 'engage_visitor') || null
  }

  console.log('content api segment:', segment, 'visitor:', externalVisitorId)

  // Short-circuit internal multi-cache purge calls so they don't hit CMS
  if (slugPath?.startsWith('__nuxt_multi_cache/')) {
    return { ok: true }
  }

  // Disallow any path segment with a dot
  if (slugPath?.includes('.')) {
    return null
  }

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
  })

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '/' + slugPath,
      acceptSegment: segment || undefined,
      externalVisitorId: externalVisitorId || undefined,
    })

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      })
    }

    return response
  } catch (e) {
    console.error(`Failed to fetch content for slug "${slugPath}"`, e)

    // Treat not-found from CMS as a proper 404 instead of 500
    if (e instanceof Error && e.message.includes('Not Found')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch content',
    })
  }
})
