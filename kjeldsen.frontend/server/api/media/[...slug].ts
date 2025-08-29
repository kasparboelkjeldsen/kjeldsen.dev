import { useRuntimeConfig, getQuery } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { slug } = event.context.params!
  const query = getQuery(event)

  const cms = config.public.cmsHost

  // Rebuild query string
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const imageUrl = `${cms}/media/${slug}${queryString ? `?${queryString}` : ''}`.replace(
    /([^:]\/)\/+/g,
    '$1'
  )
  console.log(`Fetching image from: ${imageUrl}`)
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `Failed to fetch image: ${response.statusText}`,
    })
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream'
  const buffer = await response.arrayBuffer()

  event.node.res.setHeader('Content-Type', contentType)
  return Buffer.from(buffer)
})
