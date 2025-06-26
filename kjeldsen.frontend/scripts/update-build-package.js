// scripts/create-deploy-package-json.js
import fs from 'fs'
import path from 'path'

const outputPath = path.resolve('.output/package.json')

const deployPackage = {
  name: 'nuxt-app-ssr',
  private: true,
  type: 'module',
  scripts: {
    start: 'node server/index.mjs'
  }
}

fs.writeFileSync(outputPath, JSON.stringify(deployPackage, null, 2))
console.log(`✅ Wrote custom package.json to ${outputPath}`)
