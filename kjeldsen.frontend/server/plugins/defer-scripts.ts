/**
 * Loads the client bundle after the page has loaded, not alongside it.
 *
 * Every page is rendered on the server, so the script only adds navigation without reloads and
 * the entrance animations. Nuxt still asks for it in the head, at the same priority as the hero
 * picture and the fonts, and on a slow connection the three share the bandwidth: the picture the
 * visitor is looking at waits for a bundle they are not. This takes the entry script and its
 * modulepreload hints out of the head and puts them back from a few bytes of inline script once
 * the browser has painted the largest content above the fold, or after a short ceiling, so
 * hydration is never held for long.
 *
 * Links are ordinary anchors until then, so the page works in the gap. The block preview keeps the
 * default: the editor wants the fastest hydration, not the fastest picture. DEFER_SCRIPTS=0 in
 * the environment switches it off without a rebuild.
 */
const MODULEPRELOAD = /<link rel="modulepreload"[^>]*href="([^"]+)"[^>]*>\s*/g
const ENTRY = /<script type="module" src="([^"]+)"[^>]*><\/script>\s*/

// How long to wait for the paint before starting the bundle regardless.
const CEILING_MS = 2000

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    if (event.context.blockPreview || process.env.DEFER_SCRIPTS === '0') return

    const found = { entry: '', preloads: [] as string[] }

    html.head = html.head.map((chunk) => {
      let out = chunk.replace(MODULEPRELOAD, (_, href: string) => {
        found.preloads.push(href)
        return ''
      })
      out = out.replace(ENTRY, (_, src: string) => {
        found.entry = src
        return ''
      })
      return out
    })

    if (!found.entry) return

    // Start the bundle once the browser reports a largest-contentful-paint entry, which it does
    // after the largest thing above the fold - the hero picture, or the title - has been put on
    // screen. The ceiling covers browsers without the entry, hidden tabs, and pages where nothing
    // qualifies.
    const loader = [
      '(function(){var d=document,h=d.head,done=false;',
      'function go(){if(done)return;done=true;',
      `${JSON.stringify(found.preloads)}.forEach(function(u){var l=d.createElement("link");l.rel="modulepreload";l.as="script";l.crossOrigin="";l.href=u;h.appendChild(l)});`,
      `var s=d.createElement("script");s.type="module";s.crossOrigin="";s.src=${JSON.stringify(found.entry)};h.appendChild(s)}`,
      'try{new PerformanceObserver(function(){setTimeout(go,0)}).observe({type:"largest-contentful-paint",buffered:true})}catch(e){go()}',
      `setTimeout(go,${CEILING_MS})})()`,
    ].join('')

    html.head.push(`<script>${loader}</script>`)
  })
})
