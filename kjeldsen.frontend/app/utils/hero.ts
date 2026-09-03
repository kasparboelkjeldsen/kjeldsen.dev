import type { RteBlockElementModel } from '~~/server/delivery-api'
import type { BlockGrid } from '~~/types/content'

export interface LiftedHero {
  /** The H1 block's title, plain text with markers, or null when the grid does not open with one. */
  title: string | null
  /** The first paragraph of the rich text that followed the H1, as its own block, if any. */
  lede: RteBlockElementModel | null
  /** Everything else, in order. Null when nothing is left. */
  rest: BlockGrid | null
}

/**
 * Lifts a page's opening blocks into its hero.
 *
 * Editors open most pages with an H1 header block and a paragraph, and the design sets those in
 * the hero rather than in the reading column. Both are taken out of the grid so they are not
 * rendered twice; when the rich text has more than one paragraph, the remainder stays where it
 * was, as the first block under the hero. A grid that opens some other way is returned untouched
 * with a null title, and the caller falls back to the node name.
 */
export function liftHero(grid: BlockGrid | null, withLede = true): LiftedHero {
  const items = grid?.items ?? []
  const first = items[0]?.content

  if (!grid || first?.contentType !== 'headerBlock') {
    return { title: null, lede: null, rest: grid }
  }

  const level = parseInt((first.properties?.headerLevel ?? '').replace(/\D/g, ''), 10)
  if (level !== 1) return { title: null, lede: null, rest: grid }

  const title = first.properties?.headerTitle || null
  let lede: RteBlockElementModel | null = null
  let skip = 1
  const carried: BlockGrid['items'] = []

  const second = items[1]
  if (withLede && second?.content?.contentType === 'rteBlock') {
    const markup = second.content.properties?.richText?.markup ?? ''
    const cut = markup.indexOf('</p>')
    if (cut >= 0) {
      lede = { ...second.content, properties: { richText: { markup: markup.slice(0, cut + 4), blocks: [] } } }
      skip = 2
      const remainder = markup.slice(cut + 4).trim()
      if (remainder) {
        carried.push({
          ...second,
          content: { ...second.content, properties: { richText: { markup: remainder, blocks: [] } } },
        })
      }
    }
  }

  const remaining = [...carried, ...items.slice(skip)]
  return { title, lede, rest: remaining.length ? { ...grid, items: remaining } : null }
}
