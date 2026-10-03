/**
 * The ECharts build the chart scripts are written against.
 *
 * Fine-grained on purpose: the full package is over a megabyte, and a chart script may only use
 * what is registered here, which is why the generator's prompt lists exactly this. Add a chart
 * type here and in the prompt together. The renderer is the caller's: canvas in the browser,
 * SVG on the server for stills.
 */
import * as echarts from 'echarts/core'
import {
  BarChart,
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  TreemapChart,
} from 'echarts/charts'
import {
  AriaComponent,
  DatasetComponent,
  DataZoomInsideComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  PolarComponent,
  RadarComponent,
  SingleAxisComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { VISIO_COLORS, VISIO_FONTS, VISIO_PALETTE } from './visio'

export const THEME = 'kjeldsen'

let registered = false

/** Registers the charts, components and theme once; safe to call again. */
export function setupEcharts(renderer: Parameters<typeof echarts.use>[0]): typeof echarts {
  if (!registered) {
    echarts.use([
      BarChart,
      LineChart,
      PieChart,
      ScatterChart,
      RadarChart,
      HeatmapChart,
      TreemapChart,
      SunburstChart,
      SankeyChart,
      FunnelChart,
      GaugeChart,
      BoxplotChart,
      CandlestickChart,
      GraphChart,
      TitleComponent,
      LegendComponent,
      TooltipComponent,
      GridComponent,
      PolarComponent,
      RadarComponent,
      SingleAxisComponent,
      DatasetComponent,
      TransformComponent,
      VisualMapComponent,
      DataZoomInsideComponent,
      MarkPointComponent,
      MarkLineComponent,
      MarkAreaComponent,
      GraphicComponent,
      AriaComponent,
      LabelLayout,
      UniversalTransition,
    ])
    echarts.registerTheme(THEME, theme())
    registered = true
  }
  // Renderers register independently, and both can coexist.
  echarts.use(renderer)
  return echarts
}

/**
 * The site's look, so a chart script only has to say what is special about its chart. Mirrors
 * the page: Inter, muted labels, hairlines, a dark tooltip, the accents as series colours.
 */
function theme() {
  const c = VISIO_COLORS
  const axis = {
    axisLine: { show: true, lineStyle: { color: c.line2 } },
    axisTick: { show: false },
    axisLabel: { color: c.muted, fontSize: 12, fontFamily: VISIO_FONTS.sans, hideOverlap: true },
    nameTextStyle: { color: c.muted, fontSize: 11, fontFamily: VISIO_FONTS.sans },
    splitLine: { show: true, lineStyle: { color: c.line } },
    splitArea: { show: false },
  }
  return {
    color: VISIO_PALETTE,
    backgroundColor: 'transparent',
    textStyle: { color: c.fg2, fontFamily: VISIO_FONTS.sans, fontSize: 12 },
    title: {
      left: 0,
      top: 0,
      textStyle: { color: c.fg, fontFamily: VISIO_FONTS.sans, fontSize: 17, fontWeight: 600, lineHeight: 22 },
      subtextStyle: { color: c.muted, fontFamily: VISIO_FONTS.sans, fontSize: 12.5, lineHeight: 18 },
      itemGap: 6,
    },
    legend: {
      left: 0,
      top: 'bottom',
      icon: 'circle',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 14,
      textStyle: { color: c.fg2, fontSize: 12, fontFamily: VISIO_FONTS.sans },
      pageTextStyle: { color: c.muted },
      pageIconColor: c.fg2,
      pageIconInactiveColor: c.line2,
    },
    grid: { left: 8, right: 16, top: 64, bottom: 12, containLabel: true },
    categoryAxis: { ...axis, splitLine: { show: false }, axisLine: { show: true, lineStyle: { color: c.line2 } } },
    valueAxis: { ...axis, axisLine: { show: false } },
    logAxis: { ...axis, axisLine: { show: false } },
    timeAxis: { ...axis, splitLine: { show: false } },
    tooltip: {
      backgroundColor: 'rgba(16, 19, 27, 0.96)',
      borderColor: c.line2,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: c.fg, fontFamily: VISIO_FONTS.sans, fontSize: 12.5 },
      extraCssText: 'box-shadow: 0 20px 50px -20px rgba(0,0,0,.9); border-radius: 10px; backdrop-filter: blur(8px);',
      axisPointer: {
        lineStyle: { color: c.line2 },
        crossStyle: { color: c.line2 },
        shadowStyle: { color: 'rgba(255,255,255,0.03)' },
        label: { backgroundColor: c.surface, color: c.fg, borderColor: c.line2, fontFamily: VISIO_FONTS.sans },
      },
    },
    line: { smooth: 0.25, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2.25 }, showSymbol: false, emphasis: { focus: 'series' } },
    bar: { barMaxWidth: 44, itemStyle: { borderRadius: [4, 4, 0, 0] } },
    pie: {
      itemStyle: { borderColor: c.surface, borderWidth: 2 },
      label: { color: c.fg2, fontFamily: VISIO_FONTS.sans, fontSize: 12 },
      labelLine: { lineStyle: { color: c.line2 } },
    },
    scatter: { symbolSize: 9, itemStyle: { opacity: 0.85 } },
    radar: {
      axisName: { color: c.fg2, fontFamily: VISIO_FONTS.sans, fontSize: 12 },
      splitLine: { lineStyle: { color: c.line } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: c.line } },
    },
    heatmap: { itemStyle: { borderColor: c.surface, borderWidth: 1 } },
    treemap: {
      breadcrumb: { show: false },
      itemStyle: { borderColor: c.surface, borderWidth: 2, gapWidth: 2 },
      label: { color: c.fg, fontFamily: VISIO_FONTS.sans },
      upperLabel: { color: c.fg2, fontFamily: VISIO_FONTS.sans },
    },
    sunburst: { itemStyle: { borderColor: c.surface, borderWidth: 2 }, label: { color: c.fg, fontFamily: VISIO_FONTS.sans } },
    sankey: {
      lineStyle: { color: 'gradient', opacity: 0.35, curveness: 0.5 },
      label: { color: c.fg2, fontFamily: VISIO_FONTS.sans, fontSize: 12 },
      itemStyle: { borderWidth: 0 },
    },
    funnel: { label: { color: c.fg, fontFamily: VISIO_FONTS.sans }, itemStyle: { borderColor: c.surface, borderWidth: 2 } },
    gauge: {
      axisLine: { lineStyle: { color: [[1, c.line2]], width: 14 } },
      splitLine: { lineStyle: { color: c.line2 } },
      axisTick: { lineStyle: { color: c.line2 } },
      axisLabel: { color: c.muted, fontFamily: VISIO_FONTS.sans },
      title: { color: c.fg2, fontFamily: VISIO_FONTS.sans },
      detail: { color: c.fg, fontFamily: VISIO_FONTS.sans, fontWeight: 600 },
      pointer: { itemStyle: { color: c.fg } },
    },
    boxplot: { itemStyle: { borderWidth: 1.5 } },
    candlestick: {
      itemStyle: { color: c.mint, color0: c.rose, borderColor: c.mint, borderColor0: c.rose },
    },
    graph: {
      label: { color: c.fg2, fontFamily: VISIO_FONTS.sans },
      lineStyle: { color: c.line2, curveness: 0.1 },
    },
    visualMap: {
      textStyle: { color: c.muted, fontFamily: VISIO_FONTS.sans, fontSize: 11 },
      inRange: { color: ['#1b2230', c.sky] },
    },
    markLine: { lineStyle: { color: c.fg2, type: 'dashed', width: 1 }, label: { color: c.fg2, fontFamily: VISIO_FONTS.sans, fontSize: 11 } },
    markPoint: { label: { color: c.ink, fontFamily: VISIO_FONTS.sans, fontSize: 11 } },
    markArea: { itemStyle: { color: 'rgba(255,255,255,0.04)' } },
  }
}
