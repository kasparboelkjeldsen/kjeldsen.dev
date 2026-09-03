import type { ComputedRef, InjectionKey } from 'vue'

/** The grid columns (of twelve) the current block occupies. Provided by BlockResolver. */
export const BLOCK_SPAN: InjectionKey<ComputedRef<number>> = Symbol('blockSpan')

/**
 * The `sizes` attribute for an image in a block, from the columns it spans.
 *
 * Tells the browser how wide the image will be laid out before any CSS has arrived, so it picks
 * the smallest candidate that covers it. A full-width block breaks out to about 54rem on a large
 * screen; a half-width one shares the 44rem column with its neighbour; a square image is
 * centred at 36rem at most.
 */
export function sizesFor(span: number, shape: 'Square' | 'Ratio' | 'Slim' | string): string {
  // On a phone the picture is the viewport minus the column's padding (1.25rem a side), not
  // the viewport: a hint that is a few percent too wide makes the browser take the next rung up.
  const phone = 'calc(100vw - 2.5rem)'
  if (span < 12) return `(min-width: 48rem) 20rem, ${phone}`
  if (shape === 'Square') return `(min-width: 48rem) 36rem, ${phone}`
  return `(min-width: 64rem) 54rem, (min-width: 48rem) calc(100vw - 4rem), ${phone}`
}
