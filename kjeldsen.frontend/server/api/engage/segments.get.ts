import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const path = query.path as string

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path is required',
    })
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Construct the URL
  // <CMSHOST>/umbraco/engage/api/v1/segmentation/content/segments/<path>
  // Note: The path might need to be URL encoded if it contains special characters,
  // but usually for simple paths it's fine.
  // The user example: .../segments//zoo for /zoo.
  // It seems we append the path to the URL.

  const url = `${config.public.cmsHost}/umbraco/engage/api/v1/segmentation/content/segments${cleanPath}`

  try {
    const response = await $fetch(url, {
      headers: {
        'Api-Key': config.deliveryKey,
      },
    })
    return response
  } catch (error) {
    console.error('Failed to fetch segments:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch segments',
    })
  }
})
