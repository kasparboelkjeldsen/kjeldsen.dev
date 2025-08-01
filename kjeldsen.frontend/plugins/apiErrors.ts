import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const { trackException } = useAppInsights()

  nuxtApp.hook('app:error', (error) => {
    trackException?.({
      exception: error,
      properties: {
        type: 'nuxt-app-error',
      },
    })
  })
})
