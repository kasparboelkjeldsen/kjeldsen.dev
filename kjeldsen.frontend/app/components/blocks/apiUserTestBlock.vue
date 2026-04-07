<template>
  <div>
    <button @click="tryMe">Try Me</button>
    <pre>{{ output }}</pre>
  </div>
</template>

<script lang="ts" setup>
  import type { IApiElementModel } from '~/../server/delivery-api'

  defineProps<{ data: IApiElementModel; columns: number }>()

  const { public: { cmsHost } } = useRuntimeConfig()
  const output = ref('(click Try Me)')

  async function tryMe() {
    output.value = 'Fetching token...'

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
      output.value = `Got token: ${access_token.substring(0, 20)}...\n\nFetching content...`

      const contentRes = await fetch(`${cmsHost}/umbraco/delivery/api/v2/content?fetch=children:/`, {
        headers: {
          'Api-User': `Bearer ${access_token}`,
          'Accept-Language': 'en-US'
        }
      })

      const data = await contentRes.json()
      output.value = JSON.stringify(data, null, 2)

    } catch (err: any) {
      output.value = `Error: ${err.message}`
    }
  }
</script>
