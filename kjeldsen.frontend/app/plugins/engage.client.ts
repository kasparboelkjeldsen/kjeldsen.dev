// app/plugins/engage.client.ts
// -----------------------------------------------------------------------------
// Headless Engage tracking (client side)
// -----------------------------------------------------------------------------
// Responsibilities:
//  - Adopt server-provided pageview GUID (from SSR injected script) OR reuse cookie
//  - Track engaged time (active vs idle) and scroll depth
//  - Capture interesting link clicks (external, docs, anchors, mail/tel)
//  - Allow custom events via window.umbracoEngage.trackEvent / event.send
//  - Flush batched page data (links, events, timings) on visibility change / pagehide
//  - Keep pageview id in sync if the server replaces it early after load
//
// Not (yet) implemented: video tracking, form tracking, route change re-hydration.
// These can be layered in later without rewriting core logic.
// -----------------------------------------------------------------------------
// Debugging:
//  Enable verbose logging in the browser by either:
//    localStorage.setItem('engageDebug', '1')
//  OR set a global before Nuxt hydration:
//    <script>window.__ENGAGE_DEBUG = true</script>
//  You can also toggle at runtime: window.__ENGAGE_DEBUG = true
// -----------------------------------------------------------------------------
// TEMP: Forced debug mode (set to true to always emit debug logs)
const ALWAYS_DEBUG = true

interface EngageState {
  pageviewGuid: string | null
  version: number
  timeOnPageStart: number
  engagedMillis: number
  idle: boolean
  idleTimer: any
  scrollDepthPixels: number
  scrollDepthPercent: number
  links: Array<{ href: string; timeClicked: string }>
  events: any[]
}

declare global {
  interface Window {
    umbracoEngage?: any
    __engageBootstrapped?: boolean
    __serverPageviewId?: string
    __ENGAGE_DEBUG?: boolean
  }
}

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'

// ----------------------------------------------------------------------------------
// Utility helpers
// ----------------------------------------------------------------------------------

// Cheap feature flag for runtime debug logging.
function isDebug() {
  if (ALWAYS_DEBUG) return true
  // Original conditional logic (kept for easy reversion):
  // try {
  //   return !!(
  //     typeof window !== 'undefined' &&
  //     (window.__ENGAGE_DEBUG || localStorage.getItem('engageDebug') === '1')
  //   )
  // } catch {
  //   return false
  // }
  return false
}

function dbg(...args: any[]) {
  if (isDebug()) console.debug('[engage]', ...args)
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[-.$?*|{}()\[\]\\/+^]/g, '\\$&') + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1] || '') : undefined
}

function writeCookie(name: string, value: string, opts: { maxAge?: number; path?: string } = {}) {
  if (typeof document === 'undefined') return
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${opts.path || '/'}`,
    'SameSite=Lax',
  ]
  if (location.protocol === 'https:') parts.push('Secure')
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`)
  document.cookie = parts.join('; ')
}

function now() {
  return Date.now()
}

function engagedTracker(state: EngageState) {
  // Tracks "engaged" time (periods where the user is not idle). We treat any
  // input / scroll / movement as activity; after 5s of silence we close a segment.
  function pulse() {
    if (state.idle) {
      state.idle = false
      state.timeOnPageStart = now()
      dbg('user active → resume engaged segment')
    }
    clearTimeout(state.idleTimer)
    state.idleTimer = setTimeout(setIdle, 5000)
  }
  function setIdle() {
    if (!state.idle) {
      const end = now()
      state.engagedMillis += end - state.timeOnPageStart
      dbg('user idle → accumulate engagedMillis', state.engagedMillis)
    }
    state.idle = true
  }
  ;['mousedown', 'keydown', 'scroll', 'mousemove'].forEach((evt) =>
    window.addEventListener(evt, pulse, { passive: true })
  )
  pulse()
  return {
    ensureEngagedUpToDate: () => {
      if (!state.idle) {
        const end = now()
        state.engagedMillis += end - state.timeOnPageStart
        state.timeOnPageStart = end
      }
    },
  }
}

