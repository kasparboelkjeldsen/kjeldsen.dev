// npm run baseline [-- --force] — record the current Umbraco.Bench folder as the pristine "blank state".
// Only needed once (or when you deliberately change the scaffold, e.g. edit AGENTS.md).
import { GIT_DIR } from "./lib/common.mjs";
import { parseArgs } from "./lib/common.mjs";
import { hasBaseline, createBaseline, git } from "./lib/baseline.mjs";
import { findSiteProcesses } from "./lib/umbraco.mjs";

const args = parseArgs();
if (findSiteProcesses().length) {
  console.error("Umbraco is running — stop it first (npm run down) so the baseline has no build output or database.");
  process.exit(1);
}
if (hasBaseline() && !args.force) {
  console.log(`Baseline already exists in ${GIT_DIR}. Use --force to re-record it from the current folder.`);
  process.exit(0);
}
if (hasBaseline()) {
  // Re-record: keep run archives, move the baseline tag to a fresh commit of the current folder
  git(["add", "-A"]);
  git(["commit", "-q", "--allow-empty", "-m", "baseline: re-recorded"]);
  git(["tag", "-f", "baseline"]);
  console.log(`Baseline re-recorded at ${git(["rev-parse", "--short", "HEAD"])}`);
} else {
  console.log(`Baseline recorded at ${createBaseline()} in ${GIT_DIR}`);
}
