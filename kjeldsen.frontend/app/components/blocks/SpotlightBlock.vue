<template>
  <section class="glow-card p-7 md:p-9">
    <div class="flex items-start gap-5">
      <!-- Editors' icons are logos, mostly dark artwork on transparency, so they sit on a light
           tile. The fallback spark has its own dark tile. -->
      <div
        class="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line"
        :class="icon ? 'bg-[#eef0f6]' : 'bg-surface-2'"
      >
        <img v-if="icon" :src="icon" alt="" width="28" height="28" class="h-7 w-7 object-contain" loading="lazy">
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7L12 2z" fill="url(#spark)" />
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#7dd3fc" />
              <stop offset="1" stop-color="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="min-w-0">
        <h2 v-if="block.properties?.header" class="display text-3xl md:text-[2.1rem]" v-html="header" />
        <div v-if="markup" class="rte mt-2 text-fg-2" v-html="markup" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { SpotlightBlockElementModel } from '~~/server/delivery-api'
  import { markMarkup, markText } from '~/utils/marks'
  import { withWidth } from '~/utils/images'

  const props = defineProps<{ block: SpotlightBlockElementModel }>()

  const header = computed(() => markText(props.block.properties?.header))
  const markup = computed(() => markMarkup(props.block.properties?.text?.markup))

  // Media picker properties arrive as an array even when the editor picks one item.
  const icon = computed(() => {
    const url = props.block.properties?.iconImage?.[0]?.url
    return url ? withWidth(url, 96) : ''
  })
</script>
