<template>
  <div class="flex flex-col gap-6">
    <div v-for="(item, i) in grid.items" :key="i">
      <BlockResolver v-if="item.content" :block="item.content" />

      <!-- Nested areas, so grids inside grids still render. -->
      <div v-for="(area, a) in item.areas" :key="a" class="mt-4 flex flex-col gap-4 pl-4">
        <template v-for="(areaItem, ai) in area.items" :key="ai">
          <BlockResolver v-if="areaItem.content" :block="areaItem.content" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BlockResolver from './BlockResolver.vue'
  import type { BlockGrid } from '~~/types/content'

  defineProps<{ grid: BlockGrid }>()
</script>
