// npm run screenshot [-- --run <id>] [--post </url/>]
// Full-page screenshots of the front page and one blog post of the running site, with the installed Edge.
// Saved as screenshots/<model>-<date>-frontpage.png and -blogpost.png (date = the run's start, so runs don't collide).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, parseArgs, resolveRun, readJson } from "./lib/common.mjs";
import { BASE_URL, isUp } from "./lib/umbraco.mjs";

const args = parseArgs();
const run = resolveRun(args.run);
if (!(await isUp())) {
  console.error("Umbraco isn't running — npm run check (or npm run up) first.");
  process.exit(1);
}

// a blog post URL: --post, else the first post-like document in the check snapshot
let post = args.post;
if (!post) {
  const snap = readJson(path.join(run.dir, "snapshot.json"));
  const alias = id => snap?.docTypes.find(d => d.id === id)?.alias || "";
  post = snap?.documents.find(d => /post|article/i.test(alias(d.docTypeId)) && d.urls?.length)?.urls[0];
}

const m = run.metrics;
const model = `${m.model.name}${m.effort ? "-" + m.effort : ""}`.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
const date = run.id.slice(0, 15); // 2026-09-29_0830
const dir = path.join(ROOT, "screenshots");
fs.mkdirSync(dir, { recursive: true });

const shots = [["frontpage", "/"], ...(post ? [["blogpost", post]] : [])];
if (!post) console.warn("No blog post URL found (no snapshot.json or no post-like document) — pass --post </url/>.");
for (const [name, urlPath] of shots) {
  const file = path.join(dir, `${model}-${date}-${name}.png`);
  const url = new URL(urlPath, BASE_URL).href;
  // npx sits next to node; a process started outside a shell profile (fnm) may not have it on PATH
  const pathKey = Object.keys(process.env).find(k => k.toUpperCase() === "PATH") || "PATH";
  const env = { ...process.env, [pathKey]: `${path.dirname(process.execPath)}${path.delimiter}${process.env[pathKey] || ""}` };
  const r = spawnSync("npx", ["-y", "playwright@1.63.0", "screenshot", "--channel", "msedge", "--full-page", "--ignore-https-errors",
    "--viewport-size", "1440,900", "--wait-for-timeout", "1500", url, file], { encoding: "utf8", shell: true, env });
  if (r.status !== 0) { console.error(`Screenshot of ${url} failed:\n${r.stderr || r.stdout}`); process.exitCode = 1; continue; }
  console.log(`${url} → ${path.relative(ROOT, file)}`);
}
