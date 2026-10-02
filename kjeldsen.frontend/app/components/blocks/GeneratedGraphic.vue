<template>
  <!-- The SVG is server-rendered as a still, so the picture is there before any script - and for
       readers without it. The timeline, when there is one, is bolted on after mount. -->
  <div
    ref="host"
    class="graphic"
    :class="{ 'is-animated': !!script }"
    role="img"
    :aria-label="alt || undefined"
    @mouseenter="replay"
    @pointerdown="replay"
    v-html="svg"
  />
</template>

<script setup lang="ts">
  /**
   * A generated graphic: inline SVG drawn by the model, animated by a GSAP timeline it also wrote.
   *
   * The script is model output, executed on the page on purpose - the editor who saved the media
   * item chose that. It is given only the <svg> element and gsap, and the generator strips script
   * elements and event attributes out of the markup. The timeline plays once when the graphic
   * scrolls into view, and again on hover or tap. Under prefers-reduced-motion it never starts by
   * itself; a tap still plays it, because then the reader asked.
   */
  const props = defineProps<{ svg: string; script?: string | null; alt?: string }>()

  type Timeline = { play(): unknown; restart(): unknown; kill(): unknown }

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
</script>
