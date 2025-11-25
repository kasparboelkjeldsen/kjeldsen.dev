<template>
  <div
    class="min-h-screen py-12 md:py-24 bg-[var(--zoo-secondary-1)] flex items-center justify-center px-4"
  >
    <div
      class="max-w-5xl w-full bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
    >
      <!-- Left Column: Image -->
      <div class="w-full md:w-1/2 relative min-h-[400px] md:min-h-0">
        <img
          v-if="image"
          :src="image"
          :alt="data.name || ''"
          class="absolute inset-0 object-cover w-full h-full"
        />
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200"
        >
          <i class="text-6xl fas fa-paw"></i>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div class="flex flex-col justify-center w-full p-8 md:w-1/2 md:p-12">
        <!-- Header -->
        <div class="mb-6">
          <span
            class="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white uppercase rounded-full bg-[var(--zoo-secondary-3)]"
          >
            {{ data.properties?.type || 'Dyr' }}
          </span>
          <h1 class="text-5xl font-black text-[var(--zoo-primary-1)] mb-2">
            {{ capitalize(data.name) }}
          </h1>
          <div class="h-1 w-20 bg-[var(--zoo-primary-2)] rounded-full"></div>
        </div>

        <!-- Description -->
        <div class="mb-8 leading-relaxed prose prose-lg text-gray-600">
          <p class="font-serif italic text-xl text-[var(--zoo-primary-3)] opacity-80">
            "{{ data.properties?.description }}"
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <div
            class="p-4 rounded-2xl bg-[var(--zoo-secondary-1)]/30 border border-[var(--zoo-secondary-2)]/20"
          >
            <div
              class="text-xs font-bold text-[var(--zoo-secondary-2)] uppercase tracking-wider mb-1"
            >
              Levested
            </div>
            <div class="font-bold text-[var(--zoo-primary-1)]">
              {{ data.properties?.habitat || '-' }}
            </div>
          </div>
          <div
            class="p-4 rounded-2xl bg-[var(--zoo-secondary-1)]/30 border border-[var(--zoo-secondary-2)]/20"
          >
            <div
              class="text-xs font-bold text-[var(--zoo-secondary-2)] uppercase tracking-wider mb-1"
            >
              Føde
            </div>
            <div class="font-bold text-[var(--zoo-primary-1)]">
              {{ data.properties?.diet || '-' }}
            </div>
          </div>
          <div
            class="p-4 rounded-2xl bg-[var(--zoo-secondary-1)]/30 border border-[var(--zoo-secondary-2)]/20"
          >
            <div
              class="text-xs font-bold text-[var(--zoo-secondary-2)] uppercase tracking-wider mb-1"
            >
              Levealder
            </div>
            <div class="font-bold text-[var(--zoo-primary-1)]">
              {{ data.properties?.lifespan || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { AnimalContentResponseModel } from '~~/server/delivery-api'

  const props = defineProps<{ data: AnimalContentResponseModel }>()

  const image = computed(() => {
    const url = props.data.properties?.image?.[0]?.url
    if (!url) return null
    return `${url}?width=800&height=1000&mode=crop`
  })

  const capitalize = (s: string | null | undefined) => {
    if (!s) return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
</script>
