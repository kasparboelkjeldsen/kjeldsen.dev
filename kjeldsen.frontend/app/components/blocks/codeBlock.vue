<template>
  <Glasslike :title="displayTitle" variant="highlight">
    <div class="code-wrap">
      <MDC :value="rawMarkdown" class="mdc-root" />
    </div>
  </Glasslike>
  
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import Glasslike from '../glasslike.vue'
import type { CodeBlockElementModel } from "~/../server/delivery-api";

const props = defineProps<{
  data: CodeBlockElementModel;
}>();

const rawMarkdown = computed(() => props.data.properties?.code ?? '')

const langRaw = computed(() => {
  const m = rawMarkdown.value.match(/```\s*([a-zA-Z0-9_+-]+)/)
  return (m?.[1] || '').toLowerCase()
})

const prettyLang = (code: string): string => {
  const map: Record<string, string> = {
    js: 'JavaScript', javascript: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
    ts: 'TypeScript', typescript: 'TypeScript',
    json: 'JSON', yaml: 'YAML', yml: 'YAML',
    html: 'HTML', xml: 'XML', css: 'CSS', scss: 'SCSS', less: 'LESS',
    bash: 'Shell', sh: 'Shell', shell: 'Shell', powershell: 'PowerShell', ps1: 'PowerShell',
    csharp: 'C#', cs: 'C#',
    java: 'Java', kotlin: 'Kotlin', kt: 'Kotlin',
    python: 'Python', py: 'Python',
    sql: 'SQL', graphql: 'GraphQL',
    go: 'Go', rust: 'Rust', rs: 'Rust',
    php: 'PHP', ruby: 'Ruby', rb: 'Ruby'
  }
  return map[code] || (code ? code.toUpperCase() : 'Code')
}

const displayTitle = computed(() => prettyLang(langRaw.value))

</script>

<style>
/* Tweak code font-size and scrollbars inside the rendered markdown */
.code-wrap :deep(pre) {
  font-size: 0.85rem;
  line-height: 1.45;
  overflow: auto;
  border-radius: 8px;
}
.mdc-root pre {
  background: #24292e !important;
}
.mdc-root .line {
  font-size: 14px;
}
/* Make horizontal scrollbar subtler/prettier */
.code-wrap :deep(pre)::-webkit-scrollbar {
  height: 8px;
}
.code-wrap :deep(pre)::-webkit-scrollbar-track {
  background: transparent;
}
.code-wrap :deep(pre)::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.45); /* slate-300/45 */
  border-radius: 9999px;
  border: 2px solid transparent; /* creates padding effect */
  background-clip: padding-box;
}
/* Firefox */
.code-wrap :deep(pre) {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
}

/* MDC root has inline background via :style on component */
</style>
