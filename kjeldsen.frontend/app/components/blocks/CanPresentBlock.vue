<template>
  <figure class="breakout m-0">
    <!-- Placeholder until the can-present package is installed: a 16:9 stage showing which
         compiled deck the editor picked. When the package lands, the stage becomes
         <CanPresent> fed from the deck file's url, opening on `startScene`; the block's properties and the
         surrounding figure stay as they are. -->
    <div class="frame deck-stage relative aspect-video">
      <div class="deck-cards" aria-hidden="true">
        <span v-for="n in 4" :key="n" class="deck-card" />
      </div>

      <div class="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <span class="eyebrow">can-present deck</span>
        <strong v-if="deckName" class="display text-2xl md:text-3xl">{{ deckName }}</strong>
        <span v-else class="text-sm text-muted">No deck picked</span>
        <span v-if="startScene" class="font-mono text-xs text-muted">opens on #{{ startScene }}</span>
        <span class="mt-2 font-mono text-[0.7rem] text-muted opacity-70">player arrives with the can-present package</span>
      </div>
    </div>
    <figcaption v-if="caption" class="mt-3 text-center font-mono text-xs text-muted" v-html="caption" />
  </figure>
</template>

<script setup lang="ts">
  import type { CanPresentBlockElementModel } from '~~/server/delivery-api'
  import { markText } from '~/utils/marks'

  const props = defineProps<{ block: CanPresentBlockElementModel }>()

  // The picker returns an array even for a single item; the compiled deck is a File in the
  // media library.
  const deck = computed(() => props.block.properties?.deck?.[0] ?? null)
  const deckName = computed(() => deck.value?.name ?? '')
  const startScene = computed(() => props.block.properties?.startScene?.trim() ?? '')
  const caption = computed(() => markText(props.block.properties?.caption))
</script>
