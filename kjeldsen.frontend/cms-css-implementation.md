# CMS CSS Generation for Umbraco (Next.js Implementation)

This document outlines how to replicate the `npm run build:cms-css` functionality from the Nuxt project in a Next.js project.

## The Goal

The objective is to generate a single `cms.css` file and copy relevant assets (fonts) to the Umbraco backend (`wwwroot`). This allows the Umbraco backoffice (e.g., Block Grid preview) to render content with the exact same styling as the frontend.

## Current Nuxt Implementation Analysis

The current Nuxt setup performs the following steps:

1.  **Build Tailwind Separately**: Runs `postcss` to generate a standalone `.tmp-tailwind.css` containing all Tailwind utility classes based on the content configuration.
2.  **Build Frontend**: Runs `nuxi build` (with `EXTRACT_CSS=true` implied or configured) to generate component-specific styles in `.output/public/_nuxt`.
3.  **Combine & Copy**: A script (`scripts/copy-css.js`) combines:
    - The standalone Tailwind CSS.
    - The Nuxt-generated component CSS.
    - Any static CSS from `public/css`.
    - It writes the result to `../kjeldsen.backend/wwwroot/css/cms.css`.
4.  **Copy Fonts**: Copies fonts from `.output/public/fonts` to `../kjeldsen.backend/wwwroot/fonts`.

## Next.js Implementation Guide

In Next.js, the build process (`next build`) compiles the application and outputs static assets to the `.next` directory. CSS files (global styles and CSS modules) are typically hashed and placed in `.next/static/css`.

### 1. Prerequisites

Ensure your Next.js project is set up with Tailwind CSS.

### 2. Create the Copy Script

Create a file named `scripts/copy-cms-css.js` in your Next.js project root. This script will locate the built CSS files and combine them.

**Note:** Next.js typically bundles Tailwind into the global CSS file found in `.next/static/css`. You likely do _not_ need a separate `postcss` build step unless you have a specific reason to separate it. The script below assumes `next build` generates everything needed.

```javascript
// scripts/copy-cms-css.js
const fs = require('fs')
const path = require('path')

// Configuration
// Adjust these paths based on your actual folder structure
const nextOutputDir = path.resolve('.next/static/css')
const publicDir = path.resolve('public')
// IMPORTANT: Adjust this relative path to point to your Umbraco backend's wwwroot
const targetCssFile = path.resolve('../kjeldsen.backend/wwwroot/css/cms.css')
const targetFontsDir = path.resolve('../kjeldsen.backend/wwwroot/fonts')

function findAllFiles(dir, filterFn = () => true) {
  if (!fs.existsSync(dir)) return []
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
  if (!fs.existsSync(srcDir)) {
    console.log(`📭 No fonts found in ${srcDir}, skipping.`)
    return
  }
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

console.log(`🚀 Building final cms.css for Umbraco...`)

let combinedCss = ''

// 1. Next.js Generated CSS (includes Tailwind if imported in global css)
// Next.js puts all CSS in .next/static/css
const nextCssFiles = findAllFiles(nextOutputDir, (name) => name.endsWith('.css'))
if (nextCssFiles.length > 0) {
  combinedCss += readCssFiles(nextCssFiles, 'Next.js Build CSS')
} else {
  console.warn('⚠️ No CSS files found in .next/static/css. Did you run "next build"?')
}

// 2. Public CSS (if any additional static css exists)
const publicCssDir = path.join(publicDir, 'css')
if (fs.existsSync(publicCssDir)) {
  const publicCssFiles = findAllFiles(publicCssDir, (name) => name.endsWith('.css'))
  combinedCss += readCssFiles(publicCssFiles, 'Public CSS')
}

// 3. Write final cms.css
// Ensure target directory exists
fs.mkdirSync(path.dirname(targetCssFile), { recursive: true })
fs.writeFileSync(targetCssFile, combinedCss)
console.log(`✅ Final CMS CSS written to ${targetCssFile}`)

// 4. Copy fonts
// Assuming fonts are in public/fonts
const publicFontsDir = path.join(publicDir, 'fonts')
copyFonts(publicFontsDir, targetFontsDir)
```

### 3. Update package.json

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "build:cms-css": "npm run build && node scripts/copy-cms-css.js"
  }
}
```

### 4. Execution

Run the command to generate the CMS CSS:

```bash
npm run build:cms-css
```

## Key Differences & Considerations

1.  **Tailwind Extraction**:
    - **Nuxt (Current)**: Explicitly builds Tailwind via `postcss` CLI _and_ includes Nuxt build CSS. This might be to ensure all classes are present or to handle specific Nuxt behavior.
    - **Next.js (Proposed)**: Relies on `next build` to generate the CSS. Next.js automatically bundles Tailwind (if imported in `globals.css` or similar) into the output CSS in `.next/static/css`. This is usually sufficient and cleaner.
    - _Fallback_: If you find classes missing, you can add the explicit `postcss` build step back (similar to the Nuxt setup) by installing `postcss-cli` and adding a `build:tailwind` script, then updating `copy-cms-css.js` to include that file.

2.  **Fonts**:
    - The script assumes fonts are in `public/fonts`. If you use `next/font` (Google Fonts or local), Next.js handles them differently (often inlining or hashing). If you need specific font files for Umbraco, keeping them in `public/fonts` and referencing them in your CSS is the easiest way to ensure they are copied correctly.

3.  **Paths**:
    - Double-check the `targetCssFile` and `targetFontsDir` paths in the script to ensure they point to the correct location of your Umbraco backend relative to the Next.js project.
