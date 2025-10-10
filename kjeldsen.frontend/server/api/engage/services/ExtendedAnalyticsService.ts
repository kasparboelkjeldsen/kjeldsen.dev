// ExtendedAnalyticsService.ts
// Explicit wrapper around generated AnalyticsService adding support for arbitrary extra headers
// without modifying generated code (safe across regenerations).

import type { AnalyticsService } from './AnalyticsService'

export interface AnalyticsHeaderOptions {
  headers?: Record<string, string | undefined>
}

export class ExtendedAnalyticsService {
  constructor(private readonly inner: AnalyticsService) {}

  postPageEvent(
    args: Parameters<AnalyticsService['postAnalyticsPageeventTrackpageevent']>[0],
    opts?: AnalyticsHeaderOptions
  ) {
    const { pageviewId, apiKey, externalVisitorId, requestBody } = args as any
    return (this.inner as any).httpRequest.request({
      method: 'POST',
      url: '/umbraco/engage/api/v1/analytics/pageevent/trackpageevent',
      headers: {
        'Api-Key': apiKey,
        'External-Visitor-Id': externalVisitorId,
        'Pageview-Id': pageviewId,
        ...(opts?.headers || {}),
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: { 404: 'Not Found', 500: 'Internal Server Error' },
    })
  }

  postPageviewClient(
    args: Parameters<AnalyticsService['postAnalyticsPageviewTrackpageviewClient']>[0],
    opts?: AnalyticsHeaderOptions
  ) {
    const { apiKey, externalVisitorId, requestBody } = args as any
    return (this.inner as any).httpRequest.request({
      method: 'POST',
      url: '/umbraco/engage/api/v1/analytics/pageview/trackpageview/client',
      headers: {
        'Api-Key': apiKey,
        'External-Visitor-Id': externalVisitorId,
        ...(opts?.headers || {}),
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: { 402: 'Payment Required', 404: 'Not Found', 500: 'Internal Server Error' },
    })
  }

  postPageviewServer(
    args: Parameters<AnalyticsService['postAnalyticsPageviewTrackpageviewServer']>[0],
    opts?: AnalyticsHeaderOptions
  ) {
    const { apiKey, externalVisitorId, requestBody } = args as any
    return (this.inner as any).httpRequest.request({
      method: 'POST',
      url: '/umbraco/engage/api/v1/analytics/pageview/trackpageview/server',
      headers: {
        'Api-Key': apiKey,
        'External-Visitor-Id': externalVisitorId,
        ...(opts?.headers || {}),
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: { 402: 'Payment Required', 404: 'Not Found', 500: 'Internal Server Error' },
    })
  }
}

// Usage example:
// const extended = new ExtendedAnalyticsService(new AnalyticsService(client.request))
// extended.postPageviewServer({ apiKey: 'k', requestBody: {...} }, { headers: { 'X-Correlation-Id': 'abc' } })
