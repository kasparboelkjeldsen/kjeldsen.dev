<template>
  <div class="vimeo-embed">
    <iframe
      :src="embedUrl"
      title="Vimeo video"
      referrerpolicy="strict-origin-when-cross-origin"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
      frameborder="0"
      allowfullscreen
      style="aspect-ratio: 16 / 9; width: 100%; height: auto; border: 0;"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { VimeoBlockElementModel } from "~/../server/delivery-api";

const props = defineProps<{ data: VimeoBlockElementModel }>();

// Use provided URL or fall back to a sample embed so previews don't break
const rawUrl = computed(() => props.data.properties?.url?.trim() || '')
const fallback = 'https://player.vimeo.com/video/1113541903?badge=0&autopause=0&player_id=0&app_id=58479'
const embedUrl = computed(() => rawUrl.value || fallback)
</script>

<style scoped>
.vimeo-embed {
  /* Contain overflow just in case */
  max-width: 100%;
  background: black;
}
</style>
