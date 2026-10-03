// Repeated images: the same picture shown more than once on one page (e.g. a post's header photo again as an inline
// image). Different crops of one photo count as the same image: Umbraco keeps the file name in every crop URL
// (/media/<id>/cubes.jpg?width=…), and the provided photos have unique names, so the file name is the identity.
// A post's own image on its card in a listing is fine: that is a different page.
import fs from "node:fs";
import path from "node:path";

const fileOf = src => {
  try { return path.posix.basename(new URL(src.replace(/&amp;/g, "&"), "https://x").pathname).toLowerCase(); } catch { return null; }
};

// <img src> and inline background-image urls, the images a visitor sees (not <source>/srcset alternates or og:image)
export function imagesOn(html) {
  const body = html.replace(/<head[\s\S]*?<\/head>/i, "").replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  const out = [];
  for (const m of body.matchAll(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi)) out.push(m[1]);
  for (const m of body.matchAll(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) out.push(m[1]);
  return out.map(fileOf).filter(f => f && /\.(jpe?g|png|webp|gif|avif)$/.test(f));
}

// → [{ page, repeated: [{ file, times }] }] for every crawled page that shows an image more than once
export function repeatedImages(pagesDir) {
  if (!fs.existsSync(pagesDir)) return [];
  const out = [];
  for (const f of fs.readdirSync(pagesDir).filter(f => f.endsWith(".html"))) {
    const counts = new Map();
    for (const img of imagesOn(fs.readFileSync(path.join(pagesDir, f), "utf8"))) counts.set(img, (counts.get(img) || 0) + 1);
    const repeated = [...counts].filter(([, n]) => n > 1).map(([file, times]) => ({ file, times }));
    if (repeated.length) out.push({ page: f, repeated });
  }
  return out;
}
