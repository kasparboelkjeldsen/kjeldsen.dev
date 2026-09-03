<template>
  <figure v-if="src" class="m-0" :class="figureClass">
    <div class="frame">
      <img
        ref="img"
        :src="src"
        :srcset="srcset || undefined"
        :sizes="sizes"
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
  import { FORMAT } from '~/utils/images'
  import { BLOCK_SPAN, sizesFor } from '~/utils/blocks'

  const props = defineProps<{ block: ImageBlockElementModel }>()

  // How many grid columns the block has, from the resolver. Decides the `sizes` hint and whether
  // the picture may break out of the text column: a half-width block stays inside its cell.
  const span = inject(BLOCK_SPAN, computed(() => 12))

  // Media picker properties arrive as an array even when the editor picks one item.
  const image = computed(() => props.block.properties?.image?.[0] ?? null)

  const alt = computed(() => props.block.properties?.altText ?? '')
  const caption = computed(() => props.block.properties?.bottomText ?? '')
  const shape = computed(() => props.block.properties?.cropPreference ?? 'Ratio')

  const figureClass = computed(() => {
    if (shape.value === 'Square') return span.value < 12 ? 'mx-auto max-w-md' : 'mx-auto max-w-xl'
    return span.value < 12 ? '' : 'breakout'
  })
  const sizes = computed(() => sizesFor(span.value, shape.value))

  // cropPreference names a shape, not a crop alias. The media type defines four widths for each
  // shape (16:9, 1:1 and 4:1), so match on aspect ratio and let srcset choose the width. "None"
  // is absent here on purpose — it falls through to the uncropped URL below.
  const shapes: Record<string, (crop: ImageCropModel) => boolean> = {
    Ratio: (c) => c.width / c.height >= 1.75 && c.width / c.height <= 1.85,
    Square: (c) => Math.abs(c.width / c.height - 1) < 0.05,
    Slim: (c) => c.width / c.height >= 3.9,
  }

  // The widths offered per shape. The media type's own crops come in four sizes with big gaps;
  // the media route signs any width, so the ladder is ours, with steps a phone can land on
  // exactly rather than one size up. Heights follow the shape's aspect ratio, taken from the
  // media type's crop so it matches what the editor framed.
  const LADDER: Record<string, number[]> = {
    Square: [320, 480, 640, 800, 1000],
    Slim: [480, 640, 800, 1000, 1200, 1600],
    Ratio: [480, 640, 800, 1000, 1200, 1600],
  }

  const crops = computed<ImageCropModel[]>(() => {
    const match = shapes[shape.value]
    if (!match) return []
    const reference = (image.value?.crops ?? []).find(match)
    if (!reference) return []
    const ratio = reference.width / reference.height
    const widths = LADDER[shape.value] ?? [reference.width]
    return widths.map((width) => ({ ...reference, width, height: Math.round(width / ratio) }))
  })

  // The crop is requested by dimensions. rxy keeps the editor's focal point in frame when the
  // processor has to cut, and every variant is asked for as WebP.
  function url(crop?: ImageCropModel) {
    const base = image.value?.url
    if (!base) return ''
    const join = base.includes('?') ? '&' : '?'
    if (!crop) return `${base}${join}${FORMAT}`

    const focal = image.value?.focalPoint
    const params = [
      ...(focal ? [`rxy=${focal.left},${focal.top}`] : []),
      `width=${crop.width}`,
      `height=${crop.height}`,
      FORMAT,
    ]
    return `${base}${join}${params.join('&')}`
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
