// The pristine Umbraco.Bench scaffold is kept in a git repo *outside* the project folder
// (bench/.baseline-git, work tree = Umbraco.Bench), so the model under test never sees a .git
// but we can diff exactly what it changed and archive each run's solution as refs/runs/<runId>.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { GIT_DIR, PROJECT } from "./common.mjs";

export function git(args, { allowFail = false } = {}) {
  const r = spawnSync("git", [`--git-dir=${GIT_DIR}`, `--work-tree=${PROJECT}`,
    "-c", "core.autocrlf=false", "-c", "core.longpaths=true", "-c", "user.name=bench", "-c", "user.email=bench@localhost",
    "-c", "commit.gpgsign=false", ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) throw new Error(`git ${args.join(" ")} failed:\n${r.stderr || r.stdout}`);
  return (r.stdout || "").trimEnd();
}

export const hasBaseline = () => fs.existsSync(GIT_DIR) && git(["rev-parse", "--verify", "-q", "refs/tags/baseline"], { allowFail: true }) !== "";

// .playwright-mcp/ (browser snapshots) is noise in diffs; reset still removes it.
// .claude/ in the project holds Claude Code's local settings (e.g. the .mcp.json approval) — never part of a run
const KEEP = ".claude";
function ensureExcludes() {
  fs.mkdirSync(path.join(GIT_DIR, "info"), { recursive: true });
  fs.writeFileSync(path.join(GIT_DIR, "info", "exclude"), `/${KEEP}/\n`);
}

export function createBaseline() {
  spawnSync("git", ["init", "-q", "--bare", GIT_DIR], { encoding: "utf8" });
  git(["config", "core.bare", "false"]);
  ensureExcludes();
  git(["add", "-A"]);
  git(["commit", "-q", "-m", "baseline: pristine Umbraco.Bench scaffold"]);
  git(["tag", "-f", "baseline"]);
  return git(["rev-parse", "--short", "HEAD"]);
}

// Tracked changes vs baseline (respects the project's .gitignore: no bin/obj/db/media)
export function changes() {
  ensureExcludes();
  git(["add", "-A", "--intent-to-add"], { allowFail: true });
  const lines = git(["status", "--porcelain", "-uall"]).split("\n").filter(Boolean);
  const out = { added: [], modified: [], deleted: [] };
  for (const l of lines) {
    const code = l.slice(0, 2), file = l.slice(3).replace(/^"|"$/g, "");
    if (code.includes("D")) out.deleted.push(file);
    else if (code.includes("A") || code === "??") out.added.push(file);
    else out.modified.push(file);
  }
  git(["reset", "-q"], { allowFail: true });
  return out;
}

export function diffPatch() {
  git(["add", "-A", "--intent-to-add"], { allowFail: true });
  const patch = git(["diff", "baseline", "--", ".", ":(exclude)**/Models/ModelsBuilder/**", ":(exclude)**/uSync/**", ":(exclude)**/*-schema*.json"], { allowFail: true });
  git(["reset", "-q"], { allowFail: true });
  return patch;
}

// Commits the current solution (minus ignored files) and pins it at refs/runs/<ref>
export function archiveAs(ref) {
  git(["add", "-A"]);
  const dirty = spawnSync("git", [`--git-dir=${GIT_DIR}`, `--work-tree=${PROJECT}`, "diff", "--cached", "--quiet"]).status === 1;
  if (!dirty) { git(["reset", "-q"]); return null; }
  git(["commit", "-q", "-m", `run ${ref}`]);
  git(["update-ref", `refs/runs/${ref}`, "HEAD"]);
  return git(["rev-parse", "--short", "HEAD"]);
}

export function restoreBaseline() {
  ensureExcludes();
  git(["checkout", "-q", "-f", "-B", "main", "baseline"]);
  git(["clean", "-q", "-fdx", "-e", KEEP]);
}
