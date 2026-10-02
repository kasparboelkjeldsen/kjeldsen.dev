<template>
  <!-- The SVG is server-rendered as a still, so the picture is there before any script - and for
       readers without it. The timeline, when there is one, is bolted on after mount. -->
  <div
    ref="host"
    class="graphic"
    :class="{ 'is-animated': !!script, 'is-cover': fit === 'cover' }"
    role="img"
    :aria-label="alt || undefined"
    @mouseenter="onHover"
    @pointerdown="onHover"
    v-html="markup"
  />
</template>

<script setup lang="ts">
  /**
   * A generated graphic: inline SVG drawn by the model, animated by a GSAP timeline it also wrote.
   *
   * The script is model output, executed on the page on purpose - the editor who saved the media
   * item chose that. It is given only the <svg> element and gsap, and the generator strips script
   * elements and event attributes out of the markup.
   *
   * `trigger: 'view'` (the default, for a graphic in the reading column) plays the timeline once
   * when it scrolls into view and again on hover or tap. `trigger: 'manual'` leaves playing to the
   * parent through the exposed `replay()` - a listing card plays its picture when the whole card
   * is hovered, not just the picture - except on a device without hover, where it plays once in
   * view instead, since nothing else would ever start it. Under prefers-reduced-motion nothing
   * plays by itself; a tap still does, because then the reader asked.
   *
   * `fit: 'cover'` makes the drawing fill its box and crop, for backdrops and cards.
   */
  import { coverSvg } from '~/utils/graphics'

  const props = withDefaults(
    defineProps<{
      svg: string
      script?: string | null
      alt?: string
      fit?: 'contain' | 'cover'
      trigger?: 'view' | 'manual'
    }>(),
    { fit: 'contain', trigger: 'view' }
  )

  type Timeline = { play(): unknown; restart(): unknown; kill(): unknown }

  const markup = computed(() => (props.fit === 'cover' ? coverSvg(props.svg) : props.svg))

  const host = ref<HTMLElement | null>(null)
  let timeline: Timeline | null = null
  let observer: IntersectionObserver | null = null

  onMounted(async () => {
    if (!props.script || !host.value) return
    const svg = host.value.querySelector('svg')
    if (!svg) return

    const { gsap } = await import('gsap')
    try {
      const build = new Function('svg', 'gsap', props.script) as (s: SVGSVGElement, g: typeof gsap) => Timeline
      timeline = build(svg, gsap)
    } catch (error) {
      console.warn('generated graphic: timeline failed to build', error)
      return
    }
    if (typeof timeline?.play !== 'function') {
      timeline = null
      return
    }
    // For poking at it from devtools: document.querySelector('.graphic').__timeline.restart()
    ;(host.value as HTMLElement & { __timeline?: Timeline }).__timeline = timeline

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const playsInView = props.trigger === 'view' || window.matchMedia('(hover: none)').matches
    if (!playsInView) return

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        timeline?.play()
        observer?.disconnect()
        observer = null
      },
      { threshold: 0.4 }
    )
    observer.observe(host.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    timeline?.kill()
    timeline = null
  })

  function replay() {
    timeline?.restart()
  }

  function onHover() {
    if (props.trigger === 'view') replay()
  }

  defineExpose({ replay })
</script>
