<template>
  <component
    :is="asTag"
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
      <!-- Icon badge wrapper (always 32x32) -->
      <span
        class="inline-flex items-center justify-center rounded-md select-none size-8 ring-1 ring-inset shrink-0"
        :class="[variantMap[variant].iconBg, variantMap[variant].iconRing]"
        aria-hidden="true"
      >
        <slot name="icon">
          <span class="text-base" :class="variantMap[variant].iconText">
            {{ icon || variantMap[variant].icon }}
          </span>
        </slot>
      </span>
      <slot name="title">
        <h3 v-if="title" class="text-base font-semibold tracking-tight text-sky-300" :class="variantMap[variant].accentText">
          {{ title }}
        </h3>
        <span v-else class="text-sm font-medium opacity-80 text-sky-300" :class="variantMap[variant].accentText">
          Spotlight
        </span>
      </slot>
    </div>

    <!-- Content -->
    <div class="prose prose-invert max-w-none">
      <slot />
    </div>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  variant?: 'highlight' | 'cta' | 'quote'
  icon?: string
  as?: 'aside' | 'section' | 'div'
}>(), {
  variant: 'highlight',
  as: 'aside'
})

const asTag = computed(() => props.as)

const variantMap: Record<NonNullable<typeof props.variant>, {
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
  if (props.variant === 'quote') return 'Highlighted quote'
  if (props.variant === 'cta') return 'Call to attention'
  return 'Highlight'
})
</script>

<style scoped>
/* Ensure any slotted <img> is exactly 32x32 within the badge */
.size-8 :deep(img) {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  /* Rounded corners and subtle border without affecting layout size */
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.28) inset;
}
</style>
