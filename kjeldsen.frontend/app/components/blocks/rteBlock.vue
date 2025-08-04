<template>
  <div
    class="text-white"
    v-html="data.properties?.richText?.markup"
  />
</template>
<script lang="ts" setup>
import type { RteBlockElementModel } from '~/../server/delivery-api';

defineProps<{
  data: RteBlockElementModel;
}>();
</script>
<style lang="css">
  p strong,  h2 {
    color: white !important;

  }
  p a {
    color: white !important;
    text-decoration: underline !important;
  }
</style>