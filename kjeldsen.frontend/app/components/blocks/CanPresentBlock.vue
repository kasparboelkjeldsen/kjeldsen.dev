<template>
  <figure class="breakout m-0">
    <ClientOnly>
      <CanPresentDeck v-if="src" :src="src" :start-scene="startScene" :title="title" />
      <CanPresentStage v-else detail="No deck picked" />

      <template #fallback>
        <CanPresentStage :title="title" :detail="src ? 'Loading the deck…' : 'No deck picked'" />
      </template>
    </ClientOnly>
    <figcaption v-if="caption" class="mt-3 text-center font-mono text-xs text-muted" v-html="caption" />
  </figure>
</template>

<script setup lang="ts">
  import type { CanPresentBlockElementModel } from '~~/server/delivery-api'
  import { markText } from '~/utils/marks'
  import CanPresentStage from './CanPresentStage.vue'

  // A can-present deck file (packed with `npm run pack-deck`, uploaded as a File) played in the
  // post. The server renders the empty stage; the player and the deck load in the browser.
  const CanPresentDeck = defineAsyncComponent(() => import('./CanPresentDeck.vue'))

  const props = defineProps<{ block: CanPresentBlockElementModel }>()

  // The picker returns an array even for a single item. The url is a frontend path
  // (/api/media/...), proxied to the CMS by server/api/media.
  const deck = computed(() => props.block.properties?.deck?.[0] ?? null)
  const src = computed(() => deck.value?.url ?? '')
  const title = computed(() => deck.value?.name ?? '')
  const startScene = computed(() => props.block.properties?.startScene?.trim() ?? '')
  const caption = computed(() => markText(props.block.properties?.caption))
</script>
