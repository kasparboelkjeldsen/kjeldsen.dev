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
  if (span < 12) return '(min-width: 48rem) 20rem, 100vw'
  if (shape === 'Square') return '(min-width: 48rem) 36rem, 100vw'
  return '(min-width: 64rem) 54rem, 100vw'
}
