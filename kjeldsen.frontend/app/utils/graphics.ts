import type { IApiMediaWithCropsModel } from '~~/server/delivery-api'

/**
 * A `generatedGraphics` media item as the delivery API hands it over: the model's SVG, and the
 * GSAP timeline when the editor asked for one. The media type's properties ride along in
 * `properties` like any other media type's; this is the one place that reads them, so a renamed
 * alias is a one-line fix.
 */
export type GeneratedGraphic = { svg: string; script: string | null }

export const GENERATED_GRAPHICS = 'generatedGraphics'

export function generatedGraphicOf(
  media: IApiMediaWithCropsModel | { mediaType: string | null; properties: unknown } | null | undefined
): GeneratedGraphic | null {
  if (!media || media.mediaType !== GENERATED_GRAPHICS) return null

  const p = (media.properties ?? {}) as { svg?: unknown; script?: unknown; animate?: unknown }
  const svg = typeof p.svg === 'string' ? p.svg.trim() : ''
  if (!svg) return null

  // The script is only honoured while the editor has animation switched on, so turning it off
  // takes effect without a regeneration.
  const script = p.animate && typeof p.script === 'string' && p.script.trim() ? p.script : null
  return { svg, script }
}
