<template>
  <!-- The owner's HTML, verbatim and unsanitised. There is one editor; that is the trust model. -->
  <div v-if="html" ref="root" v-html="html" />
</template>

<script setup lang="ts">
  import type { DangerouslyInlineScriptBlockElementModel } from '~~/server/delivery-api'

  const props = defineProps<{ block: DangerouslyInlineScriptBlockElementModel }>()

  const html = computed(() => props.block.properties?.html ?? '')
  const root = ref<HTMLElement>()

  // On a server-rendered load the browser already ran the scripts while parsing the page. After a
  // client-side navigation the HTML arrives through innerHTML, which never runs a <script>, so each
  // one is swapped for a fresh element that does. `async = false` keeps external scripts in order.
  const hydrating = useNuxtApp().isHydrating

  onMounted(() => {
    if (hydrating || !root.value) return
    for (const old of root.value.querySelectorAll('script')) {
      const script = document.createElement('script')
      for (const { name, value } of old.attributes) script.setAttribute(name, value)
      script.async = false
      script.text = old.text
      old.replaceWith(script)
    }
  })
</script>
