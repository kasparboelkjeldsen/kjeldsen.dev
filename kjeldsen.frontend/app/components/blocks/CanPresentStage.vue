<template>
  <!-- The 16:9 stage a deck plays on, without the deck: what the server renders, what shows while
       the deck file loads, and what is left if it cannot play. Same box as the player, so nothing
       jumps when the deck arrives. -->
  <div class="frame deck-stage relative aspect-video">
    <div class="deck-cards" aria-hidden="true">
      <span v-for="n in 4" :key="n" class="deck-card" />
    </div>

    <div class="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <span class="eyebrow">can-present deck</span>
      <strong v-if="title" class="display text-2xl md:text-3xl">{{ title }}</strong>
      <span v-if="detail" class="font-mono text-xs text-muted">{{ detail }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ title?: string; detail?: string }>()
</script>
