<template>
  <Glasslike :title="displayTitle" variant="highlight" class="-mx-4 sm:mx-0">
    <div class="code-wrap">
      <div v-if="highlighted" v-html="highlighted.html" class="shiki-root" />
      <pre v-else class="text-sm text-slate-400">Loading...</pre>
    </div>
  </Glasslike>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import Glasslike from '../glasslike.vue'
  import type { CodeBlockElementModel } from '~/../server/delivery-api'

  const props = defineProps<{
    data: CodeBlockElementModel
  }>()

  const rawMarkdown = computed(() => props.data.properties?.code ?? '')

  // Generate a stable key for caching based on content hash
  const cacheKey = computed(() => {
    const content = rawMarkdown.value
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0
    }
    return `highlight-${hash}`
  })

  // Fetch highlighted HTML from server (SSR preferred, cached on client)
  const { data: highlighted } = await useAsyncData<{ html: string; language: string }>(
    cacheKey.value,
    () => $fetch('/api/highlight', {
      method: 'POST',
      body: { markdown: rawMarkdown.value },
    })
  )

  const langRaw = computed(() => {
    const m = rawMarkdown.value.match(/```\s*([a-zA-Z0-9_+-]+)/)
    return (m?.[1] || '').toLowerCase()
  })

  const prettyLang = (code: string): string => {
    const map: Record<string, string> = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      mjs: 'JavaScript',
      cjs: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      json: 'JSON',
      yaml: 'YAML',
      yml: 'YAML',
      html: 'HTML',
      xml: 'XML',
      css: 'CSS',
      scss: 'SCSS',
      less: 'LESS',
      bash: 'Shell',
      sh: 'Shell',
      shell: 'Shell',
      powershell: 'PowerShell',
      ps1: 'PowerShell',
      csharp: 'C#',
      cs: 'C#',
      java: 'Java',
      kotlin: 'Kotlin',
      kt: 'Kotlin',
      python: 'Python',
      py: 'Python',
      sql: 'SQL',
      graphql: 'GraphQL',
      go: 'Go',
      rust: 'Rust',
      rs: 'Rust',
      php: 'PHP',
      ruby: 'Ruby',
      rb: 'Ruby',
    }
    return map[code] || (code ? code.toUpperCase() : 'Code')
  }

  const displayTitle = computed(() => prettyLang(langRaw.value))
</script>

<style>
  /* Shiki generates a pre > code structure with inline styles */
  .shiki-root :deep(pre) {
    font-size: 0.85rem;
    line-height: 1.6;
    overflow-x: auto;
    border-radius: 8px;
    padding: 1rem;
    margin: 0;
  }

  .shiki-root :deep(code) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }

  /* Horizontal scrollbar styling */
  .code-wrap :deep(pre)::-webkit-scrollbar {
    height: 8px;
  }
  .code-wrap :deep(pre)::-webkit-scrollbar-track {
    background: transparent;
  }
  .code-wrap :deep(pre)::-webkit-scrollbar-thumb {
    background-color: rgba(148, 163, 184, 0.45);
    border-radius: 9999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  /* Firefox scrollbar */
  .code-wrap :deep(pre) {
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
  }
</style>
