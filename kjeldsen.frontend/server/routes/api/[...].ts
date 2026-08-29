/**
 * Answers unmatched /api/ requests with a 404 instead of letting them reach the page renderer.
 *
 * Nitro prefers more specific routes, so every real handler under server/api still wins; this only
 * catches what nothing else matched. Without it, an unmatched API path is answered by SSR-ing the
 * catch-all page — and if that page's own data fetch is what missed, the render fetches itself,
 * recursively, until the worker dies with a heap OOM. That happened while building V2.
 */
export default defineEventHandler(() => {
  throw createError({ statusCode: 404, statusMessage: 'No such API route' })
})
