<template>
  <aside
    :aria-label="ariaLabel"
    class="relative p-6 overflow-hidden text-white border shadow-lg group isolate rounded-2xl border-white/10 bg-white/5 sm:p-8 ring-1 ring-white/10"
  >
    <!-- Accent bar -->
    <div
      class="absolute inset-y-0 left-0 w-1 pointer-events-none bg-gradient-to-b"
      :class="variantMap[variant].bar"
      aria-hidden="true"
    />

    <!-- Subtle radial glow -->
    <div
      class="absolute pointer-events-none -inset-px -z-10 bg-gradient-to-br opacity-60 blur-2xl"
      :class="variantMap[variant].glow"
      aria-hidden="true"
    />

    <!-- Header / icon -->
    <div class="flex items-center gap-3 mb-3">
      <span
        class="inline-flex items-center justify-center rounded-md select-none size-7 ring-1 ring-inset"
        :class="[variantMap[variant].iconBg, variantMap[variant].iconRing, variantMap[variant].iconText]"
        aria-hidden="true"
      >
        {{ variantMap[variant].icon }}
      </span>
      <h3 v-if="header" class="m-0 text-base font-semibold tracking-tight" :class="variantMap[variant].accentText">
        {{ header }}
      </h3>
      <span v-else class="text-sm font-medium opacity-80" :class="variantMap[variant].accentText">
        Spotlight
      </span>
    </div>

    <!-- Content -->
    <div class="prose prose-invert max-w-none">
      <div v-html="markup" />
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
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

// Static class mappings so Tailwind can tree-shake safely
const variantMap: Record<Variant, {
  bar: string; glow: string; icon: string; iconBg: string; iconRing: string; iconText: string; accentText: string;
}> = {
  highlight: {
    bar: 'from-sky-400 to-cyan-500',
    glow: 'from-sky-500/10 to-transparent',
    icon: '✦',
    iconBg: 'bg-sky-500/15',
    iconRing: 'ring-sky-400/30',
    iconText: 'text-sky-300',
    accentText: 'text-sky-300',
  },
  cta: {
    bar: 'from-amber-400 to-orange-500',
    glow: 'from-amber-500/10 to-transparent',
    icon: '!',
    iconBg: 'bg-amber-500/15',
    iconRing: 'ring-amber-400/30',
    iconText: 'text-amber-300',
    accentText: 'text-amber-300',
  },
  quote: {
    bar: 'from-fuchsia-400 to-pink-500',
    glow: 'from-fuchsia-500/10 to-transparent',
    icon: '“”',
    iconBg: 'bg-fuchsia-500/15',
    iconRing: 'ring-fuchsia-400/30',
    iconText: 'text-fuchsia-300',
    accentText: 'text-fuchsia-300',
  },
}

const ariaLabel = computed(() => {
  if (variant.value === 'quote') return 'Highlighted quote'
  if (variant.value === 'cta') return 'Call to attention'
  return 'Highlight'
})
</script>
