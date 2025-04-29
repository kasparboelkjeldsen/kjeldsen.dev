<template>
  <div class="prose">
  <NuxtImg :src="data.properties?.image?.at(0)?.url" :alt="data.properties?.altText ?? ''" class="rounded-lg" width="800" />
  </div>
</template>
<script lang="ts" setup>
import type { ImageBlockElementModel } from '~/server/delivery-api';

defineProps<{
  data: ImageBlockElementModel;
}>();
</script>