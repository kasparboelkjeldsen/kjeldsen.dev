<template>
  <!-- Not class="outline": that is a Tailwind utility and draws a box around the nav. -->
  <nav v-if="headings.length > 1" aria-label="On this page" class="post-outline pl-4">
    <p class="eyebrow">On this page</p>
    <ol class="mt-4 flex flex-col">
      <li v-for="h in headings" :key="h.id">
        <a :href="`#${h.id}`" class="outline-link" :class="{ 'is-active': h.id === active }">
          {{ h.text }}
        </a>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
  /**
   * The post's second-level headings, with the one currently under the reader lit.
   *
   * Ids come from the same slugify the heading block uses, so the two agree without either knowing
   * about the other. Only rendered when there is something to navigate.
   */
  import { slugify } from '~/utils/slug'
  import type { BlockGrid } from '~~/types/content'

  const props = defineProps<{ grid: BlockGrid }>()

  const headings = computed(() =>
    props.grid.items
      .map((item) => item.content)
      .filter((c) => c?.contentType === 'headerBlock')
      .map((c) => {
        const p = c.properties as { headerTitle?: string | null; headerLevel?: string | null } | undefined
        const level = parseInt((p?.headerLevel ?? '').replace(/\D/g, ''), 10)
        const text = (p?.headerTitle ?? '').replace(/\*\*|--/g, '')
        return { level, text, id: slugify(p?.headerTitle) }
      })
      .filter((h) => h.level === 2 && h.id)
  )

  const active = ref<string | null>(null)

  let ticking = false

  function update() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      // The last heading that has passed the top third of the viewport is the current section.
      const line = window.innerHeight * 0.3
      let current: string | null = null
      for (const h of headings.value) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= line) current = h.id
      }
      active.value = current ?? headings.value[0]?.id ?? null
      ticking = false
    })
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', update))
</script>

<style>
  .outline-link {
    position: relative;
    display: block;
    padding: 0.35rem 0 0.35rem 1rem;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--color-muted);
    transition: color 0.25s ease;
  }
  .outline-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35rem;
    bottom: 0.35rem;
    width: 1px;
    background: rgb(255 255 255 / 0.1);
    transition: background-color 0.3s ease, width 0.3s ease;
  }
  .outline-link:hover {
    color: var(--color-fg-2);
  }
  .outline-link.is-active {
    color: var(--color-fg);
  }
  .outline-link.is-active::before {
    width: 2px;
    background: linear-gradient(to bottom, var(--color-sky), var(--color-violet));
  }
</style>
