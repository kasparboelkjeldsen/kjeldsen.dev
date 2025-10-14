<template>
  <div class="relative min-h-screen font-sans text-white bg-black">
    <!-- Background image layer -->
    <div class="fixed inset-0 z-0 overflow-hidden">
      <div class="will-change-transform" :style="{ transform: `translateY(${parallaxOffset}px)` }">
        <!-- Use responsive <picture> fed by Umbraco media (?width=) -->
        <picture v-if="backgroundUrl">
          <!-- xl / 2xl screens -->
          <source media="(min-width: 1536px)" :srcset="bgWithWidth(1920)" />
          <!-- large desktops -->
          <source media="(min-width: 1280px)" :srcset="bgWithWidth(1920)" />
          <!-- desktops -->
          <source media="(min-width: 1024px)" :srcset="bgWithWidth(1280)" />
          <!-- tablets -->
          <source media="(min-width: 640px)" :srcset="bgWithWidth(768)" />
          <!-- fallback for small phones -->
          <img
            :src="bgWithWidth(320, 10)"
            alt=""
            class="object-cover w-full h-full fancy-background"
            fetchpriority="high"
          />
        </picture>
        <!-- Fallback to local asset if no background is configured -->
        <img
          v-else
          src="/assets/img/bgsmall.webp"
          alt=""
          class="object-cover w-full h-full fancy-background"
        />
        <div
          class="absolute inset-x-0 bottom-0 h-48 pointer-events-none sm:hidden mobile-bottom-fade"
        ></div>
      </div>
      <div class="absolute inset-0 custom-vignette-gradient"></div>
      <!-- Extra bottom fade for mobile only to cover parallax gap -->
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { computed } from 'vue'

  // Add view transitions CSS to head
  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: '/view-transitions.css',
      },
    ],
  })

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

  const { data: site } = await useSite()

  // Derive usable background URL from Umbraco model (array/object/string)
  const backgroundUrl = computed(() => {
    const bg: any = site.value?.properties?.background
    if (!bg) return ''
    if (Array.isArray(bg)) return bg[0]?.url ?? ''
    if (typeof bg === 'string') return bg
    return bg?.url ?? ''
  })

  // Ensure we append width correctly even if the URL already has query params
  const bgWithWidth = (w: number, quality: number = 75) => {
    const base = backgroundUrl.value
    if (!base) return ''
    const sep = base.includes('?') ? '&' : '?'
    const cropped = w < 1920
    const extra = cropped ? '&rmode=crop&rxy=0.5,0.5' : ''
    return `${base}${sep}width=${w}&quality=${quality}${extra}`
  }
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
  .mobile-bottom-fade {
    background-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.7) 60%,
      black 100%
    );
  }
  h1,
  h2,
  h3,
  h4,
  h5 {
    word-wrap: break-word;
  }
</style>
