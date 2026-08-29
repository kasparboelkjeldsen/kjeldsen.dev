<template>
  <!-- No syntax highlighting in V2 on purpose: V1 pulled in shiki and had to inline a dozen of
       its transitive ESM deps in the Nitro build to work. Add it back deliberately, if at all. -->
  <pre
    v-if="code"
    class="overflow-x-auto border p-3 font-mono text-sm"
  ><code>{{ code }}</code></pre>
</template>

<script setup lang="ts">
  import type { CodeBlock } from '~~/types/content'

  const props = defineProps<{ block: CodeBlock }>()
  const code = computed(() => props.block.properties.code ?? '')
</script>
