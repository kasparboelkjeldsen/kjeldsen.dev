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

// Remove any nested node_modules directories inside externalized packages.
// Nitro's dependency tracer can create partial nested node_modules structures
// (e.g. hast-util-to-html/node_modules/property-information/) where the
// directory exists but files like index.js are missing. Removing the nested dir
// lets Node.js fall back to the correct top-level package.
const serverNodeModules = path.resolve('.output/server/node_modules')
console.log(`🔍 Checking for nested node_modules in: ${serverNodeModules}`)
console.log(`   exists: ${fs.existsSync(serverNodeModules)}`)

function removeNestedNodeModules(dir, depth = 0) {
  if (!fs.existsSync(dir)) return
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (e) {
    console.warn(`⚠️  Could not read ${dir}: ${e.message}`)
    return
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    // Handle scoped packages (@scope/pkg)
    if (entry.name.startsWith('@') && depth === 0) {
      removeNestedNodeModules(path.join(dir, entry.name), 1)
      continue
    }
    const nested = path.join(dir, entry.name, 'node_modules')
    if (fs.existsSync(nested)) {
      console.log(`🗑️  Removing nested node_modules: ${nested}`)
      fs.rmSync(nested, { recursive: true, force: true })
      console.log(`✅ Removed nested node_modules from ${entry.name}/`)
    }
  }
}

removeNestedNodeModules(serverNodeModules)

// Also remove server/package-lock.json if present — Oryx/Kudu may use it to
// reinstall packages, recreating broken nested node_modules directories.
const serverPkgLock = path.resolve('.output/server/package-lock.json')
if (fs.existsSync(serverPkgLock)) {
  fs.rmSync(serverPkgLock)
  console.log('✅ Removed server/package-lock.json to prevent Oryx reinstall')
} else {
  console.log('ℹ️  No server/package-lock.json found (ok)')
}

// Copy .env.production to .output/.env
if (fs.existsSync(inputEnvPath)) {
  const envContent = fs.readFileSync(inputEnvPath, 'utf-8')
  fs.writeFileSync(outputEnvPath, envContent)
  console.log(`✅ Copied .env.production to ${outputEnvPath}`)
} else {
  console.warn(`⚠️  .env.production not found at ${inputEnvPath}`)
}
