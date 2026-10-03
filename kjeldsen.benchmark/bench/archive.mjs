// npm run archive -- --name <sweep name> [--dry-run] [--force]
// Files a finished sweep away so the next night starts empty: results/ (runs, report, scoreboard, sweep logs),
// screenshots/ and results-extra/ (ungraded runs) move to archive/sweeps/<name>/, with a manifest of what ran.
// npm run score -- --all then scores every archived sweep together.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, RESULTS, parseArgs, writeJson } from "./lib/common.mjs";
import { runsIn, SWEEPS } from "./lib/score.mjs";
import { git, hasBaseline, changes } from "./lib/baseline.mjs";
import { findSiteProcesses } from "./lib/umbraco.mjs";

const args = parseArgs();
const name = typeof args.name === "string" ? args.name.replace(/[^a-z0-9._-]+/gi, "-") : null;
if (!name) { console.error("Usage: npm run archive -- --name <sweep name, e.g. 2026-10-02-night>  [--dry-run] [--force]"); process.exit(1); }
const dest = path.join(SWEEPS, name);
if (fs.existsSync(dest)) { console.error(`archive/sweeps/${name} already exists.`); process.exit(1); }

// a sweep still running would keep writing into results/
const busy = [];
if (findSiteProcesses().length) busy.push("Umbraco is running");
if (hasBaseline()) { const ch = changes(); const n = [...ch.added, ...ch.modified, ...ch.deleted].filter(f => f !== ".mcp.json").length; if (n) busy.push(`Umbraco.Bench has ${n} changed file(s) (a run in progress or ungraded)`); }
const runs = runsIn(RESULTS);
const ungraded = runs.filter(r => !r.grade);
if (ungraded.length) busy.push(`${ungraded.length} ungraded run(s): ${ungraded.map(r => r.id).join(", ")}`);
if (busy.length && !args.force) { console.error(`Not archiving: ${busy.join("; ")}. Finish or grade first, or pass --force.`); process.exit(1); }

const moves = [["results", "results"], ["screenshots", "screenshots"], ["results-extra", "extra"]]
  .map(([from, to]) => [path.join(ROOT, from), path.join(dest, to)])
  .filter(([from]) => fs.existsSync(from) && fs.readdirSync(from).length);
const manifest = {
  name, archivedAt: new Date().toISOString(),
  baselineCommit: hasBaseline() ? git(["rev-parse", "--short", "baseline"], { allowFail: true }) : null,
  runs: runs.map(r => ({
    id: r.id, provider: r.metrics.provider ?? "anthropic", model: r.metrics.model.id, effort: r.metrics.effort ?? null, variant: r.metrics.variant,
    grade: r.grade ? r.grade.total : null, honesty: r.honesty?.level ?? null, blogPromptMs: r.metrics.time.blogPromptMs,
    excluded: r.flags?.excludeFromScore ? r.flags.reason : null,
    cli: r.auto ? (r.auto.codexVersion ? `codex ${r.auto.codexVersion}` : `claude ${r.auto.claudeVersion}`) : r.metrics.claudeCodeVersion ? `claude ${r.metrics.claudeCodeVersion} (by hand)` : null,
    permissionMode: r.auto?.permissionMode ?? r.metrics.permissionMode ?? null,
  })),
};

console.log(`Archiving ${runs.length} run(s) to archive/sweeps/${name}/`);
for (const [from, to] of moves) console.log(`  ${path.relative(ROOT, from)}/ → ${path.relative(ROOT, to)}/`);
if (args["dry-run"]) { console.log("Dry run — nothing moved."); process.exit(0); }

// the scoreboard as it stood for this sweep goes along
spawnSync(process.execPath, [path.join(ROOT, "bench", "score.mjs")], { cwd: ROOT, stdio: "ignore" });
fs.mkdirSync(dest, { recursive: true });
for (const [from, to] of moves) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) fs.renameSync(path.join(from, f), path.join(to, f));
}
fs.copyFileSync(path.join(ROOT, "run-book.json"), path.join(dest, "run-book.json"));
writeJson(path.join(dest, "manifest.json"), manifest);
console.log(`Done. results/ and screenshots/ are empty for the next sweep; npm run score -- --all includes this one.`);
