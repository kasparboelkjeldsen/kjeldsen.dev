import { useState } from '#imports'

/** Server response from /api/engage/bootstrap */
interface EngageBootstrapResponse {
  ok: boolean
  pageviewId?: string
  externalVisitorId?: string
  /** "anon" means no personalization; any other value = personalized segment */
  segment?: string
  segmentEmptyBeforeParsing: boolean
}

export interface EngageState {
  ready: boolean
  pageviewId?: string
  externalVisitorId?: string
  error?: 'bootstrap-failed' | 'exception'
  segment?: string
}

/** Key to prevent accidental infinite reload loops */
const RELOAD_FLAG = 'engage:reloaded-once'

/**
 * Reload the current page in a way that triggers view transitions.
 * Creates a temporary link and clicks it to simulate user navigation,
 * which properly triggers the CSS @view-transition rules.
 */
function reloadWithViewTransition(): void {
  // Mark that we've reloaded once to avoid loops
  try {
    sessionStorage.setItem(RELOAD_FLAG, '1')
  } catch {
    /* ignore */
  }

  if (typeof window === 'undefined') return

  // Create a temporary link to the current URL and simulate a click
  // This triggers the view transition because it's treated as regular navigation
  const link = document.createElement('a')
  link.href = window.location.href
  link.style.display = 'none'

  // Add to DOM temporarily
  document.body.appendChild(link)

  // Simulate click to trigger view transition
  requestAnimationFrame(() => {
    link.click()
    // Clean up
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link)
      }
    }, 100)
  })
}

export function useEngage() {
  const state = useState<EngageState>('engage-bootstrap', () => ({ ready: false }))

  async function bootstrap(url?: string): Promise<EngageState> {
    if (state.value.ready) return state.value

    // If we reloaded once already in this tab, clear the flag so future navigations can happen.
    const reloadedOnce =
      typeof window !== 'undefined' && sessionStorage.getItem(RELOAD_FLAG) === '1'
    if (reloadedOnce) {
      try {
        sessionStorage.removeItem(RELOAD_FLAG)
      } catch {
        /* ignore */
      }
    }

    try {
      const res = await $fetch<EngageBootstrapResponse>('/api/engage/bootstrap', {
        method: 'POST',
        body: {
          url:
            url ||
            (typeof window !== 'undefined'
              ? window.location.pathname + window.location.search
              : undefined),
        },
      })

      if (!res?.ok) {
        state.value.error = 'bootstrap-failed'
        return state.value
      }

      state.value.segment = res.segment
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

      // If we just became personalized and we haven't already reloaded once in this tab,
      // perform a hard reload to fetch the SSR/edge-cached, personalized variant.
      if (
        res.segment &&
        res.segment !== 'anon' &&
        !reloadedOnce &&
        typeof window !== 'undefined' &&
        res.segmentEmptyBeforeParsing
      ) {
        // Optional: small delay so logs/UX can show something before transition
        requestAnimationFrame(() => reloadWithViewTransition())
      }

      return state.value
    } catch {
      state.value.error = 'exception'
      return state.value
    }
  }

  return { state, bootstrap }
}
