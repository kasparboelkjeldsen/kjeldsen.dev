// npm run setup -- <mcp|migrations|playwright> [--force]
// Prepares the pristine Umbraco.Bench for a test: swaps .mcp.json for the test's MCP servers.
import fs from "node:fs";
import path from "node:path";
import { PROJECT, parseArgs, writeJson } from "./lib/common.mjs";
import { VARIANTS, writeVariantState } from "./lib/variants.mjs";
import { hasBaseline, changes, git } from "./lib/baseline.mjs";

const args = parseArgs();
const key = args._[0];
const v = VARIANTS[key];
if (!v) {
  console.error(`Usage: npm run setup -- <${Object.keys(VARIANTS).join("|")}>`);
  process.exit(1);
}
if (!hasBaseline()) { console.error("No baseline — run npm run baseline first."); process.exit(1); }

const ch = changes();
const other = [...ch.added, ...ch.modified, ...ch.deleted].filter(f => f !== ".mcp.json");
if (other.length && !args.force) {
  console.error(`Umbraco.Bench isn't pristine (${other.length} changed file(s)). Grade and reset the previous run first, or pass --force.`);
  process.exit(1);
}

const mcpFile = path.join(PROJECT, ".mcp.json");
if (v.mcpJson === "baseline") git(["checkout", "baseline", "--", ".mcp.json"]);
else if (v.mcpJson === null) fs.rmSync(mcpFile, { force: true });
else writeJson(mcpFile, v.mcpJson);
writeVariantState(key);

console.log(`Umbraco.Bench is set up for the ${v.name} test (${v.mcpJson === null ? "no MCP servers" : v.mcpJson === "baseline" ? "Umbraco MCP server" : "Playwright MCP server"}).
Prompts: ${v.promptFile}
Next: npm run up${v.hasPrompt1 ? ", new session in Umbraco.Bench, paste prompt 1, npm run down, paste prompt 2" : ", npm run down, then a new session in Umbraco.Bench and paste prompt 2"}.`);
