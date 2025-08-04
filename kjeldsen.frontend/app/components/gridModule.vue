<template>
  <div class="grid gap-4" :style="`grid-template-columns: repeat(${data.gridColumns}, minmax(0, 1fr));`">
    <GridItem
      v-for="(item, index) in data.items"
      :key="index"
      :item="item"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ApiBlockGridModel } from '~/../server/delivery-api';

defineProps<{
  data: ApiBlockGridModel;
}>();
</script>
