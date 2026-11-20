<template>
  <!-- The player keeps to its box: keys only while it has focus, swipes only on it, the URL left
       alone, and its own full-screen button. Its theme is scoped to the deck's box. -->
  <div class="frame deck-player">
    <CanPresentPlayer :src="src" :scene="startScene || null">
      <template #loading>
        <CanPresentStage :title="title" detail="Loading the deck…" />
      </template>
      <template #error="{ error }">
        <CanPresentStage :title="title" :detail="`Could not play this deck: ${error.message}`" />
      </template>
    </CanPresentPlayer>
  </div>
</template>

<script setup lang="ts">
  // Browser only (CanPresentBlock.vue loads this inside <ClientOnly>): a deck file is a program, and
  // the player runs its code in the page. Imported here rather than in the block so the engine is
  // its own chunk, fetched only by pages that have a deck.
  import { CanPresentPlayer } from 'can-present'
  import 'can-present/style.css'
  import CanPresentStage from './CanPresentStage.vue'

  defineProps<{ src: string; startScene?: string; title?: string }>()
</script>
