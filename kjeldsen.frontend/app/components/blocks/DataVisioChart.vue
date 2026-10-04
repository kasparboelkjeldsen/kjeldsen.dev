<template>
  <!-- The box has its height from the start: CSS derives it from the aspect ratio the model asked
       for with the same clamp as visioHeight() in shared/visio.ts, so nothing shifts when the live
       chart replaces the still. The still is server-rendered SVG; the canvas goes on top of it
       once the chart is built. -->
  <div ref="host" class="visio" :class="{ 'is-live': live }" :style="{ '--aspect': String(aspect) }" role="img" :aria-label="summary || undefined">
    <div v-if="still" class="visio-still" aria-hidden="true" v-html="still" />
    <p v-else-if="summary" class="visio-fallback">{{ summary }}</p>
    <div ref="canvas" class="visio-live" />
  </div>
</template>

<script setup lang="ts">
  /**
   * A Data Visio chart, live.
   *
   * Builds the ECharts instance when the box scrolls into view - so the entrance animation is
   * seen, not spent off-screen - and rebuilds the option whenever the box crosses the compact
   * breakpoint, since the script lays itself out differently for a phone. Resizes follow the box
   * through a ResizeObserver.
   *
   * The script is model output, executed on the page on purpose - the editor who saved the block
   * chose that. It is given the parsed dataset, the ECharts module and a description of the box,
   * and the generator refused anything reaching for the document or the network before storing.
   */
  import { CanvasRenderer } from 'echarts/renderers'
  import { setupEcharts, THEME } from '~~/shared/echarts'
  import { COMPACT_BELOW, specIsAllowed, tuneOption, visioContext } from '~~/shared/visio'

  const props = defineProps<{
    spec: string
    data: unknown
    aspect: number
    summary?: string
    still?: string | null
    span?: number
  }>()

  type Chart = { setOption(o: object, opts?: object): void; resize(): void; dispose(): void; dispatchAction(a: object): void }

  const host = ref<HTMLElement | null>(null)
  const canvas = ref<HTMLElement | null>(null)
  const live = ref(false)

  let chart: Chart | null = null
  let build: ((data: unknown, echarts: unknown, ctx: unknown) => unknown) | null = null
  let compact: boolean | null = null
  let observer: IntersectionObserver | null = null
  let resizer: ResizeObserver | null = null
  let echarts: ReturnType<typeof setupEcharts> | null = null

  function option(width: number, height: number): object | null {
    if (!build || !echarts) return null
    try {
      const ctx = visioContext(width, height, props.span ?? 12)
      const result = build(props.data, echarts, ctx)
      return result && typeof result === 'object' ? tuneOption(result as object, ctx) : null
    } catch (error) {
      console.warn('data visio: chart script failed', error)
      return null
    }
  }

  function layout() {
    if (!host.value || !canvas.value) return
    const width = host.value.clientWidth
    const height = host.value.clientHeight
    if (!width || !height) return

    const isCompact = width < COMPACT_BELOW
    if (chart && isCompact === compact) {
      chart.resize()
      return
    }
    compact = isCompact
    const o = option(width, height)
    if (!o) return
    if (!chart) {
      chart = echarts!.init(canvas.value, THEME, { renderer: 'canvas' }) as unknown as Chart
    }
    // notMerge: the script's option is the whole truth for this layout.
    chart.setOption(o, { notMerge: true })
    chart.resize()
    live.value = true
  }

  async function start() {
    if (!host.value || !canvas.value) return
    if (!specIsAllowed(props.spec)) {
      console.warn('data visio: chart script refused')
      return
    }
    echarts = setupEcharts(CanvasRenderer)
    try {
      build = new Function('data', 'echarts', 'ctx', props.spec) as typeof build
    } catch (error) {
      console.warn('data visio: chart script does not parse', error)
      return
    }
    layout()
    resizer = new ResizeObserver(() => layout())
    resizer.observe(host.value)
    document.addEventListener('pointerdown', hideTipOutside, { passive: true })
  }

  // A tooltip opened by a tap stays until the next tap inside the chart; a tap anywhere else on
  // the page closes it too, rather than leaving it over the chart while the reader scrolls on.
  function hideTipOutside(event: PointerEvent) {
    if (chart && !host.value?.contains(event.target as Node)) chart.dispatchAction({ type: 'hideTip' })
  }

  onMounted(() => {
    if (!host.value) return
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer?.disconnect()
        observer = null
        void start()
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 }
    )
    observer.observe(host.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    resizer?.disconnect()
    document.removeEventListener('pointerdown', hideTipOutside)
    chart?.dispose()
    chart = null
  })
</script>
