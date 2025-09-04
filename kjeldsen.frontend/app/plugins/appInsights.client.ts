import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const connectionString = config.public.appInsights

  if (!connectionString) return

  const loadAI = async () => {
    const { ApplicationInsights } = await import('@microsoft/applicationinsights-web')
    const appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true,
        enableUnhandledPromiseRejectionTracking: true,
        // Avoid deprecated unload/beforeunload listeners
        disablePageUnloadEvents: true,
        disableFlushOnBeforeUnload: true,
      } as any,
    })
    appInsights.loadAppInsights()

    const userId = localStorage.getItem('userId') ?? crypto.randomUUID()
    localStorage.setItem('userId', userId)
    appInsights.setAuthenticatedUserContext(userId)

    nuxtApp.provide('appInsights', appInsights)
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(loadAI)
  } else {
    setTimeout(loadAI, 1500)
  }
})
