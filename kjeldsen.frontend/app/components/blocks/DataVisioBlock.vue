<template>
  <figure v-if="visio" class="m-0" :class="{ breakout: span >= 12 }">
    <div class="frame visio-frame">
      <DataVisioChart
        :spec="visio.spec"
        :data="visio.data"
        :aspect="visio.meta.aspect"
        :summary="visio.summary"
        :still="still"
        :span="span"
      />
    </div>
    <figcaption v-if="visio.caption" class="mt-3 text-center font-mono text-xs text-muted">{{ visio.caption }}</figcaption>
  </figure>

  <!-- A block saved without a chart yet (or whose generation failed) says so instead of leaving a
       hole; the status on the block in the backoffice has the reason. -->
  <div v-else class="frame visio-frame visio-empty">
    <p class="font-mono text-xs text-muted">Chart not generated yet.</p>
  </div>
</template>

<script setup lang="ts">
  import type { DataVisioBlockElementModel } from '~~/server/delivery-api'
  import DataVisioChart from '~/components/blocks/DataVisioChart.vue'
  import { BLOCK_SPAN } from '~/utils/blocks'
  import { visioOf } from '~~/shared/visio'

  const props = defineProps<{ block: DataVisioBlockElementModel }>()

  // Columns in the grid, from the resolver: a full-width chart breaks out of the text column
  // like a photo does, a half-width one stays in its cell.
  const span = inject(BLOCK_SPAN, computed(() => 12))

  const visio = computed(() => visioOf(props.block))

  // `still` is added to the payload by the server (server/utils/visio.ts); the generated model
  // does not know it.
  const still = computed(() => (props.block.properties as { still?: string | null } | undefined)?.still ?? null)
</script>
