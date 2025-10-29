<template>
  <div :class="(props.columns ?? 12) < 12 ? 'p-5' : ''">
    <picture v-if="!isBlockPreview && sources.length" class="m-0">
      <source v-for="(s, index) in sources" :key="index" :srcset="s.src" :media="s.media" />
      <img :src="sources.at(-1)?.src" :alt="altText" class="rounded-lg" :data-guid="image?.id" />
    </picture>

    <img
      v-if="isBlockPreview && sources.length"
      :src="sources.at(-1)?.src?.replace('/api', '')"
      :alt="altText"
      :data-guid="image?.id"
      class="w-full"
    />
    <span v-if="bottomText" class="block mt-2 text-sm text-white/70" v-html="bottomText"></span>
  </div>
</template>

<script lang="ts" setup>
  import type { ImageBlockElementModel } from '~/../server/delivery-api'

  const props = defineProps<{
    data: ImageBlockElementModel
    columns?: number
  }>()
  const image = props.data.properties?.image?.at(0)
  const cropPref = props.data.properties?.cropPreference ?? 'Ratio'

  const altText = props.data.properties?.altText ?? ''
  const bottomText = props.data.properties?.bottomText ?? ''

  type SourceEntry = { src: string; media?: string }
  const sources: SourceEntry[] = []

  const MAX_WIDTH = 864

  function matchesCropPref(crop: { width: number; height: number }) {
    const ratio = crop.width / crop.height
    if (cropPref === 'Square') return Math.abs(ratio - 1) < 0.05
    if (cropPref === 'Slim') return ratio >= 3.9
    return ratio >= 1.75 && ratio <= 1.85 // updated for tighter 16:9 match
  }

  function matchesColumnWidth(crop: { width: number }) {
    const cols = props.columns ?? 12
    if (cols >= 9) return crop.width >= 1000
    if (cols >= 5) return crop.width >= 800 && crop.width < 1000
    return crop.width < 800
  }

  // Clamp a width/height pair to MAX_WIDTH preserving aspect ratio
  function clampSize(dim: { width: number; height: number }): { width: number; height: number } {
    if (!dim.width || !dim.height) return dim
    if (dim.width <= MAX_WIDTH) return dim
    const scale = MAX_WIDTH / dim.width
    return { width: Math.round(dim.width * scale), height: Math.round(dim.height * scale) }
  }

  // Build an image URL; include rxy if focal point provided. Only include height when passed in
  function buildRxyUrl(
    baseUrl: string,
    dim: { width: number; height?: number },
    focalPoint?: any
  ): string {
    const fx = focalPoint?.x ?? focalPoint?.left
    const fy = focalPoint?.y ?? focalPoint?.top
    const params: string[] = []
    if (typeof fx === 'number' && typeof fy === 'number') {
      params.push(`rxy=${fx},${fy}`)
    }
    if (typeof dim.width === 'number' && dim.width > 0) params.push(`width=${dim.width}`)
    if (typeof dim.height === 'number' && dim.height > 0) params.push(`height=${dim.height}`)
    params.push('format=webp')
    params.push('quality=80')
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.join('&')}`
  }

  if (image?.url) {
    // If no crops or explicit 'None' preference, request at most MAX_WIDTH and let the server keep aspect ratio
    if (!image.crops?.length || cropPref === 'None') {
      const intrinsicW = typeof image.width === 'number' ? image.width : MAX_WIDTH
      const targetW = Math.min(intrinsicW, MAX_WIDTH)
      const src = buildRxyUrl(image.url, { width: targetW }, image.focalPoint)
      sources.push({ src })
    } else {
      const filteredCrops = image.crops
        .filter((crop) => matchesCropPref(crop) && matchesColumnWidth(crop))
        .sort((a, b) => b.width - a.width) // largest first

      // Map crops to sources, clamping to MAX_WIDTH and using media queries based on next clamped width
      filteredCrops.forEach((crop, i) => {
        const clamped = clampSize({ width: crop.width, height: crop.height })
        const src = buildRxyUrl(image.url, clamped, image.focalPoint)
        const next = filteredCrops[i + 1]
        const nextClampedW = next
          ? clampSize({ width: next.width, height: next.height }).width
          : undefined
        const media = nextClampedW ? `(min-width: ${nextClampedW}px)` : ''
        sources.push({ src, media })
      })
    }
  }

  const event = useRequestEvent()
  const isBlockPreview = event?.context.blockPreview
</script>
