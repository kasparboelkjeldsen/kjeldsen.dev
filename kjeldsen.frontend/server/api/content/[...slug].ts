import { DeliveryClient } from '@/../server/delivery-api'
import { useRuntimeConfig } from '#imports'
import { decryptSeg } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slug } = event.context.params!

  const forcedSegmentEncrypted = getHeader(event, 'forced-segment')
  const externalVisitorId = getHeader(event, 'External-Visitor-Id')
  let forcedSegment: string | null = null
  if (forcedSegmentEncrypted) {
    forcedSegment = await decryptSeg(forcedSegmentEncrypted)
    console.log('Forced-Segment header value:', forcedSegment)
    console.log('External Visitor Id', externalVisitorId)
  }

  // Disallow any path segment with a dot
  if (slug.includes('.')) {
    return null
  }

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
    HEADERS: externalVisitorId ? { 'External-Visitor-Id': externalVisitorId! } : undefined,
  })

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '/' + slug,
    })

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      })
    }

    return response
  } catch (e) {
    console.error(`Failed to fetch content for slug "${slug}"`, e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch content',
    })
  }
})
