<template>
  <div class="relative flex min-h-screen flex-col">
    <!-- The atmosphere: a slow aurora behind everything, a film grain over it. Both fixed, both
         inert, both purely decorative. -->
    <div class="aurora" aria-hidden="true">
      <i class="a"></i>
      <i class="b"></i>
      <i class="c"></i>
    </div>
    <div class="grain" aria-hidden="true"></div>

    <SiteHeader :links="links" />

    <main class="relative z-[1] flex-1">
      <slot />
    </main>

    <SiteFooter :links="links" />
  </div>
</template>

<script setup lang="ts">
  import SiteHeader from '~/components/site/SiteHeader.vue'
  import SiteFooter from '~/components/site/SiteFooter.vue'

  const { links } = await useNavigation()
</script>
