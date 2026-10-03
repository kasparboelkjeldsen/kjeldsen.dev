// Shared paths, arg parsing, run-folder helpers and formatting for the bench scripts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
// Overridable so the tooling can be pointed at another BellaBoot scaffold
export const PROJECT = process.env.BENCH_PROJECT ? path.resolve(process.env.BENCH_PROJECT) : path.join(ROOT, "Umbraco.Bench");
export const SITE = process.env.BENCH_SITE ? path.resolve(process.env.BENCH_SITE) : path.join(PROJECT, "Umbraco.Bench.Umbraco");
export const SITE_NAME = path.basename(SITE);
export const GIT_DIR = process.env.BENCH_GIT_DIR ? path.resolve(process.env.BENCH_GIT_DIR) : path.join(ROOT, "bench", ".baseline-git");
export const RESULTS = process.env.BENCH_RESULTS ? path.resolve(process.env.BENCH_RESULTS) : path.join(ROOT, "results");
export const LOGS = path.join(ROOT, "bench", "logs");

// Claude Code stores transcripts under ~/.claude/projects/<cwd with every non-alphanumeric character replaced by "-">
export const CLAUDE_PROJECTS = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude"), "projects");
export const projectDirName = dir => path.resolve(dir).replace(/[^a-zA-Z0-9]/g, "-");
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// this checkout's Umbraco.Bench, plus the original x:\benchmarking location so older transcripts still resolve
export const TRANSCRIPT_DIR_PATTERN = new RegExp(`^(${escapeRe(projectDirName(PROJECT))}|.*benchmarking-Umbraco-Bench)$`, "i");
// shell commands that reach into the bench's own folders (results, prompts, scripts) from the project under test
export const BENCH_FOLDER_REF = new RegExp(`(${escapeRe(path.basename(ROOT))}|benchmarking)[\\\\/](results|bench|tests)\\b|baseline-git|exam-prompt`, "i");

export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) args[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) args[k] = argv[++i];
      else args[k] = true;
    } else args._.push(a);
  }
  return args;
}

export function readJson(file, fallback = undefined) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function listRuns() {
  if (!fs.existsSync(RESULTS)) return [];
  return fs.readdirSync(RESULTS, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(RESULTS, d.name, "metrics.json")))
    .map(d => {
      const dir = path.join(RESULTS, d.name);
      return {
        id: d.name,
        dir,
        metrics: readJson(path.join(dir, "metrics.json")),
        grade: readJson(path.join(dir, "grade.json")),
        check: readJson(path.join(dir, "check.json")),
        auto: readJson(path.join(dir, "auto.json")),
      };
    })
    .sort((a, b) => (a.metrics?.startedAt || "").localeCompare(b.metrics?.startedAt || ""));
}

// --run <id|substring>, otherwise the newest run
export function resolveRun(sel) {
  const runs = listRuns();
  if (!runs.length) throw new Error(`No runs in ${RESULTS}. Run "npm run collect" first.`);
  if (!sel || sel === true) return runs[runs.length - 1];
  const hit = runs.filter(r => r.id === sel || r.id.includes(sel));
  if (!hit.length) throw new Error(`No run matches "${sel}". Runs: ${runs.map(r => r.id).join(", ")}`);
  return hit[hit.length - 1];
}

export function fmtDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const neg = ms < 0;
  let s = Math.round(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const body = h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
  return (neg ? "−" : "") + body;
}

export function fmtInt(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

export function signed(str, isNeg, isZero) {
  if (isZero) return "0";
  return isNeg ? str.replace(/^−?/, "−") : "+" + str;
}

export function pct(a, b) {
  if (!a) return "—";
  const p = ((b - a) / a) * 100;
  return (p < 0 ? "−" : "+") + Math.abs(p).toFixed(1) + "%";
}

export function log(...a) { console.log(...a); }