// Build api wrapper – now targets local forwarding endpoints (/api/engage/*)
// The server endpoints will enrich with external visitor id & forward to Umbraco custom extensions.
function buildApi(_base: string, state: EngageState) {
  const collectUrl = `/api/engage/collect`
  const collectEventUrl = `/api/engage/collect-event`

  function effectivePageviewId() {
    const serverGuid = window.__serverPageviewId
    if (serverGuid && state.pageviewGuid !== serverGuid) state.pageviewGuid = serverGuid
    return state.pageviewGuid
  }

  // All analytics sends now force fetch() so we can ALWAYS attach the External-Visitor-Id header.
  // (navigator.sendBeacon is skipped deliberately because it cannot set custom headers.)
  function sendTelemetry(url: string, payload: any, headers: Record<string, string> = {}) {
    try {
      const json = JSON.stringify(payload)
      const finalHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      }
      fetch(url, {
        method: 'POST',
        headers: finalHeaders,
        body: json,
        keepalive: true, // attempt to finish even on unload
      }).catch((err) => dbg('telemetry fetch error', err))
    } catch (e) {
      console.warn('[engage] telemetry error', e)
    }
  }

  // For local endpoints we only need pageview + version query (optional).
  function buildQuery(base: string, params: Record<string, string | number | undefined>) {
    const usp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) usp.set(k, String(v))
    })
    const qs = usp.toString()
    return qs ? `${base}?${qs}` : base
  }

  function collect() {
    const pv = effectivePageviewId()
    if (!pv) return
    const qUrl = buildQuery(collectUrl, {
      version: state.version,
      pageviewGuid: pv,
    })
    const payload = {
      pageviewGuid: pv,
      timeOnPage: getTimeOnPage(),
      scrollDepth: { pixels: state.scrollDepthPixels, percentage: state.scrollDepthPercent },
      links: state.links,
      events: state.events,
      videos: [],
      umbracoForms: [],
    }
    dbg('collect → beacon', {
      pageview: pv,
      links: payload.links.length,
      events: payload.events.length,
      scrollPct: payload.scrollDepth.percentage,
      engagedMs: payload.timeOnPage.engagedTimeMillis,
    })
    sendTelemetry(qUrl, payload)
    state.links = []
    state.events = []
  }

  function sendEvent(fields: any) {
    const pv = effectivePageviewId()
    const url = buildQuery(collectEventUrl, {
      pageviewGuid: pv || undefined,
    })
    dbg('event → send', { pv, fields })
    sendTelemetry(url, { ...fields, pageviewGuid: pv, timestamp: new Date().toISOString() })
  }

  function getTimeOnPage() {
    return {
      totalTimeMillis: now() - state.timeOnPageStart,
      engagedTimeMillis: state.engagedMillis,
    }
  }

  return { collect, sendEvent }
}

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return
  const config = useRuntimeConfig()
  const baseHost = (config.public.cmsHost || '').replace(/\/$/, '')
  if (!baseHost) {
    console.warn('[engage] missing cmsHost - tracking disabled')
    return
  }
  dbg('plugin load', { baseHost })

  const state: EngageState = {
    pageviewGuid: null,
    version: 5,
    timeOnPageStart: now(),
    engagedMillis: 0,
    idle: true,
    idleTimer: null,
    scrollDepthPixels: 0,
    scrollDepthPercent: 0,
    links: [],
    events: [],
  }

  const engaged = engagedTracker(state)
  const api = buildApi(baseHost, state)

  function recordScroll() {
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop
    const viewportHeight = window.innerHeight
    const viewportBottom = viewportHeight + scrollPos
    const pct = Math.round((Math.min(viewportBottom, docHeight) / docHeight) * 100)
    let changed = false
    if (pct > state.scrollDepthPercent) {
      state.scrollDepthPercent = pct
      changed = true
    }
    if (viewportBottom > state.scrollDepthPixels) {
      state.scrollDepthPixels = Math.floor(viewportBottom)
      changed = true
    }
    // Only log meaningful deltas (10% increments)
    if (changed && state.scrollDepthPercent % 10 === 0) {
      dbg('scroll depth', {
        pct: state.scrollDepthPercent,
        px: state.scrollDepthPixels,
      })
    }
  }
  window.addEventListener('scroll', () => recordScroll(), { passive: true })
  recordScroll()

  function recordLinkClicks(e: MouseEvent) {
    const target = (e.target as HTMLElement)?.closest?.('a') as HTMLAnchorElement | null
    if (!target || !target.href) return
    const href = target.href
    const currentDomain = location.origin
    const isExternal = href.startsWith('http') && !href.startsWith(currentDomain)
    const isDoc = /\.(?:pdf|doc|docx)(?:[?#]|$)/i.test(href)
    const isAnchor = href.startsWith('#') || href.startsWith(currentDomain + '/#')
    const isMailTel = href.startsWith('mailto:') || href.startsWith('tel:')
    if (isExternal || isDoc || isAnchor || isMailTel) {
      state.links.push({ href, timeClicked: new Date().toISOString() })
      dbg('link captured', { href, isExternal, isDoc, isAnchor, isMailTel })
    }
  }
  document.addEventListener('click', recordLinkClicks, { passive: true })
  document.addEventListener('auxclick', recordLinkClicks, { passive: true })

  function init(guid: string) {
    if (!guid) return
    const serverGuid = window.__serverPageviewId
    if (serverGuid && guid !== serverGuid) guid = serverGuid
    state.pageviewGuid = guid
    if (!window.__engageBootstrapped) {
      window.__engageBootstrapped = true
      console.info('[engage] initialized', { guid })
    } else {
      dbg('init called again (ignored)', { guid })
    }
  }

  function bootstrapFromLegacyCookies() {
    if (window.__engageBootstrapped) return
    const serverGuid = window.__serverPageviewId
    const cookiePv = readCookie(PAGEVIEW_COOKIE) || readCookie('umbraco__engage_pv')
    const guid = serverGuid || cookiePv
    dbg('bootstrap (legacy)', { serverGuid, cookiePv, chosen: guid })
    if (guid) init(guid)
  }

  function handleEngageReady(evt?: Event) {
    try {
      const detail: any = (evt as CustomEvent)?.detail || (window as any).__engage
      if (!detail) return
      const { pageviewId } = detail
      if (pageviewId) {
        dbg('engage:ready received', { pageviewId })
        init(pageviewId)
      }
    } catch (e) {
      dbg('engage:ready handler error', e)
    }
  }

  // Listen for the new client bootstrap event dispatched by useEngage composable.
  window.addEventListener('engage:ready', handleEngageReady, { once: true })

  // Fallback timer: if after a short delay we still have not bootstrapped via composable
  // (e.g., composable not used on a page) we fall back to legacy cookie bootstrap.
  setTimeout(() => {
    if (!window.__engageBootstrapped) {
      dbg('fallback to legacy bootstrap (no engage:ready event)')
      bootstrapFromLegacyCookies()
    }
  }, 1500)
  ;(function ensureConsistency(attempt = 0) {
    if (attempt > 40) return
    const serverGuid = window.__serverPageviewId
    if (serverGuid && state.pageviewGuid !== serverGuid) {
      state.pageviewGuid = serverGuid
      dbg('consistency sync → updated pageviewGuid', { serverGuid, attempt })
    }
    if (!serverGuid || state.pageviewGuid !== serverGuid)
      setTimeout(() => ensureConsistency(attempt + 1), 50)
  })()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      engaged.ensureEngagedUpToDate()
      dbg('visibilitychange: hidden → flush collect')
      api.collect()
    }
  })
  window.addEventListener('pagehide', () => {
    engaged.ensureEngagedUpToDate()
    dbg('pagehide → flush collect')
    api.collect()
  })

  window.umbracoEngage = window.umbracoEngage || {}
  window.umbracoEngage.analytics = window.umbracoEngage.analytics || {}
  window.umbracoEngage.analytics.init = init
  window.umbracoEngage.trackEvent = (fields: any) => api.sendEvent(fields)
  window.umbracoEngage.event = { send: (fields: any) => api.sendEvent(fields) }

  document.dispatchEvent(new Event('umbracoEngageAnalyticsReady'))
  dbg('dispatched umbracoEngageAnalyticsReady')

  // We no longer immediately bootstrap; we rely on engage:ready event or fallback
  dbg('awaiting engage:ready or fallback', { pageviewGuid: state.pageviewGuid })
})
