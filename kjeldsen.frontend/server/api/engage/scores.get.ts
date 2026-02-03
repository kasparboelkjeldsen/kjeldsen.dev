import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const externalVisitorId = query.externalVisitorId as string

  if (!externalVisitorId) {
    // If no visitor ID, return empty list or handle gracefully
    return []
  }

  const url = `${config.public.cmsHost}/umbraco/engageextensions/pageview/scores`

  try {
    const response = await $fetch(url, {
      query: { externalVisitorId },
      headers: {
        'Api-Key': config.deliveryKey,
      },
    })
    return response
  } catch (error) {
    console.error('Failed to fetch scores:', error)
    // Return empty array on error to prevent frontend crash
    return []
  }
})
