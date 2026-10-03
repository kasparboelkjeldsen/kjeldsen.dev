// npm run collect [-- --session <id> | --transcript <file>] [--include-followups]
// Finds the newest benchmark session transcript, computes metrics and writes results/<runId>/metrics.json.
import fs from "node:fs";
import path from "node:path";
import { CLAUDE_PROJECTS, TRANSCRIPT_DIR_PATTERN, RESULTS, parseArgs, listRuns, writeJson, fmtDuration, fmtInt } from "./lib/common.mjs";
import { analyzeTranscript, findTranscripts, looksLikeBenchmark } from "./lib/transcript.mjs";
import { VARIANTS, readVariantState } from "./lib/variants.mjs";

const args = parseArgs();
let file = args.transcript;
if (!file) {
  const all = findTranscripts(CLAUDE_PROJECTS, TRANSCRIPT_DIR_PATTERN);
  const candidates = args.session ? all.filter(t => t.sessionId.startsWith(args.session)) : all.filter(t => looksLikeBenchmark(t.file));
  if (!candidates.length) {
    console.error(`No benchmark transcript found under ${CLAUDE_PROJECTS} (folders matching ${TRANSCRIPT_DIR_PATTERN}).\nWas the session started with Umbraco.Bench as its folder? Pass --transcript <file> to point at one directly.`);
    process.exit(1);
  }
  file = candidates[0].file;
}

const m = analyzeTranscript(file, { includeFollowups: !!args["include-followups"] });

const d = new Date(m.startedAt);
const p = n => String(n).padStart(2, "0");
const slug = `${m.model.name}${m.effort ? "-" + m.effort : ""}`.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
const existing = listRuns().find(r => r.metrics?.sessionId === m.sessionId);
const runId = existing?.id || `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}_${m.variant}_${slug}`;

// the project is set up per test (npm run setup) — flag a prompt/setup mismatch
// (a re-collect after reset keeps the setup recorded the first time)
m.setupVariant = existing?.metrics?.setupVariant ?? readVariantState().variant;
if (m.setupVariant !== m.variant) m.warnings.push(`The prompt is the ${VARIANTS[m.variant].name} test but Umbraco.Bench was set up for ${VARIANTS[m.setupVariant]?.name ?? m.setupVariant} (npm run setup).`);
const dir = path.join(RESULTS, runId);

fs.mkdirSync(dir, { recursive: true });
fs.copyFileSync(file, path.join(dir, "transcript.jsonl"));
const subDir = path.join(path.dirname(file), m.sessionId, "subagents");
if (fs.existsSync(subDir)) fs.cpSync(subDir, path.join(dir, "subagents"), { recursive: true });
writeJson(path.join(dir, "metrics.json"), { runId, collectedAt: new Date().toISOString(), ...m });

console.log(`${existing ? "Updated" : "Created"} run ${runId}
  test         ${VARIANTS[m.variant].name}
  model        ${m.model.marketingName || m.model.name}  id=${m.model.id}  effort=${m.effort ?? "?"}
  session      ${m.sessionId}
  total time   ${fmtDuration(m.time.totalMs)}   (blog prompt ${fmtDuration(m.time.blogPromptMs)})
  requests     ${m.tokens.requests}   tokens ${fmtInt(m.tokens.total)}   excl. cache reads ${fmtInt(m.tokens.totalExclCacheRead)}
  tool calls   ${m.tools.total}   failed ${m.tools.failed.length}
  folder       ${dir}`);
if (m.prompts.promptsAfterRunExcluded) console.log(`  note         ${m.prompts.promptsAfterRunExcluded} prompt(s) after the blog prompt's turn were excluded (use --include-followups to count them)`);
for (const w of m.warnings) console.log(`  warning      ${w}`);
