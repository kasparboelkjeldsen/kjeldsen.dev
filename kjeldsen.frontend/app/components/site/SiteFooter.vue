<template>
  <footer class="relative z-[1] mt-24 border-t border-line">
    <div class="container-wide grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr] md:py-20">
      <div>
        <NuxtLink to="/" class="wordmark">kjeldsen<span class="dot" aria-hidden="true"></span>dev</NuxtLink>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-fg-2">
          A headless Umbraco experiment. Backoffice, frontend, pipelines and infrastructure, all
          open source, run as cheaply as a proper setup allows.
        </p>
      </div>

      <div>
        <p class="eyebrow">Pages</p>
        <ul class="mt-4 flex flex-col gap-2">
          <li v-for="link in links" :key="link.destinationId ?? link.url ?? link.title ?? ''">
            <NuxtLink :to="link.route?.path ?? link.url ?? '/'" class="footlink">
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="eyebrow">Elsewhere</p>
        <ul class="mt-4 flex flex-col gap-2">
          <li>
            <a href="https://github.com/kasparboelkjeldsen/kjeldsen.dev" class="footlink" rel="noopener" target="_blank">
              Source on GitHub
            </a>
          </li>
          <li>
            <a href="https://umbraco.com" class="footlink" rel="noopener" target="_blank">Umbraco</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="container-wide flex flex-wrap items-center justify-between gap-3 border-t border-line py-6 font-mono text-xs text-muted">
      <span>© {{ year }} Kaspar Boel Kjeldsen</span>
      <span>Umbraco 18 · Nuxt 4 · Azure</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import type { ApiLinkModel } from '~~/server/delivery-api'

  defineProps<{ links: ApiLinkModel[] }>()

  const year = new Date().getFullYear()
</script>

<style>
  .footlink {
    font-size: 0.9375rem;
    color: var(--color-fg-2);
    transition: color 0.2s ease;
  }
  .footlink:hover {
    color: var(--color-fg);
  }
</style>
