<template>
  <div class="relative min-h-screen font-sans text-white bg-black">
    <!-- Background image layer -->
    <div class="fixed inset-0 z-0 overflow-hidden">
      <div class="will-change-transform" :style="{ transform: `translateY(${parallaxOffset}px)` }">
        <img
          src="/assets/img/bgsmall.webp"
          alt=""
          class="object-cover w-full h-full fancy-background"
        />
        <img
          src="/assets/img/bgsmall.webp"
          alt=""
          class="object-cover w-full h-full fancy-background"
          loading="lazy"
        />
        <img
          src="/assets/img/bgsmall.webp"
          alt=""
          class="object-cover w-full h-full fancy-background"
          loading="lazy"
        />
      </div>
      <div class="absolute inset-0 custom-vignette-gradient"></div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const parallaxOffset = ref(0)
  let bgElement: HTMLElement | null = null
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null

  const handleScroll = () => {
    parallaxOffset.value = window.scrollY * -0.05
    if (!bgElement) return
    bgElement.style.setProperty('--blur', '10px')
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      bgElement?.style.setProperty('--blur', '0px')
    }, 50)
  }

  onMounted(() => {
    bgElement = document.querySelector('.fancy-background')
    window.addEventListener('scroll', handleScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })
</script>

<style>
  .will-change-transform {
    height: 100%;
  }
  .fancy-background {
    filter: blur(var(--blur, 0));
    mix-blend-mode: soft-light;
    transition: filter 1s ease;
  }
  .custom-vignette-gradient {
    background-image: linear-gradient(to bottom, black 40px, rgba(0, 0, 0, 0.6) 500px, black 100%);
  }
  h1,
  h2,
  h3,
  h4,
  h5 {
    word-wrap: break-word;
  }
</style>
