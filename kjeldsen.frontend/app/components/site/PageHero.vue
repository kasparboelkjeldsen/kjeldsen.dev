<template>
  <section class="hero" :class="sizeClass">
    <div v-if="image" class="hero-media" aria-hidden="true">
      <img
        :src="image"
        :srcset="imageSet || undefined"
        sizes="100vw"
        alt=""
        class="hero-img"
        fetchpriority="high"
        decoding="async"
      >
      <div class="hero-veil"></div>
    </div>

    <div class="container-wide relative" :class="padding">
      <p v-if="eyebrow || $slots.eyebrow" class="eyebrow rise" style="--d: 0ms">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </p>

      <!-- innerHTML rather than v-html on purpose: the title is plain text that markText has
           escaped and marked up, so nothing an editor types can become markup. -->
      <h1 class="display hero-title rise" :class="{ 'mt-5': eyebrow || $slots.eyebrow }" style="--d: 90ms" v-html="title" />

      <div v-if="lede || $slots.lede" class="hero-lede rise mt-7" style="--d: 200ms">
        <slot name="lede">
          <p class="rte-lede">{{ lede }}</p>
        </slot>
      </div>

      <div v-if="$slots.meta" class="rise" style="--d: 300ms">
        <slot name="meta" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  /**
   * The opening of every page: an optional full-bleed backdrop that fades into the page, a
   * mono eyebrow, the serif title, an optional lede, and whatever the page wants under it.
   *
   * The entrance is pure CSS (`.rise`, staggered with --d), so it plays on first paint with no
   * script and again on every client-side navigation because the element is new each time.
   */
  const props = withDefaults(
    defineProps<{
      /** Already marked up - see utils/marks.ts. */
      title: string
      eyebrow?: string
      lede?: string
      image?: string | null
      imageSet?: string
      size?: 'xl' | 'lg' | 'md'
    }>(),
    { size: 'lg' }
  )

  const sizeClass = computed(() => `is-${props.size}`)

  const padding = computed(
    () =>
      ({
        xl: 'pt-40 pb-20 md:pt-56 md:pb-28',
        lg: 'pt-36 pb-14 md:pt-52 md:pb-20',
        md: 'pt-32 pb-8 md:pt-44 md:pb-12',
      })[props.size]
  )
</script>
