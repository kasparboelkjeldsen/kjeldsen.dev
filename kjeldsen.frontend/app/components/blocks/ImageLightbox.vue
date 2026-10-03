<template>
  <!-- A native modal dialog: the top layer, a focus trap, Escape and focus return come with it. -->
  <dialog
    ref="dialog"
    class="lightbox"
    :class="{ 'is-open': visible }"
    :aria-label="alt || 'Image'"
    @cancel.prevent="close"
    @close="open = false"
    @keydown="key"
  >
    <div class="lightbox-backdrop" :style="{ opacity: 1 - dismissProgress * 0.7 }" />

    <div
      ref="stage"
      class="lightbox-stage"
      :class="{ 'is-gesturing': gesturing, 'is-zoomed': scale > 1 }"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @wheel.prevent="wheel"
    >
      <div class="lightbox-frame">
        <img
          ref="img"
          :src="src"
          :srcset="srcset || undefined"
          :sizes="sizes"
          :alt="alt"
          :style="imgStyle"
          class="lightbox-img"
          :class="{ 'is-loaded': loaded }"
          draggable="false"
          @load="loaded = true"
        >
      </div>
      <span v-if="!loaded" class="lightbox-spinner" aria-hidden="true" />
    </div>

    <div class="lightbox-bar">
      <button type="button" class="lightbox-btn" :aria-label="scale > 1 ? 'Zoom out' : 'Zoom in'" @click="toggleZoom()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5M8 11h6" />
          <path v-if="scale <= 1" d="M11 8v6" />
        </svg>
      </button>
      <button type="button" class="lightbox-btn" aria-label="Close" autofocus @click="close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <div class="lightbox-foot" :style="{ opacity: 1 - dismissProgress }">
      <p v-if="caption" class="lightbox-caption">{{ caption }}</p>
      <p class="lightbox-hint" :class="{ 'is-hidden': interacted }">{{ hint }}</p>
    </div>
  </dialog>
</template>

