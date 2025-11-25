import { DeliveryClient } from '@/../server/delivery-api'
import { useRuntimeConfig } from '#imports'
import { decryptSeg } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slug } = event.context.params!

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

  // Disallow any path segment with a dot
  if (slug.includes('.')) {
    return null
  }

  const headers: Record<string, string> = {}
  if (externalVisitorId) headers['External-Visitor-Id'] = externalVisitorId
  if (finalSegment) headers['Forced-Segment'] = finalSegment

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
    HEADERS: headers,
  })

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '/' + slug,
      forcedSegment: finalSegment || undefined,
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
