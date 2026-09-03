<template>
  <div class="block-grid">
    <div
      v-for="(item, i) in grid.items"
      :key="i"
      v-reveal="{ delay: Math.min(i, 5) * 70 }"
      class="block-cell reveal"
      :style="{ '--span': item.columnSpan || 12 }"
      :data-span="item.columnSpan || 12"
      :data-type="item.content?.contentType ?? undefined"
    >
      <BlockResolver v-if="item.content" :block="item.content" />

      <!-- Nested areas, so grids inside grids still render. -->
      <div v-for="(area, a) in item.areas" :key="a" class="mt-6 flex flex-col gap-6">
        <template v-for="(areaItem, ai) in area.items" :key="ai">
          <BlockResolver v-if="areaItem.content" :block="areaItem.content" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   * The editor's grid, honoured: a block spanning six of twelve columns sits beside its
   * neighbour on a wide screen and stacks under it on a phone. Each cell reveals as it scrolls
   * into view, the first few with a short stagger so a page opens in sequence rather than all at
   * once.
   */
  import BlockResolver from './BlockResolver.vue'
  import type { BlockGrid } from '~~/types/content'

  defineProps<{ grid: BlockGrid }>()
</script>
