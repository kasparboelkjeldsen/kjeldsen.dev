// scripts/create-deploy-package-json.js
import fs from 'fs'
import path from 'path'

const outputPackageJsonPath = path.resolve('.output/package.json')
const inputEnvPath = path.resolve('.env')
const outputEnvPath = path.resolve('.output/.env')

// Write custom package.json
const deployPackage = {
  name: 'nuxt-app-ssr',
  private: true,
  type: 'module',
  scripts: {
    start: 'node server/index.mjs',
  },
}

fs.writeFileSync(outputPackageJsonPath, JSON.stringify(deployPackage, null, 2))
console.log(`✅ Wrote custom package.json to ${outputPackageJsonPath}`)

// Copy .env.production to .output/.env
if (fs.existsSync(inputEnvPath)) {
  const envContent = fs.readFileSync(inputEnvPath, 'utf-8')
  fs.writeFileSync(outputEnvPath, envContent)
  console.log(`✅ Copied .env.production to ${outputEnvPath}`)
} else {
  console.warn(`⚠️  .env.production not found at ${inputEnvPath}`)
}
