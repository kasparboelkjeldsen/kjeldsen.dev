<template>
  <div v-if="lines.length" class="code-window breakout">
    <div class="code-bar">
      <span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span v-if="lang" class="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">{{ lang }}</span>
      <button
        type="button"
        class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.7rem] text-fg-2 transition hover:border-line-2 hover:text-fg"
        :aria-label="copied ? 'Copied' : 'Copy code'"
        @click="copy"
      >
        <svg v-if="!copied" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>

    <!-- Highlighting happens on the server (server/utils/highlight.ts): the payload arrives with
         one HTML string per line, built from escaped text and inline colours, and the client never
         loads a highlighter. A language without a grammar there renders as plain text. -->
    <pre v-if="highlighted" class="code-body m-0"><code><span v-for="(line, i) in highlighted" :key="i" class="code-line" v-html="line || ' '" /></code></pre>
    <pre v-else class="code-body m-0"><code><span v-for="(line, i) in lines" :key="i" class="code-line">{{ line }}</span></code></pre>
  </div>
</template>

<script setup lang="ts">
  import type { CodeBlockElementModel } from '~~/server/delivery-api'
  import { parseFence } from '~~/shared/fence'

  const props = defineProps<{ block: CodeBlockElementModel }>()

  // `highlighted` and `language` are added to the payload by the server; the generated model
  // does not know them.
  type Highlighted = { highlighted?: string[]; language?: string }

  const parsed = computed(() => parseFence(props.block.properties?.code))
  const extra = computed(() => props.block.properties as Highlighted | undefined)

  const lang = computed(() => extra.value?.language || parsed.value.lang)
  const lines = computed(() => (parsed.value.body ? parsed.value.body.split('\n') : []))
  const highlighted = computed(() => {
    const h = extra.value?.highlighted
    return h && h.length === lines.value.length ? h : null
  })

  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy() {
    try {
      await navigator.clipboard.writeText(parsed.value.body)
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => (copied.value = false), 1600)
    } catch {
      // Clipboard access can be refused; the text is still there to select.
    }
  }
</script>
