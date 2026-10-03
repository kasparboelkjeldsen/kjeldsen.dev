<template>
  <!-- A Generated Graphics item in the picker: the drawing goes inline, in the same frame a photo
       would get, with the editor's alt text and caption. -->
  <figure v-if="graphic" class="m-0" :class="figureClass">
    <div class="frame">
      <GeneratedGraphic :svg="graphic.svg" :script="graphic.script" :alt="alt" />
    </div>
    <figcaption v-if="caption" class="mt-3 text-center font-mono text-xs text-muted">{{ caption }}</figcaption>
  </figure>

  <figure v-else-if="src" class="m-0" :class="figureClass">
    <!-- With `zoom` (the Open Image block) the frame is a button that opens the whole picture. -->
    <component
      :is="zoom ? 'button' : 'div'"
      ref="frame"
      class="frame"
      :class="{ 'zoom-frame': zoom }"
      :type="zoom ? 'button' : undefined"
      :aria-label="zoom ? (alt ? `Open image: ${alt}` : 'Open image') : undefined"
      :aria-haspopup="zoom ? 'dialog' : undefined"
      @click="zoom && (opened = true)"
    >
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
      <span v-if="zoom" class="zoom-badge" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </span>
    </component>
    <figcaption v-if="caption" class="mt-3 text-center font-mono text-xs text-muted">{{ caption }}</figcaption>

    <!-- Mounted on the first open, so the lightbox's code is only fetched by readers who use it. -->
    <ImageLightbox
      v-if="zoom && everOpened && image?.url"
      v-model:open="opened"
      :url="image.url"
      :width="image.width"
      :height="image.height"
      :alt="alt"
      :caption="caption"
      :return-focus="frame"
    />
  </figure>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  import type { ImageBlockElementModel, ImageCropModel, OpenImageBlockElementModel } from '~~/server/delivery-api'
  import GeneratedGraphic from '~/components/blocks/GeneratedGraphic.vue'
  import { FORMAT } from '~/utils/images'
  import { BLOCK_SPAN, sizesFor } from '~/utils/blocks'
  import { generatedGraphicOf } from '~/utils/graphics'

  const ImageLightbox = defineAsyncComponent(() => import('~/components/blocks/ImageLightbox.vue'))

  // The Open Image block has the same properties and is rendered by this component with `zoom`.
  const props = defineProps<{ block: ImageBlockElementModel | OpenImageBlockElementModel; zoom?: boolean }>()

  const frame = ref<HTMLElement | null>(null)
  const opened = ref(false)
  const everOpened = ref(false)
  watch(opened, (v) => {
    if (v) everOpened.value = true
  })

  // How many grid columns the block has, from the resolver. Decides the `sizes` hint and whether
  // the picture may break out of the text column: a half-width block stays inside its cell.
  const span = inject(BLOCK_SPAN, computed(() => 12))

  // Media picker properties arrive as an array even when the editor picks one item.
  const image = computed(() => props.block.properties?.image?.[0] ?? null)

  // The picker also accepts a Generated Graphics item; then there is no photo to size.
  const graphic = computed(() => generatedGraphicOf(image.value))

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
  // Rungs 80 px apart through the phone range: a 372 px slot at any common pixel ratio lands
  // within one rung of what it needs instead of jumping to 800.
  const LADDER: Record<string, number[]> = {
    Square: [320, 400, 480, 560, 640, 720, 800, 1000],
    Slim: [400, 480, 560, 640, 720, 800, 1000, 1200, 1600],
    Ratio: [400, 480, 560, 640, 720, 800, 1000, 1200, 1600],
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
