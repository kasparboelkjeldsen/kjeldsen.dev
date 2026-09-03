<template>
  <NuxtLayout>
    <PageHero :image="backdrop.src" :image-set="backdrop.srcset" :eyebrow="String(error.statusCode)" :title="title" :lede="lede" size="xl">
      <template #meta>
        <div class="mt-9 flex flex-wrap gap-3">
          <button type="button" class="btn btn-primary" @click="home">
            Back to the start <span class="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </template>
    </PageHero>
  </NuxtLayout>
</template>

<script setup lang="ts">
  import type { NuxtError } from '#app'
  import PageHero from '~/components/site/PageHero.vue'
  import { UNSPLASH, unsplash, unsplashSrcset } from '~/utils/images'

  const props = defineProps<{ error: NuxtError }>()

  const notFound = computed(() => props.error.statusCode === 404)

  const title = computed(() => (notFound.value ? 'Lost in space' : 'Something broke'))
  const lede = computed(() =>
    notFound.value
      ? 'There is no page at this address. It may have moved, or it may never have existed.'
      : 'The page could not be rendered. It is probably the CMS, and it is probably temporary.'
  )

  const backdrop = { src: unsplash(UNSPLASH.milkyWay, 1800), srcset: unsplashSrcset(UNSPLASH.milkyWay) }

  useHead({ title: () => `${title.value} · kjeldsen.dev` })

  function home() {
    clearError({ redirect: '/' })
  }
</script>
