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

  // Helper to make the actual request
  const fetchContent = async (visitorId: string | null) => {
    return api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: slugPath,
      acceptSegment: segment || undefined,
      externalVisitorId: visitorId || undefined,
    })
  }

  try {
    const response = await fetchContent(externalVisitorId)

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      })
    }

    return response
  } catch (e: any) {
    // Check if this is an invalid visitor ID error from Umbraco Engage
    const errorBody = e?.body || e?.message || ''
    const isInvalidVisitorError = 
      typeof errorBody === 'string' && errorBody.includes('External Visitor Id does not exist') ||
      typeof errorBody === 'object' && errorBody?.detail?.includes('External Visitor Id does not exist')

    if (isInvalidVisitorError && externalVisitorId) {
      console.warn(`[content API] Invalid visitor ID "${externalVisitorId}", clearing cookie and retrying without it`)
      
      // Clear the invalid cookies
      deleteCookie(event, 'engage_visitor')
      deleteCookie(event, 'engageSegment')
      
      // Retry without visitor ID
      try {
        const retryResponse = await fetchContent(null)
        if (retryResponse) {
          return retryResponse
        }
      } catch (retryError) {
        console.error(`Retry also failed for slug "${slugPath}"`, retryError)
      }
    }

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
