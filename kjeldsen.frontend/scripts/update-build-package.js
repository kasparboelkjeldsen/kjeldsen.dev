// scripts/update-build-package.js
import fs from 'fs'
import path from 'path'

const serverPkgPath = path.resolve('.output/server/package.json')

try {
  const raw = fs.readFileSync(serverPkgPath, 'utf-8')
  const pkg = JSON.parse(raw)

  pkg.scripts = {
    ...(pkg.scripts || {}),
    start: 'node index.mjs'
  }

  fs.writeFileSync(serverPkgPath, JSON.stringify(pkg, null, 2))
  console.log(`✅ Added 'start' script to ${serverPkgPath}`)
} catch (err) {
  console.error(`❌ Failed to update package.json: ${err.message}`)
  process.exit(1)
}
