// npm run status — where am I in the sweep, and what's next?
import { ROOT, GIT_DIR, listRuns, fmtDuration } from "./lib/common.mjs";
import { hasBaseline, changes } from "./lib/baseline.mjs";
import { findSiteProcesses, isUp, BASE_URL } from "./lib/umbraco.mjs";
import { VARIANTS, readVariantState } from "./lib/variants.mjs";

const baseline = hasBaseline();
const ch = baseline ? changes() : null;
const nChanged = ch ? [...ch.added, ...ch.modified, ...ch.deleted].filter(f => f !== ".mcp.json").length : 0;
const setup = readVariantState().variant;
const running = findSiteProcesses().length > 0 && await isUp();
const runs = listRuns();

console.log(`Baseline   ${baseline ? `yes (${GIT_DIR})` : "MISSING — run npm run baseline on a pristine scaffold"}`);
console.log(`Project    ${!baseline ? "?" : nChanged ? `${nChanged} file(s) changed vs baseline (a run is in progress or ungraded)` : "pristine"}`);
console.log(`Test       ${VARIANTS[setup].name} (${VARIANTS[setup].promptFile}) — change with npm run setup -- <${Object.keys(VARIANTS).join("|")}>`);
console.log(`Umbraco    ${running ? `running on ${BASE_URL}` : "stopped"}`);
console.log(`\nRuns (${runs.length}):`);
for (const r of runs) {
  const m = r.metrics;
  const state = r.grade ? `graded ${r.grade.total}/${r.grade.max}` : r.check ? "checked, not graded" : "collected, not graded";
  console.log(`  ${r.id.padEnd(46)} ${(VARIANTS[m.variant]?.name ?? "MCP").padEnd(11)} ${m.model.name.padEnd(12)} ${fmtDuration(m.time.totalMs).padStart(6)}  ${String(m.tokens.requests).padStart(4)} req  ${state}`);
}

const ungraded = runs.filter(r => !r.grade).at(-1);
let next;
if (!baseline) next = "npm run baseline";
else if (ungraded && nChanged) next = `grade ${ungraded.id}: npm run auto -- --grade-only, or a high-effort Opus/Fable session in ${ROOT} told to follow exam-prompt.md`;
else if (nChanged) next = "a run is in progress — when it finishes: npm run collect, then grade with exam-prompt.md (or npm run auto -- --grade-only)";
else if (!running) next = `npm run auto -- --model <model>[:effort] for a hands-off run, or npm run up and follow ${VARIANTS[setup].promptFile}`;
else next = `new Claude Code session in Umbraco.Bench (pick the model with /model), then follow ${VARIANTS[setup].promptFile}`;
console.log(`\nNext: ${next}`);
