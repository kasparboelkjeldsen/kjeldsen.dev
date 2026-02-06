import { DeliveryClient } from '@/../server/delivery-api'
import { useRuntimeConfig } from '#imports'
import { decryptSeg } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slug } = event.context.params!

  const slugPath = Array.isArray(slug) ? slug.join('/') : slug

  const manualSegment = getHeader(event, 'Manual-Segment')
  const forcedSegmentEncrypted = getHeader(event, 'Forced-Segment')
  const externalVisitorId = getHeader(event, 'External-Visitor-Id')

  let finalSegment: string | null = null
  console.log(manualSegment, forcedSegmentEncrypted)
  if (manualSegment) {
    finalSegment = manualSegment
  } else if (forcedSegmentEncrypted) {
    finalSegment = forcedSegmentEncrypted
  }

  if (externalVisitorId) {
    console.log('External Visitor Id', externalVisitorId)
  }

  // Short-circuit internal multi-cache purge calls so they don't hit CMS
  if (slugPath.startsWith('__nuxt_multi_cache/')) {
    return { ok: true }
  }

  // Disallow any path segment with a dot
  if (slugPath.includes('.')) {
    return null
  }

  const headers: Record<string, string> = {}
  //if (externalVisitorId) headers['External-Visitor-Id'] = externalVisitorId
  //if (finalSegment) headers['Forced-Segment'] = finalSegment

  console.log('final forced segment', headers['Forced-Segment'])
  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
    HEADERS: headers,
  })

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '/' + slugPath,
      forcedSegment: finalSegment || undefined,
      acceptSegment: finalSegment || undefined,
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
