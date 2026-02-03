<template>
  <div class="prose prose-invert max-w-none">
    <p class="mb-4 text-gray-300">
      To "pull the plug," You will have to log in with GitHub. <br />I'll
      <strong>only retrieve your public GitHub username</strong> — nothing else. Your username will
      be recorded in the database along with the time you pressed the button. This action will be
      visible to other users in the activity log.
    </p>
    <ClientOnly>
      <div v-if="username" class="mt-4 text-green-500 font-semibold">
        ✅ {{ username }}, you’ve already pushed the button!
      </div>
    </ClientOnly>
    <button
      class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded mt-4"
      @click="loginWithGitHub"
    >
      {{ username ? 'Really? Again?' : 'Pull the plug for 30 sec' }}
    </button>
  </div>
</template>
<script lang="ts" setup>
  const config = useRuntimeConfig()
  const route = useRoute()
  const clientId = config.public.murderClient
  const isPreview = route.query.engagePreviewAbTestVariantId !== undefined
  const usernameCookie = !isPreview ? useCookie<string | null>('pushed-by') : ref(null)

  const username = usernameCookie.value

  function loginWithGitHub() {
    const currentPage = window.location.origin + window.location.pathname + window.location.search
    const callbackUrl = `${window.location.origin}/api/github/callback`
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user&state=${encodeURIComponent(currentPage)}`
    window.location.href = githubAuthUrl
  }
</script>
