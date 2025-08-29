import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body?.username) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: 'Username is required.' })
    )
  }

  const response = await $fetch(`${config.public.cmsHost}/api/murder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      MurderKey: config.murderKey,
    },
    body: {
      username: body.username,
    },
  }).catch((error) => {
    console.error('Failed to push murder:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to push murder.',
    })
  })

  return response
})
