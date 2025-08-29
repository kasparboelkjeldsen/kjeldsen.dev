// scripts/concat-css.js
import fs from 'fs'
import path from 'path'

const nuxtOutputDir = path.resolve('.output/public/_nuxt')
const publicDir = path.resolve('.output/public')
const targetCssFile = path.resolve('./../kjeldsen.backend/wwwroot/css/cms.css')
const targetFontsDir = path.resolve('./../kjeldsen.backend/wwwroot/fonts')
const tailwindCssPath = path.resolve('.tmp-tailwind.css')

function findAllFiles(dir, filterFn = () => true) {
  let results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(findAllFiles(fullPath, filterFn))
    } else if (filterFn(entry.name)) {
      results.push(fullPath)
    }
  }

  return results
}

function copyFonts(srcDir, destDir) {
  const fontFiles = findAllFiles(srcDir, (name) => /\.(woff2?|ttf|otf|eot)$/i.test(name))

  for (const file of fontFiles) {
    const relativePath = path.relative(srcDir, file)
    const destPath = path.join(destDir, relativePath)
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.copyFileSync(file, destPath)
    console.log(`🔤 Copied font: ${relativePath}`)
  }
}

function readCssFiles(files, label) {
  let output = ''
  for (const file of files) {
    console.log(`📦 Including ${label}: ${path.basename(file)}`)
    output += fs.readFileSync(file, 'utf8') + '\n'
  }
  return output
}

console.log(`🚀 Building final cms.css`)

let combinedCss = ''

// 1. Tailwind
if (fs.existsSync(tailwindCssPath)) {
  console.log(`🌪️  Adding Tailwind CSS from ${tailwindCssPath}`)
  combinedCss += fs.readFileSync(tailwindCssPath, 'utf8') + '\n'
}

// 2. Component styles
const nuxtCssFiles = findAllFiles(nuxtOutputDir, (name) => name.endsWith('.css'))
combinedCss += readCssFiles(nuxtCssFiles, 'Nuxt CSS')

// 3. public/css/**/*.css
const publicCssDir = path.join(publicDir, 'css')
if (fs.existsSync(publicCssDir)) {
  const publicCssFiles = findAllFiles(publicCssDir, (name) => name.endsWith('.css'))
  combinedCss += readCssFiles(publicCssFiles, 'Public CSS')
}

// 4. Write final cms.css
fs.writeFileSync(targetCssFile, combinedCss)
console.log(`✅ Final CMS CSS written to ${targetCssFile}`)

// 5. Copy fonts
const publicFontsDir = path.join(publicDir, 'fonts')
if (fs.existsSync(publicFontsDir)) {
  copyFonts(publicFontsDir, targetFontsDir)
} else {
  console.log('📭 No fonts found in /public/fonts, skipping font copy.')
}
