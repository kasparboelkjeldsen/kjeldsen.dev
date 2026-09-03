import type { PageContent } from '~~/types/content'

/**
 * A meta description for a page that has none.
 *
 * Posts carry one in their SEO composition; the home page and plain content pages do not, so
 * theirs is the first paragraph of their first rich text block, as plain text, cut at a word
 * boundary. Better than nothing, and the editor can still override it by giving the type the
 * composition.
 */
const MAX = 160

export function describe(content: PageContent | null | undefined): string | undefined {
  const grid = (content?.properties as { grid?: { items?: Array<{ content?: { contentType?: string | null; properties?: unknown } | null }> } | null } | null)?.grid
  for (const item of grid?.items ?? []) {
    const block = item.content
    if (block?.contentType !== 'rteBlock') continue
    const markup = (block.properties as { richText?: { markup?: string } | null } | undefined)?.richText?.markup ?? ''
    const text = markup
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\*\*|--/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!text) continue
    if (text.length <= MAX) return text
    const cut = text.slice(0, MAX)
    return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 80))}…`
  }
  return undefined
}
