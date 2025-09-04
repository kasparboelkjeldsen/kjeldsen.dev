import { SecretClient } from '@azure/keyvault-secrets'
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import { ClientSecretCredential } from '@azure/identity'
import 'dotenv/config'

const mappingFilePath = path.resolve('./secrets-keys.json')
const outputEnvPath = path.resolve('./.env')

const keyVaultUrl = 'https://kjdevkv.vault.azure.net/'

console.log(process.env.AZURE_TENANT_ID)

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
)
const client = new SecretClient(keyVaultUrl, credential)

const run = async () => {
  console.log('🔍 Reading secret mappings from', mappingFilePath)

  const json = await fs.readFile(mappingFilePath, 'utf-8')
  const secrets = JSON.parse(json)

  let output = ''

  for (const entry of secrets) {
    const key = entry.key
    const as = entry.as

    try {
      const result = await client.getSecret(key)
      output += `${as}=${result.value}\n`
      console.log(`✅ Loaded ${key} → ${as}`)
    } catch (err) {
      console.warn(`⚠️ Failed to load ${key}: ${err.message}`)
    }
  }

  await fs.writeFile(outputEnvPath, output, 'utf-8')
  console.log('📦 .env written to', outputEnvPath)
}

run().catch((err) => {
  console.error('💥 Failed to generate .env:', err)
  process.exit(1)
})(
  // --- Azure Front Door (Standard/Premium) cache purge -------------------------------------------
  // This runs independently after the env generation starts. It fetches the secret
  // 'FrontDoorEndpointResourceId' (expected to be a full resource ID like
  // /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Cdn/profiles/<profile>/afdendpoints/<endpoint>)
  // and issues a purge for all paths (/*) to invalidate cached assets across all mapped domains.
  // Failures are logged but do NOT fail the overall script.
  async () => {
    const secretName = 'FrontDoorEndpointResourceId'
    try {
      console.log('🚀 Attempting Front Door purge via secret', secretName)
      const fdSecret = await client.getSecret(secretName)
      const resourceId = fdSecret.value
      if (!resourceId) {
        console.warn('⚠️ Front Door secret value empty; skipping purge')
        return
      }

      const trimmed = resourceId.startsWith('/') ? resourceId : '/' + resourceId
      const apiVersion = '2024-02-01'
      const url = `https://management.azure.com${trimmed}/purge?api-version=${apiVersion}`

      const token = await credential.getToken('https://management.azure.com/.default')
      if (!token || !token.token) {
        console.warn('⚠️ Failed to acquire Azure AD token for management API; skipping purge')
        return
      }

      const body = { contentPaths: ['/*'] }
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.warn(`⚠️ Front Door purge request failed ${resp.status}: ${text}`)
        return
      }

      console.log('🧹 Front Door purge accepted (/*). Invalidation in progress.')
    } catch (e) {
      console.warn('⚠️ Front Door purge failed:', e.message || e)
    }
  }
)()
