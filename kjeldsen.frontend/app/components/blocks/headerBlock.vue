<template>
  <div class="prose text-white">
    <h1 v-if="data.properties?.headerLevel === 'H1'" class="text-white prose-h1" v-html="styledHeader"></h1>
    <h2 v-else-if="data.properties?.headerLevel === 'H2'" class="text-white prose-h2" v-html="styledHeader"></h2>
    <h3 v-else-if="data.properties?.headerLevel === 'H3'" class="text-white prose-h3" v-html="styledHeader"></h3>
    <h4 v-else-if="data.properties?.headerLevel === 'H4'" class="text-white prose-h4" v-html="styledHeader"></h4>
    <h5 v-else-if="data.properties?.headerLevel === 'H5'" class="text-white prose-h5" v-html="styledHeader"></h5>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import type { HeaderBlockElementModel } from '~/../server/delivery-api';

const props = defineProps<{
  data: HeaderBlockElementModel;
}>();

const styledHeader = computed(() => {
  const raw = props.data.properties?.headerTitle ?? ''
  // Convert **bold** (no spaces required) into a styled span; support multiple segments
  return raw.replace(/\*\*([^*\n]+)\*\*/g, '<span class="text-sky-300">$1</span>')
})
</script>