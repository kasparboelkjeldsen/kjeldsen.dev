<template>
  <div v-if="embedUrl" class="aspect-video">
    <iframe
      :src="embedUrl"
      class="h-full w-full border-0"
      loading="lazy"
      allow="fullscreen; picture-in-picture"
      title="Vimeo video"
    />
  </div>
</template>

<script setup lang="ts">
  import type { VimeoBlockElementModel } from '~~/server/delivery-api'

  const props = defineProps<{ block: VimeoBlockElementModel }>()

  // Editors paste a page URL; only the numeric id is embeddable. Anything that is not a Vimeo
  // URL with an id renders nothing rather than framing an arbitrary origin.
  const embedUrl = computed(() => {
    const raw = props.block.properties?.url ?? ''
    const match = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : ''
  })
</script>
