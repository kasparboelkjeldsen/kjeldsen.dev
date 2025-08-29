import { DeliveryClient } from '@/../server/delivery-api'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
  })

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '',
    })

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Navigation not found',
      })
    }

    return response
  } catch (e) {
    console.error('Failed to fetch navigation', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch navigation',
    })
  }
})
