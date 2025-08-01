import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const connectionString = config.public.appInsights

  if (!connectionString) return

  const appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: true,
      enableUnhandledPromiseRejectionTracking: true,
    },
  })

  appInsights.loadAppInsights()

  // 🔹 Set user/session context
  const userId = localStorage.getItem('userId') ?? crypto.randomUUID()
  localStorage.setItem('userId', userId)

  appInsights.setAuthenticatedUserContext(userId)

  // Optional: Track custom session if needed (otherwise AI does this via cookies)
  // appInsights.context?.telemetryTrace.traceID = crypto.randomUUID();

  nuxtApp.provide('appInsights', appInsights)
})
