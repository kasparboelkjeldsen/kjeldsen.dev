2<template>
  <div class="prose text-white">
    <h1 v-if="data.properties?.headerLevel === 'H1'" class="prose-h1">
      {{ data.properties?.headerTitle }}
    </h1>
    <h2 v-else-if="data.properties?.headerLevel === 'H2'" class="prose-h2">
      {{ data.properties?.headerTitle }}
    </h2>
    <h3 v-else-if="data.properties?.headerLevel === 'H3'" class="prose-h3">
      {{ data.properties?.headerTitle }}
    </h3>
    <h4 v-else-if="data.properties?.headerLevel === 'H4'" class="prose-h4">
      {{ data.properties?.headerTitle }}
    </h4>
    <h5 v-else-if="data.properties?.headerLevel === 'H5'" class="prose-h5">
      {{ data.properties?.headerTitle }}  
    </h5>
  </div>
</template>
<script lang="ts" setup>
import type { HeaderBlockElementModel } from '~/server/delivery-api';

defineProps<{
  data: HeaderBlockElementModel;
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