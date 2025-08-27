<template>
  <div :class="itemClasses">
    <!-- Render the content -->
    <div class="mb-2">
      <BlocksResolverComponent v-if="item.content" :data="item.content" :columns="item.columnSpan ?? 12" />
    </div>

    <!-- Areas -->
    <div v-if="item.areas && item.areas.length">
      <div
        v-for="(area, areaIndex) in item.areas"
        :key="areaIndex"
        class=""
      >
        <div class="mb-2 font-bold">Area: {{ area.alias }}</div>
        <div
          class="grid gap-2"
          :class="`grid-cols-1 sm:grid-cols-${area.columnSpan}`"
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
import { clsx } from 'clsx';
import type { ApiBlockGridItemModel } from "~/../server/delivery-api";

const props = defineProps<{
  item: ApiBlockGridItemModel;
}>();

const itemClasses = clsx(
  'pt-2 pb-2',                   // Mobile
  '',             // sm and up
  'col-span-full row-span-1',   // Mobile fallback grid
  props.item.columnSpan && `sm:col-span-${props.item.columnSpan}`,
  props.item.rowSpan && `sm:row-span-${props.item.rowSpan}`
);

</script>