/**
 * What the content route tells the browser about Engage, alongside the page.
 *
 * Enough for the client to attach engagement data to the right pageview, and for debugging which
 * variant was served. Never the visitor id: that stays in an httpOnly cookie.
 */
export interface EngageInfo {
  /** Engage's id for this pageview, when it was registered in time. */
  pageviewId: string | null
  /** The segment alias the page was served for, or null for the default variant. */
  segment: string | null
}

/** A batch of engagement data for one pageview, sent by the client when the page is left. */
export interface EngageCollectBatch {
  pageviewId: string
  timeOnPage: { totalTimeMillis: number; engagedTimeMillis: number }
  scrollDepth: { pixels: number; percentage: number }
  links: Array<{ href: string; timeClicked: string }>
  events: Array<{ category: string; action: string; label: string; timestamp: string }>
}

/** A single custom event, tracked immediately. */
export interface EngageEvent {
  pageviewId: string
  category: string
  action?: string
  label?: string
}
