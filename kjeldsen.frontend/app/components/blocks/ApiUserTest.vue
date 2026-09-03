<template>
  <section class="glow-card p-6 md:p-8">
    <p class="eyebrow">Try it</p>
    <div class="mt-4 flex flex-wrap gap-3">
      <button type="button" class="btn" :disabled="pending === 'public'" @click="fetchPublic">
        {{ pending === 'public' ? 'Fetching…' : 'Fetch this page, no auth' }}
      </button>
      <button type="button" class="btn btn-primary" :disabled="pending === 'apiUser'" @click="fetchAsApiUser">
        {{ pending === 'apiUser' ? 'Authenticating…' : 'Fetch as API user' }}
      </button>
    </div>

    <div v-if="steps.length" class="term mt-6">
      <div class="code-bar">
        <span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">devtools, roughly</span>
      </div>
      <div class="py-2">
        <div v-for="(step, i) in steps" :key="i" class="term-row flex-col items-stretch gap-0.5">
          <span class="text-muted">{{ step.label }}</span>
          <span class="flex items-baseline gap-2">
            <i class="term-dot" :class="{ 'is-bad': !step.ok }" aria-hidden="true"></i>
            <span :class="step.ok ? 'text-emerald-300' : 'text-rose-300'">{{ step.detail }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  /**
   * The two buttons the post describes: one call to the Delivery API with nothing attached, and one
   * that trades client credentials for a bearer token on the Management API and calls the Delivery
   * API with it.
   *
   * These run in the browser and talk to the CMS directly rather than going through the Nitro
   * routes, on purpose. The point of the demo is that a reader can open devtools and watch it
   * happen - proxying it server-side would prove nothing and hide the credentials the post is
   * deliberately publishing. The API user behind them is scoped to read exactly one content node.
   */
  import { toContentPath } from '~/composables/useContent'

  // Public on purpose. See "Don't do this at home" further down the post.
  const CLIENT_ID = 'umbraco-back-office-boring'
  const CLIENT_SECRET = 'something-super-duper-secret'

  type Step = { label: string; detail: string; ok: boolean }

  const config = useRuntimeConfig()
  const route = useRoute()

  const steps = ref<Step[]>([])
  const pending = ref<'public' | 'apiUser' | null>(null)

  const cms = computed(() => (config.public.cmsHost || '').replace(/\/$/, ''))
  const itemUrl = computed(
    () => `${cms.value}/umbraco/delivery/api/v2/content/item/${toContentPath(route.params.slug as string | string[])}`
  )

  function describe(body: unknown, status: number): string {
    const named = body as { name?: string; contentType?: string } | null
    return named?.name ? `${status} - ${named.name} (${named.contentType})` : `${status}`
  }

  async function fetchPublic() {
    pending.value = 'public'
    steps.value = [{ label: `GET ${itemUrl.value}`, detail: '...', ok: true }]
    try {
      const res = await fetch(itemUrl.value)
      const body = res.ok ? await res.json() : null
      steps.value = [
        {
          label: `GET ${itemUrl.value}`,
          detail: res.ok ? describe(body, res.status) : `${res.status} - no key, no token, no access`,
          ok: res.ok,
        },
      ]
    } catch (e) {
      steps.value = [{ label: 'GET (no auth)', detail: String(e), ok: false }]
    } finally {
      pending.value = null
    }
  }

  async function fetchAsApiUser() {
    pending.value = 'apiUser'
    steps.value = []
    const tokenUrl = `${cms.value}/umbraco/management/api/v1/security/back-office/token`

    try {
      const auth = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      })

      if (!auth.ok) {
        steps.value = [{ label: `POST ${tokenUrl}`, detail: `${auth.status} - no token`, ok: false }]
        return
      }

      const token = (await auth.json()) as { access_token: string; expires_in: number }
      steps.value = [
        {
          label: `POST ${tokenUrl}`,
          detail: `${auth.status} - bearer ${token.access_token.slice(0, 12)}... (${token.expires_in}s)`,
          ok: true,
        },
      ]

      const res = await fetch(itemUrl.value, { headers: { Authorization: `Bearer ${token.access_token}` } })
      const body = res.ok ? await res.json() : null
      steps.value.push({
        label: `GET ${itemUrl.value}`,
        detail: res.ok ? describe(body, res.status) : `${res.status} - out of this user's scope`,
        ok: res.ok,
      })
    } catch (e) {
      steps.value.push({ label: 'API user call', detail: String(e), ok: false })
    } finally {
      pending.value = null
    }
  }
</script>
