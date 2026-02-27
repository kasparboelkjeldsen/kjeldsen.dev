// scripts/create-deploy-package-json.js
import fs from 'fs'
import path from 'path'

const outputPackageJsonPath = path.resolve('.output/package.json')
const serverPackageJsonPath = path.resolve('.output/server/package.json')
const inputEnvPath = path.resolve('.env')
const outputEnvPath = path.resolve('.output/.env')

// Write custom package.json at .output/ root
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

// Replace the Nitro-generated server/package.json with a deps-free version.
// Azure Oryx detects package.json files and runs 'npm install' during its build
// phase. That reinstall recreates nested node_modules (e.g. hast-util-to-html/
// node_modules/property-information) which Node then fails to resolve. By
// removing the deps list we prevent Oryx from touching server/node_modules/;
// the pre-built modules deployed from .output/server/node_modules/ are used as-is.
if (fs.existsSync(serverPackageJsonPath)) {
  const minimalServerPackage = {
    name: 'nuxt-app-prod',
    version: '0.0.0',
    type: 'module',
    private: true,
  }
  fs.writeFileSync(serverPackageJsonPath, JSON.stringify(minimalServerPackage, null, 2))
  console.log(`✅ Replaced server/package.json with deps-free version to prevent Oryx reinstall`)
}

// Copy .env.production to .output/.env
if (fs.existsSync(inputEnvPath)) {
  const envContent = fs.readFileSync(inputEnvPath, 'utf-8')
  fs.writeFileSync(outputEnvPath, envContent)
  console.log(`✅ Copied .env.production to ${outputEnvPath}`)
} else {
  console.warn(`⚠️  .env.production not found at ${inputEnvPath}`)
}
