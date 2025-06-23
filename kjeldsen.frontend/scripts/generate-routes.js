// scripts/generate-routes.mjs
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const baseUrl = 'https://localhost:44375' // or read from env

const res = await fetch(`${baseUrl}/api/slug`)
const slugs = await res.json()

// e.g., ["about", "contact"] → ["/about", "/contact"]
const routes = slugs.map(slug => `/${slug}`)

const outputPath = path.resolve('./.nuxt-prerender-routes.json')
fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2))

console.log(`✅ Wrote ${routes.length} prerender routes to ${outputPath}`)
