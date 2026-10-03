// npm run up — start the benchmark Umbraco site in the background and wait until the MCP user can log in.
import { BASE_URL, findSiteProcesses, isUp, startSite, waitForReady } from "./lib/umbraco.mjs";

if (findSiteProcesses().length && await isUp()) {
  console.log(`Umbraco is already running on ${BASE_URL}`);
  process.exit(0);
}
const { pid, logFile } = startSite();
console.log(`Starting Umbraco (pid ${pid}), log: ${logFile}`);
const t0 = Date.now();
await waitForReady({ onTick: () => process.stdout.write(".") });
console.log(`\nReady on ${BASE_URL} after ${Math.round((Date.now() - t0) / 1000)}s — the MCP server can connect now.`);
