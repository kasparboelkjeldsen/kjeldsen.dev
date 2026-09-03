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

    <!-- No syntax highlighting on purpose: V1 pulled in shiki and had to inline a dozen of its
         transitive ESM deps in the Nitro build to work. Add it back deliberately, if at all. -->
    <pre class="code-body m-0"><code><span v-for="(line, i) in lines" :key="i" class="code-line">{{ line }}</span></code></pre>
  </div>
</template>

<script setup lang="ts">
  import type { CodeBlockElementModel } from '~~/server/delivery-api'

  const props = defineProps<{ block: CodeBlockElementModel }>()

  // Editors paste Markdown fences into the code field - ```json ... ``` - so the language is
  // read off the opening fence and the fences themselves are dropped.
  const parsed = computed(() => {
    const raw = (props.block.properties?.code ?? '').replace(/\r\n?/g, '\n')
    const fenced = raw.match(/^\s*```([\w+#.-]*)[ \t]*\n([\s\S]*?)\n?[ \t]*```\s*$/)
    const body = (fenced ? fenced[2] : raw) ?? ''
    return { lang: fenced?.[1] ?? '', body: body.replace(/\s+$/, '') }
  })

  const lang = computed(() => parsed.value.lang)
  const lines = computed(() => (parsed.value.body ? parsed.value.body.split('\n') : []))

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
