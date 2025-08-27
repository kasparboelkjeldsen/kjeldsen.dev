<template>
  <Glasslike :title="header" :variant="variant">
    <template #icon>
      <!-- Use default icon from Glasslike by omitting content here -->
    </template>
    <template #title>
      <h3 v-if="header" class="m-0 text-base font-semibold tracking-tight">
        {{ header }}
      </h3>
      <span v-else class="text-sm font-medium opacity-80">Spotlight</span>
    </template>
    <div class="prose prose-invert max-w-none">
      <div v-html="markup" />
    </div>
  </Glasslike>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Glasslike from '../glasslike.vue'
import type { SpotlightBlockElementModel } from "~/../server/delivery-api";

const props = defineProps<{
  data: SpotlightBlockElementModel;
}>();

const header = computed(() => props.data.properties?.header ?? '')
const markup = computed(() => props.data.properties?.text?.markup ?? '')

// Lightweight heuristic to pick a tone without changing the model API
type Variant = 'quote' | 'cta' | 'highlight'
const variant = computed<Variant>(() => {
  const h = (header.value || '').toLowerCase()
  const m = (markup.value || '').toLowerCase()
  if (m.includes('<blockquote') || h.includes('quote') || /“|”|"/.test(h)) return 'quote'
  if (/(attention|warning|important|notice|alert|!)/.test(h)) return 'cta'
  return 'highlight'
})

// (variant styling now lives in the Glasslike component)
</script>
