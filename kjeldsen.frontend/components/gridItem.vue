<template>
  <div
    class="pt-4 pb-4"
    :style="{
      gridColumn: item.columnSpan
        ? `span ${item.columnSpan} / span ${item.columnSpan}`
        : undefined,
      gridRow: item.rowSpan
        ? `span ${item.rowSpan} / span ${item.rowSpan}`
        : undefined,
    }"
  >
    <!-- Render the content -->
    <div class="mb-2">
      <BlocksResolverComponent v-if="item.content" :data="item.content" />
    </div>

    <!-- If the item has areas, render them -->
    <div v-if="item.areas && item.areas.length">
      <div
        v-for="(area, areaIndex) in item.areas"
        :key="areaIndex"
        class="mt-4 border-t pt-4"
      >
        <div class="font-bold mb-2">Area: {{ area.alias }}</div>
        <div
          class="grid gap-2"
          :style="`grid-template-columns: repeat(${area.columnSpan}, minmax(0, 1fr));`"
        >
          <GridItem
            v-for="(areaItem, areaItemIndex) in area.items"
            :key="areaItemIndex"
            :item="areaItem"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApiBlockGridItemModel } from "~/server/delivery-api";

defineProps<{
  item: ApiBlockGridItemModel;
}>();
</script>
