import { EngageClient } from '~~/server/api/engage/EngageClient'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const deliveryKey: string | undefined = config.deliveryKey
  let baseUrl = (config.public.cmsHost || '').replace(/\/$/, '')
  if (baseUrl && !/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`
  const url = baseUrl + '/umbraco/engage/api/v1/analytics/pageview/trackpageview/server'
  const engageClient = new EngageClient({ BASE: baseUrl })

  // Minimal synthetic request body
  const reqBody = {
    url: (config.public.siteUrl || 'https://www.kjeldsen.dev') + '/',
    referrerUrl: '',
    headers: 'X-Diag=1',
    browserUserAgent: 'diag-client',
    remoteClientAddress: '127.0.0.1',
    userIdentifier: '',
  }

  try {
    const t0 = Date.now()
    const res = await engageClient.analytics.postAnalyticsPageviewTrackpageviewServer({
      apiKey: deliveryKey,
      externalVisitorId: undefined,
      requestBody: reqBody,
    })
    return {
      ok: true,
      durationMs: Date.now() - t0,
      responseKeys: Object.keys(res || {}),
      pageviewId: res?.pageviewId,
      externalVisitorId: res?.externalVisitorId,
    }
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message,
      status: e?.status,
      statusText: e?.statusText,
      body: e?.body && typeof e.body === 'object' ? Object.keys(e.body).slice(0, 8) : typeof e.body,
      hasApiKey: !!deliveryKey,
      apiKeyLength: deliveryKey?.length,
      baseUrl,
      url,
    }
  }
})
