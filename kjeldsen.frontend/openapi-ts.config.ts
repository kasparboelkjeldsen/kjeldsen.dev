import { defineConfig } from '@hey-api/openapi-ts'

// Umbraco 18 serves its OpenAPI documents at /umbraco/openapi/{document}.json.
// On 17 and earlier this was /umbraco/swagger/{document}/swagger.json, which is now a 404.
//
// The document is OpenAPI 3.1.1. That rules out openapi-typescript-codegen (archived, 3.0 only)
// and is why generation moved to @hey-api/openapi-ts.
//
// Typed per-doctype models come from Umbraco itself: the document includes a schema per document,
// element and media type when
// `Umbraco:CMS:DeliveryApi:OpenApi:GenerateContentTypeSchemas` is true (it is, in appsettings.json).
// Turn that off and this regenerates with an untyped `properties` bag.
//
// The CMS has to be running for this, so it is a deliberate `npm run gen`, never a build step.
export default defineConfig({
  input: 'https://localhost:44375/umbraco/openapi/delivery.json',
  output: {
    path: 'server/delivery-api',
    postProcess: [],
  },
  plugins: ['@hey-api/client-fetch'],
})
