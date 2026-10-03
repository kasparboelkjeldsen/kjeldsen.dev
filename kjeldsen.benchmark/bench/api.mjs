// npm run api -- <path> [--method POST --body '{"json":true}']
// Calls the Umbraco Management API (/umbraco/management/api/v1/<path>) as the MCP API user. For graders.
// Write the path without a leading slash (document/<id>) — Git Bash rewrites "/document/..." into a Windows path.
import { parseArgs } from "./lib/common.mjs";
import { api } from "./lib/umbraco.mjs";

const args = parseArgs();
if (!args._[0]) {
  console.error("Usage: npm run api -- document/<id>   (path is relative to /umbraco/management/api/v1)");
  process.exitCode = 1;
} else {
  try {
    const res = await api(args._[0].replace(/^.*?\/Git\//i, ""), { method: args.method || "GET", body: args.body ? JSON.parse(args.body) : undefined });
    console.log(typeof res === "string" ? res : JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
