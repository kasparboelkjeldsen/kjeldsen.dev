import type { EngageCollectBatch } from '~~/types/engage'

/**
 * Engagement collection, client side.
 *
 * For each pageview: how long the page was open and how much of that the visitor was actually
 * doing something, how far down they scrolled, and which outbound links they clicked. One batch
 * per pageview, sent when the page is left - a navigation, a tab close, a switch to another tab -
 * with sendBeacon so it survives the unload.
 *
 * The pageview id comes from the content response (useEngageInfo); until it is known nothing is
 * measured, so a page Engage never registered costs nothing here either.
 *
 * Nothing about the visitor lives in this file. The server adds the visitor id from its cookie.
 */
const IDLE_AFTER_MS = 5000

interface Pageview {
  id: string
  openedAt: number
  engagedMs: number
  activeSince: number | null
  idleTimer: ReturnType<typeof setTimeout> | null
  scrollPixels: number
  scrollPercent: number
  links: EngageCollectBatch['links']
  events: EngageCollectBatch['events']
  sent: boolean
}

export default defineNuxtPlugin(() => {
  const info = useEngageInfo()
  const router = useRouter()

  let current: Pageview | null = null

  function open(id: string) {
    current = {
      id,
      openedAt: Date.now(),
      engagedMs: 0,
      activeSince: Date.now(),
      idleTimer: null,
      scrollPixels: 0,
      scrollPercent: 0,
      links: [],
      events: [],
      sent: false,
    }
    scheduleIdle()
    measureScroll()
  }

  // Engaged time: the visitor counts as active from any input until five seconds of silence.
  function settleEngaged() {
    if (!current?.activeSince) return
    current.engagedMs += Date.now() - current.activeSince
    current.activeSince = null
  }

  function scheduleIdle() {
    if (!current) return
    if (current.idleTimer) clearTimeout(current.idleTimer)
    current.idleTimer = setTimeout(settleEngaged, IDLE_AFTER_MS)
  }

  function pulse() {
    if (!current) return
    if (!current.activeSince) current.activeSince = Date.now()
    scheduleIdle()
  }

  function measureScroll() {
    if (!current) return
    const doc = document.documentElement
    const bottom = window.scrollY + window.innerHeight
    const max = Math.max(doc.scrollHeight, 1)
    current.scrollPixels = Math.max(current.scrollPixels, Math.round(bottom))
    current.scrollPercent = Math.max(current.scrollPercent, Math.min(100, Math.round((bottom / max) * 100)))
  }

  function onScroll() {
    measureScroll()
    pulse()
  }

  // Outbound links only. Internal navigation is its own pageview.
  function onClick(e: MouseEvent) {
    pulse()
    const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!anchor || !current) return
    let url: URL
    try {
      url = new URL(anchor.href, location.href)
    } catch {
      return
    }
    if (url.origin === location.origin && !/^(mailto|tel):/.test(url.protocol)) return
    current.links.push({ href: url.href, timeClicked: new Date().toISOString() })
  }

  function send() {
    if (!current || current.sent) return
    settleEngaged()
    current.sent = true

    const batch: EngageCollectBatch = {
      pageviewId: current.id,
      timeOnPage: { totalTimeMillis: Date.now() - current.openedAt, engagedTimeMillis: current.engagedMs },
      scrollDepth: { pixels: current.scrollPixels, percentage: current.scrollPercent },
      links: current.links,
      events: current.events,
    }

    const body = new Blob([JSON.stringify(batch)], { type: 'application/json' })
    if (!navigator.sendBeacon?.('/api/engage/collect', body)) {
      void fetch('/api/engage/collect', { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  }

  // A new pageview id means a new page was registered: close the old one, open the new.
  watch(
    () => info.value.pageviewId,
    (id) => {
      if (current && current.id !== id) send()
      if (id && current?.id !== id) open(id)
    },
    { immediate: true }
  )

  router.beforeEach(() => {
    send()
  })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointerdown', pulse, { passive: true })
  window.addEventListener('keydown', pulse, { passive: true })
  window.addEventListener('click', onClick, { passive: true })
  window.addEventListener('pagehide', send)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') send()
  })
})
