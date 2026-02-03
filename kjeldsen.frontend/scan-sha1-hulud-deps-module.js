#!/usr/bin/env node
/**
 * Sha1-Hulud / npm worm guard (HASH-ONLY detection).
 *
 * Usage:
 *   node scan-sha1-hulud-deps.js [project-root]
 *
 *
 * Blocks ONLY if it finds a file whose SHA-256 matches
 * one of the known malicious bundled payload hashes.
 *
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { spawn } from 'child_process'
import os from 'os'

// ----- COLORS -----

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}[*]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[✓]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[!]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[!]${colors.reset} ${msg}`),
  scan: (msg) =>
    console.log(`${colors.gray}[*]${colors.reset} ${colors.gray}${msg}${colors.reset}`),
}

// ----- CONFIG -----

// Simple arg parsing
const args = process.argv.slice(2)
const skipInstall = args.includes('--skip-install')
const projectRootArg = args.find((a) => !a.startsWith('--'))

const projectRoot = path.resolve(projectRootArg || process.cwd())
const nodeModulesRoot = path.join(projectRoot, 'node_modules')

/**
 * Target filenames to check for malicious payloads.
 * Only these specific files will be hashed and compared.
 */
const TARGET_FILENAMES = new Set(['bundle.js', 'bun_environment.js', 'setup_bun.js'])

/**
 * Known malicious bundled JS payload hashes.
 */
const MALICIOUS_HASHES = new Set([
  // Old Sha1-Hulud "bundle.js" payloads
  'de0e25a3e6c1e1e5998b306b7141b3dc4c0088da9d7bb47c1c00c91e6e4f85d6',
  '81d2a004a1bca6ef87a1caf7d0e0b355ad1764238e40ff6d1b1cb77ad4f595c3',
  '83a650ce44b2a9854802a7fb4c202877815274c129af49e6c2d1d5d5d55c501e',
  '4b2399646573bb737c4969563303d8ee2e9ddbd1b271f1ca9e35ea78062538db',
  'dc67467a39b70d1cd4c1f7f7a459b35058163592f4a9e8fb4dffcbba98ef210c',
  '46faab8ab153fae6e80e7cca38eab363075bb524edd79e42269217a083628f09',
  'b74caeaa75e077c99f7d44f46daaf9796a3be43ecf24f2a1fd381844669da777',

  // New campaign: bun_environment.js
  '62ee164b9b306250c1172583f138c9614139264f889fa99614903c12755468d0',

  // New campaign: setup_bun.js
  'a3894003ad1d293ba96d77881ccd2071446dc3f65f434669b49b3da92421901a',
])

// ----- UTILS -----

async function walkDir(dir, cb) {
  let entries
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.bin') continue
      await walkDir(full, cb)
    } else if (entry.isFile()) {
      await cb(full)
    }
  }
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    stream.on('error', reject)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

function detectPackageManager() {
  // Check for lockfiles to determine preferred package manager
  const pnpmLock = fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))
  const npmLock = fs.existsSync(path.join(projectRoot, 'package-lock.json'))

  if (pnpmLock) return 'pnpm'
  if (npmLock) return 'npm'

  // Default to npm if no lockfiles found
  return 'npm'
}

async function runPackageInstall() {
  const packageManager = detectPackageManager()

  return new Promise((resolve, reject) => {
    const tempCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), `${packageManager}-ci-cache-`))

    log.info(`Running ${packageManager} ci with security flags...`)
    log.info(`Using temporary cache: ${tempCacheDir}`)

    const args =
      packageManager === 'pnpm'
        ? ['install', '--frozen-lockfile', '--ignore-scripts', '--cache-dir', tempCacheDir]
        : ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', tempCacheDir]

    // Use the correct executable on Windows where npm/pnpm are .cmd files.
    const pmExe =
      process.platform === 'win32'
        ? packageManager === 'pnpm'
          ? 'pnpm.cmd'
          : 'npm.cmd'
        : packageManager

    const childProc = spawn(pmExe, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    })

    childProc.on('error', (err) => {
      fs.rmSync(tempCacheDir, { recursive: true, force: true })
      reject(err)
    })

    childProc.on('close', (code) => {
      fs.rmSync(tempCacheDir, { recursive: true, force: true })

      if (code === 0) {
        log.success(`${packageManager} ci completed successfully`)
        resolve()
      } else {
        reject(new Error(`${packageManager} ci exited with code ${code}`))
      }
    })
  })
}

async function main() {
  log.info(`Project root: ${colors.cyan}${projectRoot}${colors.reset}`)

  if (skipInstall) {
    log.warn('Skipping package installation (--skip-install)')
  } else {
    // Run npm ci with security flags before scanning
    try {
      await runPackageInstall()
    } catch (err) {
      log.error(`Failed to run npm ci: ${err.message}`)
      if (err.message.includes('code 4294963248') || err.message.includes('EPERM')) {
        log.warn(
          'This error is often caused by file locking on Windows (e.g. VS Code, antivirus, or running servers).'
        )
        log.warn(
          'Try closing other processes or run with --skip-install if node_modules is already populated.'
        )
      }
      process.exit(1)
    }
  }

  if (!fs.existsSync(nodeModulesRoot)) {
    log.error(`node_modules not found at ${nodeModulesRoot}`)
    process.exit(1)
  }

  log.info(
    `Scanning for malicious files (${colors.yellow}${Array.from(TARGET_FILENAMES).join(', ')}${colors.reset}) under ${colors.cyan}${nodeModulesRoot}${colors.reset} ...`
  )

  const findings = []

  await walkDir(nodeModulesRoot, async (filePath) => {
    log.scan(`Scanning ${filePath}`)
    const filename = path.basename(filePath)

    // Only hash files with target filenames
    if (!TARGET_FILENAMES.has(filename)) {
      return
    }

    const hash = await sha256File(filePath)

    if (MALICIOUS_HASHES.has(hash)) {
      const stat = await fs.promises.stat(filePath)
      findings.push({
        filePath,
        sha256: hash,
        sizeBytes: stat.size,
      })
    }
  })

  if (findings.length === 0) {
    log.success('No malicious file hashes detected.')
    process.exit(0)
  }

  console.error(`\n${colors.red}${colors.bright}[!] MALICIOUS FILE HASH DETECTED${colors.reset}\n`)

  for (const f of findings) {
    console.error(
      `  ${colors.red}File:${colors.reset}    ${colors.cyan}${f.filePath}${colors.reset}`
    )
    console.error(
      `  ${colors.red}Size:${colors.reset}    ${colors.yellow}${f.sizeBytes}${colors.reset} bytes`
    )
    console.error(
      `  ${colors.red}SHA256:${colors.reset}  ${colors.bright}${f.sha256}${colors.reset}`
    )
    console.error('')
  }

  log.error('Aborting. Remove compromised packages and investigate before allowing scripts to run.')
  process.exit(1)
}

main().catch((err) => {
  log.error(`Error during scan: ${err}`)
  process.exit(1)
})
