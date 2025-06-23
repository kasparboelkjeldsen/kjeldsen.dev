<template>
  <div>
    <img v-if="!isBlockPreview" :src="data.properties?.image?.at(0)?.url" :alt="data.properties?.altText ?? ''" class="rounded-lg" />
    <img v-if="isBlockPreview" :src="data.properties?.image?.at(0)?.url" :alt="data.properties?.altText ?? ''" class="w-full" />
  </div>
</template>
<script lang="ts" setup>
import type { ImageBlockElementModel } from '~/server/delivery-api';

defineProps<{
  data: ImageBlockElementModel;
}>();

const event = useRequestEvent()
const isBlockPreview = event?.context.blockPreview;
</script>