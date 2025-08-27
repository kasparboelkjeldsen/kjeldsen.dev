<template>
  <div>
    <pre>{{ props.data.properties?.cacheKeys }}</pre>
  </div>
</template>

<script lang="ts" setup>
import type { CacheKeyExampleBlockElementModel } from "~/../server/delivery-api";

const props = defineProps<{
  data: CacheKeyExampleBlockElementModel;
}>();
</script>
