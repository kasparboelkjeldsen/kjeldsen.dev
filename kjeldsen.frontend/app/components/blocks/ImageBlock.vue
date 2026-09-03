<template>
  <figure v-if="src" class="m-0" :class="shape === 'Square' ? 'mx-auto max-w-xl' : 'breakout'">
    <div class="frame">
      <img
        ref="img"
        :src="src"
        :srcset="srcset || undefined"
        :sizes="shape === 'Square' ? '(min-width: 48rem) 36rem, 100vw' : '(min-width: 64rem) 54rem, 100vw'"
        :alt="alt"
        :width="largest?.width"
        :height="largest?.height"
        loading="lazy"
        decoding="async"
        class="fade-img block h-auto w-full"
        :class="{ 'is-loaded': loaded }"
        @load="loaded = true"
      >
    </div>
    <figcaption v-if="caption" class="mt-3 text-center font-mono text-xs text-muted">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
  import type { ImageBlockElementModel, ImageCropModel } from '~~/server/delivery-api'

  const props = defineProps<{ block: ImageBlockElementModel }>()

  // Media picker properties arrive as an array even when the editor picks one item.
  const image = computed(() => props.block.properties?.image?.[0] ?? null)

  const alt = computed(() => props.block.properties?.altText ?? '')
  const caption = computed(() => props.block.properties?.bottomText ?? '')
  const shape = computed(() => props.block.properties?.cropPreference ?? 'Ratio')

  // cropPreference names a shape, not a crop alias. The media type defines four widths for each
  // shape (16:9, 1:1 and 4:1), so match on aspect ratio and let srcset choose the width. "None"
  // is absent here on purpose — it falls through to the uncropped URL below.
  const shapes: Record<string, (crop: ImageCropModel) => boolean> = {
    Ratio: (c) => c.width / c.height >= 1.75 && c.width / c.height <= 1.85,
    Square: (c) => Math.abs(c.width / c.height - 1) < 0.05,
    Slim: (c) => c.width / c.height >= 3.9,
  }

  const crops = computed(() => {
    const match = shapes[shape.value]
    if (!match) return []
    return [...(image.value?.crops ?? [])].filter(match).sort((a, b) => a.width - b.width)
  })

  // The Delivery API reports a crop's size but not its alias, so the crop is re-requested by
  // dimensions. rxy keeps the editor's focal point in frame when the processor has to cut.
  function url(crop?: ImageCropModel) {
    const base = image.value?.url
    if (!base) return ''
    if (!crop) return base

    const focal = image.value?.focalPoint
    const params = [
      ...(focal ? [`rxy=${focal.left},${focal.top}`] : []),
      `width=${crop.width}`,
      `height=${crop.height}`,
    ]
    return `${base}${base.includes('?') ? '&' : '?'}${params.join('&')}`
  }

  const largest = computed(() => crops.value.at(-1))
  const src = computed(() => url(largest.value))
  const srcset = computed(() => crops.value.map((c) => `${url(c)} ${c.width}w`).join(', '))

  // Fades in when its bytes arrive. An image that was already complete by the time this mounted -
  // cached, or loaded before hydration - is shown at once rather than waiting for a load event
  // that has already fired.
  const img = ref<HTMLImageElement | null>(null)
  const loaded = ref(false)
  onMounted(() => {
    if (img.value?.complete) loaded.value = true
  })
</script>
