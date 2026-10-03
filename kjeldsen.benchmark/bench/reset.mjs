// npm run reset [-- --run <id>] [--force]
// Stops Umbraco, archives the current solution as refs/runs/<runId> in the baseline repo,
// and restores Umbraco.Bench to the pristine scaffold (no database, no build output, no models).
import fs from "node:fs";
import path from "node:path";
import { parseArgs, listRuns, resolveRun, writeJson, GIT_DIR, CLAUDE_PROJECTS, TRANSCRIPT_DIR_PATTERN } from "./lib/common.mjs";
import { findTranscripts } from "./lib/transcript.mjs";
import { hasBaseline, archiveAs, restoreBaseline } from "./lib/baseline.mjs";
import { stopSite } from "./lib/umbraco.mjs";
import { clearVariantState } from "./lib/variants.mjs";

const args = parseArgs();
if (!hasBaseline()) {
  console.error(`No baseline in ${GIT_DIR}. Run "npm run baseline" on a pristine Umbraco.Bench first.`);
  process.exit(1);
}
const run = listRuns().length ? resolveRun(args.run) : null;
if (run && !run.grade && !args.force) {
  console.error(`Run ${run.id} has no grade.json yet. Grade it first (exam-prompt.md), or pass --force to reset anyway.`);
  process.exit(1);
}

const pids = stopSite();
if (pids.length) console.log(`Stopped Umbraco (pids ${pids.join(", ")})`);
// Give Windows a moment to release file handles on the SQLite db and bin/
await new Promise(r => setTimeout(r, 1500));

// --as <ref> names the archive outright (the autonomous runner uses it for aborted attempts). A run that was already
// archived keeps its ref: the project then holds something else, which gets its own unassigned-… ref.
const stampRef = `unassigned-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const alreadyArchived = run && fs.existsSync(path.join(run.dir, "archive.json"));
const ref = typeof args.as === "string" ? args.as : run && !alreadyArchived ? run.id : stampRef;
const commit = archiveAs(ref);
if (commit) {
  console.log(`Archived the solution as refs/runs/${ref} (${commit}). Inspect with:\n  git --git-dir=bench/.baseline-git show --stat refs/runs/${ref}`);
  if (run && ref === run.id) writeJson(path.join(run.dir, "archive.json"), { ref: `refs/runs/${ref}`, commit, archivedAt: new Date().toISOString() });
} else console.log("Nothing changed since the baseline — nothing to archive.");

// Auto memory is off for Umbraco.Bench (.claude/settings.json), but if a memory folder appears anyway,
// keep it with the run and remove it so the next model starts clean
for (const t of new Set(findTranscripts(CLAUDE_PROJECTS, TRANSCRIPT_DIR_PATTERN).map(t => path.dirname(t.file)))) {
  const mem = path.join(t, "memory");
  if (!fs.existsSync(mem) || !fs.readdirSync(mem).length) continue;
  if (run) fs.cpSync(mem, path.join(run.dir, "memory"), { recursive: true });
  fs.rmSync(mem, { recursive: true, force: true });
  console.log(`Cleared Claude memory in ${mem}${run ? " (copy kept in the run folder)" : ""}`);
}

let lastErr;
for (let i = 0; i < 5; i++) {
  try { restoreBaseline(); lastErr = null; break; } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 2000)); }
}
if (lastErr) { console.error(lastErr.message); process.exit(1); }
clearVariantState();
console.log("Umbraco.Bench is back to the pristine scaffold (set up for the MCP test). For another test: npm run setup -- <mcp|migrations|playwright>. Then npm run up.");
