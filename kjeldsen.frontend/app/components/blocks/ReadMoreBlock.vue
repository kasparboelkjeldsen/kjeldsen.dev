<template>
  <section v-if="markup" ref="root" class="read-more" :class="{ 'is-open': open, 'is-short': short }">
    <!-- The whole text is in the server-rendered markup; folded, only the first lines show,
         fading out under the button. -->
    <div :id="id" ref="body" class="read-more-body" :style="height === null ? undefined : { maxHeight: height }" @transitionend.self="settled">
      <div class="rte" v-html="markup" />
    </div>

    <div v-if="!short" class="read-more-bar">
      <button type="button" class="read-more-toggle" :aria-expanded="open" :aria-controls="id" @click="toggle">
        <span v-html="open ? closeLabel : label" />
        <svg class="read-more-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
  /**
   * Text that starts folded. The height animates between the CSS peek and the text's measured
   * height (an inline max-height for the length of the transition, `none` once open, so a
   * resize never clips it). Text no taller than the peek is shown whole without a button.
   */
  import type { ReadMoreBlockElementModel } from '~~/server/delivery-api'
  import { markMarkup, markText } from '~/utils/marks'

  const props = defineProps<{ block: ReadMoreBlockElementModel }>()

  const markup = computed(() => markMarkup(props.block.properties?.text?.markup))
  const label = computed(() => markText(props.block.properties?.label?.trim() || 'Read more'))
  const closeLabel = computed(() => markText(props.block.properties?.closeLabel?.trim() || 'Show less'))

  const id = useId()
  const root = ref<HTMLElement | null>(null)
  const body = ref<HTMLElement | null>(null)
  const open = ref(false)
  const short = ref(false)
  const height = ref<string | null>(null)

  onMounted(() => {
    const el = body.value
    if (el && el.scrollHeight <= el.clientHeight + 8) short.value = true
  })

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

  async function toggle() {
    const el = body.value
    if (!el) return

    if (!open.value) {
      open.value = true
      height.value = reduced() ? 'none' : `${el.scrollHeight}px`
      // transitionend does not arrive in a background tab; never leave the open text pinned.
      setTimeout(() => open.value && (height.value = 'none'), 1000)
      return
    }

    // From `none` there is nothing to transition from, so pin the current height first.
    height.value = `${el.scrollHeight}px`
    await nextTick()
    void el.offsetHeight
    open.value = false
    height.value = null

    // Folding a long text from its end leaves the reader below it; bring the block back.
    const top = root.value?.getBoundingClientRect().top ?? 0
    if (top < 0) root.value?.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' })
  }

  function settled(e: TransitionEvent) {
    if (e.propertyName === 'max-height' && open.value) height.value = 'none'
  }
</script>