<script setup lang="ts">
  /**
   * The whole picture, uncropped, as large as the screen allows and never larger than the
   * original. Still resized through the signed media route (widths up to 2000, WebP), with a
   * srcset so a phone fetches a phone-sized file; zooming in swaps the `sizes` hint so the
   * browser fetches the largest one.
   *
   * Zoom and pan are hand-rolled on pointer events, which cover mouse, pen and touch alike:
   * pinch or wheel zooms about the fingers or the cursor, a double tap or double click toggles
   * zoom at that point, one finger pans a zoomed picture, and dragging an unzoomed picture down
   * (or up) dismisses it. A tap beside the picture closes.
   */
  import { withWidth } from '~/utils/images'

  const props = defineProps<{
    url: string
    width?: number | null
    height?: number | null
    alt: string
    caption: string
    /** Focused again on close. Not left to the dialog: Safari never focuses a clicked button. */
    returnFocus?: HTMLElement | null
  }>()
  const open = defineModel<boolean>('open', { required: true })

  const MAX_SCALE = 4
  const DOUBLE_TAP_MS = 300
  const DISMISS_PX = 110
  const WIDTHS = [480, 640, 960, 1280, 1600, 2000]

  const dialog = ref<HTMLDialogElement | null>(null)
  const stage = ref<HTMLElement | null>(null)
  const img = ref<HTMLImageElement | null>(null)

  const visible = ref(false)
  const loaded = ref(false)
  const interacted = ref(false)
  const gesturing = ref(false)
  const hiRes = ref(false)
  const scale = ref(1)
  const tx = ref(0)
  const ty = ref(0)
  const dismissY = ref(0)

  // The picture's laid-out size at scale 1: the stage's content box, kept to the image's own
  // proportions, and never upscaled past the original.
  const fit = ref({ w: 0, h: 0 })
  const ratio = computed(() => (props.width && props.height ? props.width / props.height : 0))

  const widths = computed(() => {
    const original = props.width ?? 0
    if (!original) return WIDTHS
    const below = WIDTHS.filter((w) => w < original)
    return original <= 2000 ? [...below, original] : WIDTHS
  })
  const src = computed(() => withWidth(props.url, widths.value.at(-1)!))
  const srcset = computed(() => widths.value.map((w) => `${withWidth(props.url, w)} ${w}w`).join(', '))
  const sizes = computed(() => {
    const w = Math.round(fit.value.w || 1000)
    return `${hiRes.value ? w * MAX_SCALE : w}px`
  })

  const imgStyle = computed(() => ({
    ...(fit.value.w ? { width: `${fit.value.w}px`, height: `${fit.value.h}px` } : {}),
    transform: `translate3d(${tx.value}px, ${ty.value + dismissY.value}px, 0) scale(${scale.value})`,
  }))

  const dismissProgress = computed(() => Math.min(Math.abs(dismissY.value) / (DISMISS_PX * 2.5), 1))

  const hint = ref('')

  function measure() {
    const el = stage.value
    if (!el) return
    const cs = getComputedStyle(el)
    const boxW = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const boxH = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    if (!ratio.value) {
      fit.value = { w: 0, h: 0 }
      return
    }
    let w = Math.min(boxW, boxH * ratio.value, props.width ?? Infinity)
    w = Math.max(w, 1)
    fit.value = { w, h: w / ratio.value }
  }

  function reset() {
    scale.value = 1
    tx.value = 0
    ty.value = 0
    dismissY.value = 0
  }

  let previousOverflow = ''
  let closeTimer: ReturnType<typeof setTimeout> | undefined

  function show() {
    clearTimeout(closeTimer)
    reset()
    interacted.value = false
    hint.value = matchMedia('(pointer: coarse)').matches
      ? 'Pinch to zoom · drag to move · swipe down to close'
      : 'Scroll or double-click to zoom · Esc to close'
    if (!dialog.value?.open) dialog.value?.showModal()
    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    // measure() reads layout, so the dialog's closed styles are computed before the class flips
    // and the fade runs; no animation frame needed (none arrives in a background tab).
    measure()
    visible.value = true
  }

  function hide() {
    visible.value = false
    document.documentElement.style.overflow = previousOverflow
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    closeTimer = setTimeout(() => {
      if (dialog.value?.open) dialog.value.close()
      props.returnFocus?.focus({ preventScroll: true })
    }, reduced ? 0 : 260)
  }

  function close() {
    open.value = false
  }

  watch(open, (v) => (v ? show() : hide()))
  onMounted(() => {
    if (open.value) show()
    window.addEventListener('resize', onResize)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (visible.value) document.documentElement.style.overflow = previousOverflow
  })

  function onResize() {
    measure()
    clampPan()
  }

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  // How far the picture may move at the current scale: only as far as it overhangs the stage.
  function bounds() {
    const el = stage.value
    const w = (img.value?.offsetWidth ?? 0) * scale.value
    const h = (img.value?.offsetHeight ?? 0) * scale.value
    return {
      x: Math.max(0, (w - (el?.clientWidth ?? 0)) / 2),
      y: Math.max(0, (h - (el?.clientHeight ?? 0)) / 2),
    }
  }

  // Past the edge the picture follows at a third of the finger's speed, then springs back.
  const soft = (v: number, max: number) => (v > max ? max + (v - max) / 3 : v < -max ? -max + (v + max) / 3 : v)

  function clampPan() {
    if (scale.value <= 1.01) {
      scale.value = 1
      tx.value = 0
      ty.value = 0
      return
    }
    const b = bounds()
    tx.value = clamp(tx.value, -b.x, b.x)
    ty.value = clamp(ty.value, -b.y, b.y)
  }

  type Point = { x: number; y: number }
  type Pose = { scale: number; tx: number; ty: number }

  function stageCentre(): Point {
    const r = stage.value!.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  /**
   * Sets the scale so the point of the picture that was under `anchor` at `from` ends up under
   * `to`. The transform is translate-then-scale about the picture's centre, which sits at the
   * stage's centre, so a picture point q shows at centre + t + s * q.
   */
  function zoomAbout(from: Pose, s: number, anchor: Point, to: Point) {
    const c = stageCentre()
    const qx = (anchor.x - c.x - from.tx) / from.scale
    const qy = (anchor.y - c.y - from.ty) / from.scale
    scale.value = s
    tx.value = to.x - c.x - qx * s
    ty.value = to.y - c.y - qy * s
    if (s > 1.3) hiRes.value = true
  }

  function toggleZoom(at?: Point) {
    interacted.value = true
    if (scale.value > 1) {
      reset()
      return
    }
    const p = at ?? stageCentre()
    zoomAbout({ scale: 1, tx: 0, ty: 0 }, 2.5, p, p)
    clampPan()
  }

  const pointers = new Map<number, Point>()
  let start: Pose & { dist: number; mid: Point; at: Point } = { scale: 1, tx: 0, ty: 0, dist: 1, mid: { x: 0, y: 0 }, at: { x: 0, y: 0 } }
  let moved = false
  let pressedPicture = false
  let lastTap = 0

  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) || 1
  const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

  // Every change in the number of fingers restarts the gesture from where the picture is now,
  // so lifting one finger of a pinch carries on as a pan without a jump.
  function begin() {
    const [a, b] = [...pointers.values()]
    start = { scale: scale.value, tx: tx.value, ty: ty.value, dist: 1, mid: { x: 0, y: 0 }, at: a ?? { x: 0, y: 0 } }
    if (a && b) {
      start.dist = distance(a, b)
      start.mid = midpoint(a, b)
    }
  }

  function down(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // Read before capturing: once captured, every later event targets the stage.
    if (pointers.size === 0) {
      moved = false
      pressedPicture = e.target === img.value
    }
    try {
      stage.value?.setPointerCapture(e.pointerId)
    } catch {
      // The pointer is already gone (lifted between the event and this handler).
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    gesturing.value = true
    begin()
  }

  function move(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const [a, b] = [...pointers.values()]
    if (!a) return

    if (b) {
      moved = true
      interacted.value = true
      dismissY.value = 0
      const s = clamp((start.scale * distance(a, b)) / start.dist, 1, MAX_SCALE)
      zoomAbout(start, s, start.mid, midpoint(a, b))
      return
    }

    const dx = a.x - start.at.x
    const dy = a.y - start.at.y
    if (!moved && Math.hypot(dx, dy) < 6) return
    moved = true
    interacted.value = true

    if (scale.value > 1) {
      const bnd = bounds()
      tx.value = soft(start.tx + dx, bnd.x)
      ty.value = soft(start.ty + dy, bnd.y)
    } else {
      dismissY.value = dy
    }
  }

  function up(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    if (pointers.size > 0) {
      begin()
      return
    }
    gesturing.value = false

    if (dismissY.value) {
      if (Math.abs(dismissY.value) > DISMISS_PX) close()
      else dismissY.value = 0
      return
    }
    if (!moved && e.type === 'pointerup') tap(e)
    clampPan()
  }

  function tap(e: PointerEvent) {
    const now = performance.now()
    if (pressedPicture && now - lastTap < DOUBLE_TAP_MS) {
      lastTap = 0
      toggleZoom({ x: e.clientX, y: e.clientY })
      return
    }
    lastTap = pressedPicture ? now : 0
    if (!pressedPicture && scale.value === 1) close()
  }

  function wheel(e: WheelEvent) {
    interacted.value = true
    const s = clamp(scale.value * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), 1, MAX_SCALE)
    const p = { x: e.clientX, y: e.clientY }
    zoomAbout({ scale: scale.value, tx: tx.value, ty: ty.value }, s, p, p)
    clampPan()
  }

  function key(e: KeyboardEvent) {
    const step = 80
    if (e.key === '+' || e.key === '=') zoomAbout({ scale: scale.value, tx: tx.value, ty: ty.value }, clamp(scale.value * 1.5, 1, MAX_SCALE), stageCentre(), stageCentre())
    else if (e.key === '-') zoomAbout({ scale: scale.value, tx: tx.value, ty: ty.value }, clamp(scale.value / 1.5, 1, MAX_SCALE), stageCentre(), stageCentre())
    else if (e.key === '0') reset()
    else if (scale.value > 1 && e.key.startsWith('Arrow')) {
      if (e.key === 'ArrowLeft') tx.value += step
      if (e.key === 'ArrowRight') tx.value -= step
      if (e.key === 'ArrowUp') ty.value += step
      if (e.key === 'ArrowDown') ty.value -= step
    } else return
    e.preventDefault()
    interacted.value = true
    clampPan()
  }
</script>
