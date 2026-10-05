import type { IApiMediaWithCropsModel } from '../server/delivery-api'

/**
 * A `generatedGraphics` media item as the delivery API hands it over: the model's SVG, the GSAP
 * timeline when the editor asked for one, and enough identity to address it as a file. The media
 * type's properties ride along in `properties` like any other media type's; this is the one place
 * that reads them, so a renamed alias is a one-line fix.
 */
export type GeneratedGraphic = {
  id: string
  svg: string
  script: string | null
  /** When the drawing was last (re)generated; the SVG file URL varies on it. */
  updateDate: string | null
}

export const GENERATED_GRAPHICS = 'generatedGraphics'

type MediaLike = { id?: string; mediaType: string | null; properties: unknown } | null | undefined

export function generatedGraphicOf(media: IApiMediaWithCropsModel | MediaLike): GeneratedGraphic | null {
  if (!media || media.mediaType !== GENERATED_GRAPHICS || !media.id) return null

  const p = (media.properties ?? {}) as { svg?: unknown; script?: unknown; animate?: unknown; updateDate?: unknown }
  const svg = typeof p.svg === 'string' ? p.svg.trim() : ''
  if (!svg) return null

  // The script is only honoured while the editor has animation switched on, so turning it off
  // takes effect without a regeneration.
  const script = p.animate && typeof p.script === 'string' && p.script.trim() ? p.script : null
  const updateDate = typeof p.updateDate === 'string' ? p.updateDate : null
  return { id: media.id, svg, script, updateDate }
}

/**
 * The drawing as a file on this origin. The revision in the query keeps a regenerated drawing from
 * being served stale by Front Door, which caches /api/media/*.
 */
export function graphicFileUrl(graphic: Pick<GeneratedGraphic, 'id' | 'updateDate'>): string {
  return `/api/media/svg/${graphic.id}.svg${revisionQuery(graphic)}`
}

/** The size the CMS rasterises a social card at (GeneratedGraphicsFileController). */
export const CARD_SIZE = { width: 1200, height: 630 } as const

/**
 * The drawing as a social card, for `og:image`: a JPEG of CARD_SIZE, cropped to fill it the way
 * the hero backdrop is. Hardly any social network renders an SVG card.
 */
export function graphicCardUrl(graphic: Pick<GeneratedGraphic, 'id' | 'updateDate'>): string {
  return `/api/media/card/${graphic.id}.jpg${revisionQuery(graphic)}`
}

function revisionQuery(graphic: Pick<GeneratedGraphic, 'updateDate'>): string {
  const revision = graphic.updateDate ? Date.parse(graphic.updateDate) : NaN
  return Number.isFinite(revision) ? `?v=${revision}` : ''
}

/**
 * The root tag's `preserveAspectRatio` decides whether a drawing letterboxes inside a box of a
 * different shape (`meet`, what the generator asks for) or fills it and crops (`slice`). A hero
 * backdrop and a listing card want the latter.
 */
export function coverSvg(svg: string): string {
  return svg.replace(/^(\s*<svg\b[^>]*?)(\spreserveAspectRatio="[^"]*")?([^>]*>)/i, '$1 preserveAspectRatio="xMidYMid slice"$3')
}
