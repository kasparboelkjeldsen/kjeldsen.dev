import { defineConfig } from '@hey-api/openapi-ts'

// Umbraco Engage's headless API, generated the same way as the delivery client and for the same
// reasons (see openapi-ts.config.ts). Engage publishes it at /umbraco/openapi/engage-api.json, and
// the document also carries this site's own engageextensions endpoints, so one client covers both.
//
// The CMS has to be running, so this is a deliberate `npm run gen:engage`, never a build step.
export default defineConfig({
  input: 'https://localhost:44375/umbraco/openapi/engage-api.json',
  output: {
    path: 'server/engage-api',
    postProcess: [],
  },
  plugins: ['@hey-api/client-fetch'],
})
