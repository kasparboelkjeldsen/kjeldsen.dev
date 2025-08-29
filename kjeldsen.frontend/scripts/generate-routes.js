// scripts/generate-routes.mjs
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import 'dotenv/config'

const baseUrl = process.env.CMSHOST // or read from env
const outputPath = path.resolve('./.nuxt-prerender-routes.json')
console.log(`🔍 Fetching slugs from ${baseUrl}/api/slug`)
let routes = []

try {
  const res = await fetch(`${baseUrl}/api/slug`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const slugs = await res.json()
  routes = slugs.map((slug) => `${slug}`)
} catch (err) {
  console.warn(`⚠️ Could not fetch slugs from ${baseUrl}: ${err.message}`)
  routes = []
}

fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2))
console.log(`✅ Wrote ${routes.length} prerender routes to ${outputPath}`)
