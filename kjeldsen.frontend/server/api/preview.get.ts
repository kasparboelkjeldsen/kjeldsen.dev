import { DeliveryClient } from '@/../server/delivery-api'
import { useRuntimeConfig } from '#imports'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const id = (query.id as string | undefined)?.trim()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
  })

  try {
    const response = await api.content.getContentItemById20({
      id,
      apiKey: config.deliveryKey,
      preview: true,
    })

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      })
    }

    return response
  } catch (e) {
    console.error(`Failed to fetch preview content for id "${id}"`, e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch preview content',
    })
  }
})
