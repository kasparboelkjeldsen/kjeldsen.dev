import { ApplicationInsights } from '@microsoft/applicationinsights-web'

export const useAppInsights = () => {
  const ai = useNuxtApp().$appInsights as ApplicationInsights | undefined

  return {
    trackEvent: ai?.trackEvent?.bind(ai),
    trackException: ai?.trackException?.bind(ai),
    trackTrace: ai?.trackTrace?.bind(ai),
    trackPageView: ai?.trackPageView?.bind(ai),
    raw: ai,
  }
  
}
