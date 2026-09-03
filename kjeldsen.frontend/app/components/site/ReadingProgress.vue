<template>
  <div class="progress" aria-hidden="true">
    <i ref="bar"></i>
  </div>
</template>

<script setup lang="ts">
  /**
   * A two-pixel line along the top that fills as the reader moves down the page.
   *
   * Written straight to the element's transform inside a frame callback rather than through a
   * ref, so a scroll never schedules a Vue render.
   */
  const bar = ref<HTMLElement | null>(null)

  let ticking = false

  function update() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bar.value) bar.value.style.transform = `scaleX(${ratio.toFixed(4)})`
      ticking = false
    })
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  })
</script>
