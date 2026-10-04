/**
 * A Data Visio block: a dataset the editor pasted, and the chart script the model wrote for it.
 *
 * The script is the body of `(data, echarts, ctx) => option` - see
 * kjeldsen.backend/code/visio/DataVisioGenerator.cs for the contract it was written to. This
 * module is what both ends of the page share: the browser builds the live chart from it
 * (app/components/blocks/DataVisioChart.vue), the server renders a still of it for the first
 * paint and the backoffice preview (server/utils/visio.ts).
 */

export type VisioMeta = { aspect: number }

export type Visio = {
  /** The function body. */
  spec: string
  /** The dataset, parsed. */
  data: unknown
  meta: VisioMeta
  /** The model's description of the chart, for assistive tech and no-script readers. */
  summary: string
  caption: string
}

export const DEFAULT_ASPECT = 1.6

type BlockLike = { contentType?: string | null; properties?: unknown } | null | undefined

/** Reads a dataVisioBlock. Null when there is no chart to draw (no script, or a dataset that is not JSON). */
export function visioOf(block: BlockLike): Visio | null {
  if (!block || block.contentType !== 'dataVisioBlock') return null
  const p = (block.properties ?? {}) as Record<string, unknown>
  const spec = typeof p.spec === 'string' ? p.spec.trim() : ''
  if (!spec) return null

  let data: unknown
  try {
    data = JSON.parse(typeof p.dataset === 'string' ? p.dataset : 'null')
  } catch {
    return null
  }

  return {
    spec,
    data,
    meta: metaOf(p.meta),
    summary: typeof p.summary === 'string' ? p.summary.trim() : '',
    caption: typeof p.caption === 'string' ? p.caption.trim() : '',
  }
}

function metaOf(raw: unknown): VisioMeta {
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const m = JSON.parse(raw) as { aspect?: unknown }
      const aspect = typeof m.aspect === 'number' && m.aspect > 0.3 && m.aspect < 6 ? m.aspect : DEFAULT_ASPECT
      return { aspect }
    } catch {
      // Fall through to the default.
    }
  }
  return { aspect: DEFAULT_ASPECT }
}

/** Under this width the chart lays itself out for a phone or a half-width cell. */
export const COMPACT_BELOW = 480

/**
 * The box's height for a width. The model asked for an aspect ratio; a narrow box is not allowed
 * to go that wide-and-short (a 340 px phone would get a 150 px chart), and nothing gets taller
 * than a laptop viewport comfortably holds.
 */
export function visioHeight(width: number, aspect: number): number {
  const compact = width < COMPACT_BELOW
  const effective = compact ? Math.min(aspect, 1.25) : aspect
  const [min, max] = compact ? [300, 480] : [260, 600]
  return Math.round(Math.min(max, Math.max(min, width / effective)))
}

/** The site's palette, as the chart script sees it (`ctx.colors`). Mirrors @theme in main.css. */
export const VISIO_COLORS = {
  sky: '#7dd3fc',
  violet: '#a78bfa',
  ember: '#fb923c',
  gold: '#fcd34d',
  peach: '#fdba74',
  lavender: '#c4b5fd',
  mint: '#34d399',
  rose: '#f472b6',
  fg: '#e9ebf2',
  fg2: '#b7bccb',
  muted: '#7c8296',
  line: 'rgba(255,255,255,0.08)',
  line2: 'rgba(255,255,255,0.16)',
  surface: '#10131b',
  ink: '#07080c',
} as const

export const VISIO_PALETTE = [
  VISIO_COLORS.sky,
  VISIO_COLORS.violet,
  VISIO_COLORS.ember,
  VISIO_COLORS.gold,
  VISIO_COLORS.peach,
  VISIO_COLORS.lavender,
  VISIO_COLORS.mint,
  VISIO_COLORS.rose,
]

export const VISIO_FONTS = {
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  display: "'Instrument Serif', 'Iowan Old Style', Georgia, serif",
} as const

export type VisioContext = {
  width: number
  height: number
  compact: boolean
  span: number
  colors: typeof VISIO_COLORS
  palette: string[]
  fonts: typeof VISIO_FONTS
}

export function visioContext(width: number, height: number, span: number): VisioContext {
  return {
    width,
    height,
    compact: width < COMPACT_BELOW,
    span,
    colors: VISIO_COLORS,
    palette: VISIO_PALETTE,
    fonts: VISIO_FONTS,
  }
}

/**
 * What the host settles for every chart regardless of the script: a title that truncates with an
 * ellipsis at the box's width rather than running off it, a tooltip kept inside the box, and
 * smaller type in a compact box. The
 * script's own choices win where it made any. Applied to the option before it is drawn, on the
 * server and in the browser alike.
 */
export function tuneOption(option: object, ctx: VisioContext): object {
  const o = option as { title?: TitleLike | TitleLike[] }
  const titles = Array.isArray(o.title) ? o.title : o.title ? [o.title] : []
  for (const t of titles) {
    if (!t || typeof t !== 'object') continue
    t.textStyle = {
      ...(ctx.compact ? { fontSize: 14, lineHeight: 18 } : {}),
      width: ctx.width - 8,
      overflow: 'truncate',
      ...(t.textStyle ?? {}),
    }
    t.subtextStyle = {
      ...(ctx.compact ? { fontSize: 11.5, lineHeight: 15 } : {}),
      width: ctx.width - 8,
      overflow: 'truncate',
      ...(t.subtextStyle ?? {}),
    }
  }
  // The tooltip is drawn inside the chart's box, which clips: one placed by the finger near an
  // edge was cut off on a phone. Confined, ECharts keeps it inside the box instead.
  const tips = (option as { tooltip?: TooltipLike | TooltipLike[] }).tooltip
  for (const tip of Array.isArray(tips) ? tips : tips ? [tips] : []) {
    if (!tip || typeof tip !== 'object') continue
    tip.confine ??= true
    if (ctx.compact) {
      tip.padding ??= [6, 10]
      tip.textStyle = { fontSize: 12, ...(tip.textStyle ?? {}) }
    }
  }
  return o
}

type TitleLike = { textStyle?: Record<string, unknown>; subtextStyle?: Record<string, unknown> }
type TooltipLike = { confine?: boolean; padding?: unknown; textStyle?: Record<string, unknown> }

/**
 * The same guard the generator applies before storing a script, applied again where it runs.
 * A script edited by hand in the backoffice did not pass through the generator.
 */
const FORBIDDEN =
  /\b(document|window|globalThis|navigator|process|localStorage|sessionStorage|indexedDB)\s*[.[]|\b(fetch|eval|Function|setTimeout|setInterval|requestAnimationFrame|XMLHttpRequest|WebSocket|require|importScripts|postMessage|open|alert)\s*\(|\bimport\s*[(\s'"]/

export function specIsAllowed(spec: string): boolean {
  return !FORBIDDEN.test(spec)
}

/** The `ctx.width` to render a still at, for a block that spans this many of twelve columns. */
export function stillWidthFor(span: number): number {
  return span < 12 ? 400 : 860
}
