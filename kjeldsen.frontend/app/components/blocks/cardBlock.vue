<template>
  <div class="p-12 bg-white shadow-xl rounded-[48px]">
    <h2 class="mb-6 text-3xl font-bold text-[var(--zoo-primary-2)]">
      {{ data.properties?.title }}
    </h2>

    <div v-html="data.properties?.text?.markup" class="mb-8 text-lg text-gray-700"></div>

    <div class="grid gap-8 md:grid-cols-3">
      <!-- Card 1 -->
      <div
        class="p-6 border-2 border-[var(--zoo-secondary-2)] rounded-3xl"
        v-for="block in data.properties?.cards?.items.map(
          (item) => item.content as CardElementModel
        ) || []"
        :key="block.id"
      >
        <h3 class="mb-2 text-xl font-bold text-[var(--zoo-primary-1)]">
          {{ block.properties?.title }}
        </h3>
        <p class="mb-4 text-3xl font-black text-[var(--zoo-primary-2)]">
          {{ block.properties?.call }}
        </p>
        <button
          class="w-full py-3 font-bold text-white uppercase transition-colors rounded-full bg-[var(--zoo-primary-2)] hover:bg-[var(--zoo-primary-1)]"
        >
          {{ block.properties?.action?.at(0)?.title }}
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type { CardBlockElementModel, CardElementModel } from '~~/server/delivery-api'

  const props = defineProps<{
    data: CardBlockElementModel
  }>()
</script>
