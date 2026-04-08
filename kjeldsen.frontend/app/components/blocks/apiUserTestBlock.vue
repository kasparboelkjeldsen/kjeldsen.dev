<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2 sm:flex-row">
      <button
        class="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/20"
        @click="tryPublicPath"
      >
        Try public available path
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 ring-1 ring-sky-500/30"
        @click="tryWithApiUser"
      >
        Try with Api-User bearer token
      </button>
    </div>

    <Glasslike v-if="output" :title="outputTitle" variant="highlight" class="-mx-4 sm:mx-0">
      <div class="code-wrap">
        <div v-if="highlighted" v-html="highlighted" class="shiki-root" />
        <pre v-else class="text-sm text-slate-400">{{ output }}</pre>
      </div>
    </Glasslike>
  </div>
</template>

<script lang="ts" setup>
  import type { IApiElementModel } from '~/../server/delivery-api'
  import Glasslike from '../glasslike.vue'

  defineProps<{ data: IApiElementModel; columns: number }>()

  const { public: { cmsHost } } = useRuntimeConfig()
  const contentId = 'df0c2388-df3c-4126-bc32-640f87a66292'
  const route = useRoute()

  const output = ref('')
  const outputTitle = ref('Response')
  const highlighted = ref<string | null>(null)

  async function highlight(text: string) {
    highlighted.value = null
    try {
      const res = await $fetch<{ html: string }>('/api/highlight', {
        method: 'POST',
        body: { markdown: `\`\`\`json\n${text}\n\`\`\`` },
      })
      highlighted.value = res.html
    } catch {
      // fall back to plain pre output
    }
  }

  async function tryPublicPath() {
    const currentPath = route.path
    outputTitle.value = `Public — ${currentPath}`
    output.value = `Fetching...`
    highlighted.value = null

    try {
      const encodedPath = encodeURIComponent(currentPath)
      const contentRes = await fetch(`${cmsHost}/umbraco/delivery/api/v2/content/item/${encodedPath}`, {
        headers: { 'Accept-Language': 'en-US' }
      })

      const data = await contentRes.json()
      output.value = JSON.stringify(data, null, 2)
      await highlight(output.value)
    } catch (err: any) {
      output.value = `Error: ${err.message}`
    }
  }

  async function tryWithApiUser() {
    outputTitle.value = 'Api-User bearer token'
    output.value = 'Fetching token...'
    highlighted.value = null

    try {
      const tokenRes = await fetch(`${cmsHost}/umbraco/management/api/v1/security/back-office/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: 'umbraco-back-office-boring',
          client_secret: 'something-super-duper-secret'
        }).toString()
      })

      if (!tokenRes.ok) {
        output.value = `Token request failed: ${tokenRes.status} ${tokenRes.statusText}\n${await tokenRes.text()}`
        return
      }

      const { access_token } = await tokenRes.json()
      output.value = `Fetching content for id: ${contentId}...`

      const contentRes = await fetch(`${cmsHost}/umbraco/delivery/api/v2/content/item/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept-Language': 'en-US',
        }
      })

      const data = await contentRes.json()
      output.value = JSON.stringify(data, null, 2)
      await highlight(output.value)

    } catch (err: any) {
      output.value = `Error: ${err.message}`
    }
  }
</script>
