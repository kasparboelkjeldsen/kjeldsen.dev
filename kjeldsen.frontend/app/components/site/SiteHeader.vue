<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled, 'is-hidden': hidden }">
    <nav
      class="container-wide flex items-center justify-between transition-[padding] duration-300"
      :class="scrolled ? 'py-3' : 'py-5'"
      aria-label="Main"
    >
      <NuxtLink to="/" class="wordmark" aria-label="kjeldsen.dev, home">
        kjeldsen<span class="dot" aria-hidden="true"></span>dev
      </NuxtLink>

      <ul class="flex items-center gap-1">
        <li v-for="link in navLinks" :key="link.destinationId ?? link.url ?? link.title ?? ''">
          <NuxtLink :to="link.route?.path ?? link.url ?? '/'" class="navlink">
            {{ link.title }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
  import type { ApiLinkModel } from '~~/server/delivery-api'

  const props = defineProps<{ links: ApiLinkModel[] }>()

  // The wordmark is the way home, so the editor's home link would be a duplicate next to it.
  const navLinks = computed(() => props.links.filter((l) => (l.route?.path ?? l.url) !== '/'))

  // Two states off one passive scroll listener: past the top the bar picks up its glass, and
  // scrolling down through a page tucks it away so the reading column has the whole viewport.
  // Scrolling back up brings it straight back.
  const scrolled = ref(false)
  const hidden = ref(false)

  let lastY = 0
  let ticking = false

  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const y = window.scrollY
      scrolled.value = y > 24
      if (y <= 320 || y < lastY - 4) hidden.value = false
      else if (y > lastY + 4) hidden.value = true
      lastY = y
      ticking = false
    })
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>
