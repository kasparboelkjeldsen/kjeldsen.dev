<template>
  <div class="min-h-screen flex flex-col font-sans">
    <header class="border-b">
      <nav class="mx-auto max-w-3xl px-4 py-4">
        <ul class="flex gap-4 text-sm">
          <li v-for="link in links" :key="link.title ?? link.url ?? ''">
            <NuxtLink :to="link.route?.path ?? link.url ?? '/'" class="underline-offset-4 hover:underline">
              {{ link.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <slot />
    </main>

    <footer class="border-t">
      <div class="mx-auto max-w-3xl px-4 py-4 text-sm">kjeldsen.dev</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  const { links } = await useNavigation()
</script>
