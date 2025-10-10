import { useState } from '#imports'

interface EngageState {
  ready: boolean
  pageviewId?: string
  externalVisitorId?: string
  error?: string
}

export function useEngage() {
  const state = useState<EngageState>('engage-bootstrap', () => ({ ready: false }))

  async function bootstrap(url?: string) {
    if (state.value.ready) return state.value
    try {
      const res = (await $fetch('/api/engage/bootstrap', {
        method: 'POST',
        body: { url: url || window.location.pathname + window.location.search },
      })) as any
      if (!res?.ok) {
        state.value.error = 'bootstrap-failed'
        return state.value
      }
      state.value.pageviewId = res.pageviewId
      state.value.externalVisitorId = res.externalVisitorId
      state.value.ready = true
      // Expose globally for engage.client.ts to latch onto
      if (typeof window !== 'undefined') {
        ;(window as any).__engage = {
          pageviewId: res.pageviewId,
          externalVisitorId: res.externalVisitorId,
          ready: true,
        }
        window.dispatchEvent(new CustomEvent('engage:ready', { detail: (window as any).__engage }))
      }
    } catch (e) {
      state.value.error = 'exception'
    }
    return state.value
  }

  return { state, bootstrap }
}
