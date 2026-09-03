/**
 * Image URL helpers.
 *
 * CMS media is addressed `/api/media/...` and resized by width through that route, which signs the
 * request (server/utils/media.ts). Widths stop at 2000, the largest the route will sign.
 *
 * Unsplash covers the places the CMS has no picture for: the home page when no background is set,
 * the listing pages, the error page. Hotlinked through Unsplash's own image CDN with explicit
 * widths, so a phone never downloads a desktop backdrop.
 */
export function withWidth(url: string, width: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`
}

export function cmsSrcset(url: string, widths: number[] = [800, 1200, 1600, 2000]): string {
  return widths.map((w) => `${withWidth(url, w)} ${w}w`).join(', ')
}

export const UNSPLASH = {
  /** Earth at night: city lights against the dark, warm on cool. */
  earth: '1451187580459-43490279c0fa',
  /** A nebula in blues and violets. */
  nebula: '1462331940025-496dfbfc7564',
  /** The Milky Way over a ridge line. */
  milkyWay: '1419242902214-272b3f66ee7a',
  /** Stars over still water. */
  stars: '1465101162946-4377e57745c3',
} as const

export function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=72&auto=format&fit=crop`
}

export function unsplashSrcset(id: string, widths: number[] = [960, 1600, 2200]): string {
  return widths.map((w) => `${unsplash(id, w)} ${w}w`).join(', ')
}
