import vm from 'node:vm'
import { SVGRenderer } from 'echarts/renderers'
import { setupEcharts, THEME } from '~~/shared/echarts'
import { specIsAllowed, stillWidthFor, tuneOption, visioContext, visioHeight, visioOf } from '~~/shared/visio'
import type { AnyBlock } from '~~/types/content'

/**
 * A chart as a still, server side.
 *
 * ECharts can render to an SVG string without a DOM, so the page arrives with the chart already
 * drawn: no empty box before the script bundle lands, something for a reader without JavaScript
 * and for the backoffice preview, which shows markup and never runs scripts. The browser swaps
 * the still for the live chart once it scrolls into view.
 *
 * The script is model output and runs here on purpose, as it does in the browser. It gets a
 * fresh V8 context holding only its three arguments and a timeout; the generator refused
 * anything reaching for the document or the network before it was stored, and the same test runs
 * again here. Not a sandbox against a determined author - the editor who saved the block is
 * trusted with the page already, as with the rich text editor - but a tight fit for a bug.
 */
const TIMEOUT_MS = 800
let echarts: ReturnType<typeof setupEcharts> | null = null

export function renderVisioStill(block: AnyBlock, span = 12): string | null {
  const visio = visioOf(block)
  if (!visio || !specIsAllowed(visio.spec)) return null

  const width = stillWidthFor(span)
  const height = visioHeight(width, visio.meta.aspect)
  const ctx = visioContext(width, height, span)

  echarts ??= setupEcharts(SVGRenderer)

  let option: unknown
  try {
    const sandbox = vm.createContext({ data: visio.data, echarts, ctx })
    option = vm.runInContext(`(function (data, echarts, ctx) {\n${visio.spec}\n})(data, echarts, ctx)`, sandbox, {
      timeout: TIMEOUT_MS,
      filename: 'visio.js',
    })
  } catch (e) {
    console.warn('[visio] script failed on the server', e instanceof Error ? e.message : e)
    return null
  }
  if (!option || typeof option !== 'object') return null

  try {
    const chart = echarts.init(null, THEME, { renderer: 'svg', ssr: true, width, height })
    chart.setOption({ ...tuneOption(option, ctx), animation: false })
    const svg = chart.renderToSVGString({ useViewBox: true })
    chart.dispose()
    // Sized by CSS, not by the attributes: the still fills whatever box the live chart will.
    return svg.replace(/^<svg([^>]*?)\swidth="[^"]*"\sheight="[^"]*"/, '<svg$1')
  } catch (e) {
    console.warn('[visio] render failed on the server', e instanceof Error ? e.message : e)
    return null
  }
}

/** Adds `still` to a dataVisioBlock's properties, in place. Other blocks pass through. */
export function stillForVisio<T extends AnyBlock>(block: T, span = 12): T {
  if (block.contentType !== 'dataVisioBlock') return block
  const props = block.properties as { still?: string | null } | undefined
  if (props) props.still = renderVisioStill(block, span)
  return block
}
