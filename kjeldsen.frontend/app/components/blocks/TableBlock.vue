<template>
  <figure v-if="table" class="m-0 table-block" :class="{ breakout: span >= 12 }">
    <!-- Both variants are in the markup when the author gave a mobile one; CSS shows the right
         one for the width, so the server-rendered page is correct at every size and nothing
         re-lays out on hydration. -->
    <div class="frame table-frame" :class="{ 'table-desktop': !!table.mobile }">
      <DataTable :variant="table.desktop" :label="caption" />
    </div>
    <div v-if="table.mobile" class="frame table-frame table-mobile">
      <DataTable :variant="table.mobile" :label="caption" />
    </div>
    <figcaption v-if="caption || table.note" class="mt-3 text-center font-mono text-xs text-muted">
      <span v-if="caption">{{ caption }}</span>
      <span v-if="caption && table.note"> · </span>
      <span v-if="table.note" class="opacity-80">{{ table.note }}</span>
    </figcaption>
  </figure>

  <div v-else class="frame table-frame table-empty">
    <p class="font-mono text-xs text-muted">Table JSON missing or invalid.</p>
  </div>
</template>

<script setup lang="ts">
  import { defineComponent, h, type VNode } from 'vue'
  import type { TableBlockElementModel } from '~~/server/delivery-api'
  import { BLOCK_SPAN } from '~/utils/blocks'
  import { markText } from '~/utils/marks'
  import { parseTable, type TableCell, type TableColumn, type TableVariant } from '~~/shared/table'

  const props = defineProps<{ block: TableBlockElementModel }>()

  const span = inject(BLOCK_SPAN, computed(() => 12))
  const table = computed(() => parseTable(props.block.properties?.table))
  const caption = computed(() => props.block.properties?.caption?.trim() ?? '')

  /**
   * One <table> for one variant. A render function rather than a template because a cell is a
   * handful of conditional wrappers (link, strong, mono) around text that carries the site's
   * emphasis markers - markText escapes the text and turns the markers into spans, so nothing an
   * author writes can become markup, and the result goes in as innerHTML.
   */
  const DataTable = defineComponent({
    props: { variant: { type: Object as () => TableVariant, required: true }, label: { type: String, default: '' } },
    setup(p) {
      const cellClass = (col: TableColumn, c: TableCell) => [
        'cell',
        `align-${c.align ?? col.align ?? 'left'}`,
        { 'is-mono': c.mono || col.mono, 'is-strong': c.strong, 'is-muted': c.muted, 'is-nowrap': col.nowrap },
      ]
      const content = (c: TableCell): VNode | string => {
        if (c.text === '') return ''
        const inner = h('span', { innerHTML: markText(c.text) })
        return c.href ? h('a', { href: c.href, class: 'cell-link', rel: c.href.startsWith('http') ? 'noopener' : undefined }, [inner]) : inner
      }
      return () =>
        h('table', { class: 'data-table', 'aria-label': p.label || undefined }, [
          p.variant.columns.some((c) => c.width)
            ? h('colgroup', p.variant.columns.map((c) => h('col', { style: c.width ? { width: c.width } : undefined })))
            : null,
          h('thead', [
            h('tr', p.variant.columns.map((col) => h('th', { scope: 'col', class: ['cell', `align-${col.align ?? 'left'}`, { 'is-nowrap': col.nowrap }] }, [h('span', { innerHTML: markText(col.label) })]))),
          ]),
          h('tbody', p.variant.rows.map((row, r) => h('tr', { key: r }, row.map((c, i) => h('td', { class: cellClass(p.variant.columns[i]!, c) }, [content(c)]))))),
          p.variant.footer
            ? h('tfoot', [h('tr', p.variant.footer.map((c, i) => h('td', { class: cellClass(p.variant.columns[i]!, c) }, [content(c)])))])
            : null,
        ])
    },
  })
</script>
