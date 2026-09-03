/**
 * Preloads the fonts a first paint needs.
 *
 * The stylesheet is inlined, so the browser only learns about the font files once it has parsed
 * the CSS and laid out text that uses them. A preload in the head starts the download with the
 * HTML. Which files: read off the inlined @font-face rules themselves - the latin subset of the
 * regular weight of each family, plus the serif's italic, which the marks use above the fold -
 * so nothing here knows a hashed file name, and a rebuild that changes a font changes the
 * preloads with it. Parsed once per process; the CSS is fixed per build.
 */
// The latin subset's first range is written U+?? (a wildcard for U+0000-00FF) by the fonts module.
const LATIN = /U\+\?\?|U\+0000-00FF/i

let links: string[] | null = null

function collect(headHtml: string): string[] {
  const out: string[] = []
  for (const face of headHtml.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
    const family = face.match(/font-family:\s*["']?([^;"']+)/i)?.[1]?.trim()
    const weight = face.match(/font-weight:\s*(\d+)/i)?.[1] ?? '400'
    const style = face.match(/font-style:\s*(\w+)/i)?.[1] ?? 'normal'
    const range = face.match(/unicode-range:\s*([^;]+)/i)?.[1] ?? ''
    const src = face.match(/url\(["']?(\/_fonts\/[^)"']+\.woff2)["']?\)/i)?.[1]
    if (!family || !src || !LATIN.test(range) || weight !== '400') continue
    if (style === 'italic' && family !== 'Instrument Serif') continue
    out.push(`<link rel="preload" as="font" type="font/woff2" crossorigin href="${src}">`)
  }
  return out
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    if (event.context.blockPreview) return
    links ??= collect(html.head.join('\n'))
    if (links.length) html.head.unshift(...links)
  })
})
