import type { EngageInfo } from '~~/types/engage'

/**
 * What the current page knows about Engage.
 *
 * Set by useContentByPath from the content response, read by the client plugin to attach
 * engagement data to the right pageview, and by anything that wants to track an event.
 */
export function useEngageInfo() {
  return useState<EngageInfo>('engage', () => ({ pageviewId: null, segment: null }))
}

/**
 * Tracks a custom event against the current pageview.
 *
 * Fire and forget: analytics never blocks the interface, and a lost event is a lost event. Does
 * nothing on the server or before the pageview is known.
 */
export function useEngage() {
  const info = useEngageInfo()

  function trackEvent(category: string, action?: string, label?: string): void {
    if (import.meta.server) return
    const pageviewId = info.value.pageviewId
    if (!pageviewId) return

    void $fetch('/api/engage/event', {
      method: 'POST',
      body: { pageviewId, category, action, label },
      keepalive: true,
    }).catch(() => {})
  }

  return { info, trackEvent }
}
