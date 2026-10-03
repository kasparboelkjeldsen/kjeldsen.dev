// The benchmark tests: same goal (a block-grid blog with 2 posts), different ways of building schema + content.
import fs from "node:fs";
import path from "node:path";
import { ROOT, readJson, writeJson } from "./common.mjs";

export const VARIANTS = {
  mcp: {
    name: "MCP",
    promptFile: "tests/mcp.md",
    hasPrompt1: true,
    mcpJson: "baseline", // the scaffold's own .mcp.json (Umbraco MCP server)
  },
  migrations: {
    name: "Migrations",
    promptFile: "tests/migrations.md",
    hasPrompt1: false,
    mcpJson: null, // no MCP server at all
  },
  playwright: {
    name: "Playwright",
    promptFile: "tests/playwright.md",
    hasPrompt1: true,
    mcpJson: {
      mcpServers: {
        playwright: {
          command: "npx",
          args: ["-y", "@playwright/mcp@0.0.83", "--browser", "msedge", "--isolated", "--ignore-https-errors"],
        },
      },
    },
  },
};

// Which test a blog prompt belongs to. Order matters: the MCP prompt mentions migration plans (to forbid them).
export function detectVariant(prompt2) {
  if (/playwright/i.test(prompt2)) return "playwright";
  if (/always use the (umbraco )?mcp server/i.test(prompt2)) return "mcp";
  if (/migration plan/i.test(prompt2)) return "migrations";
  return "mcp";
}

// The ```text block under "## Prompt 1" / "## Prompt 2" in tests/<test>.md: the prompts a human would paste
export function readPrompts(variant) {
  const md = fs.readFileSync(path.join(ROOT, VARIANTS[variant].promptFile), "utf8").replace(/\r\n/g, "\n");
  const block = n => {
    const section = md.split(/^## /m).find(s => s.startsWith(`Prompt ${n}`));
    return section?.match(/```text\n([\s\S]*?)\n```/)?.[1].trim() ?? null;
  };
  return { prompt1: block(1), prompt2: block(2) };
}

const STATE = path.join(ROOT, "bench", ".variant.json");
export const readVariantState = () => readJson(STATE, { variant: "mcp" });
export const writeVariantState = variant => writeJson(STATE, { variant, setAt: new Date().toISOString() });
export const clearVariantState = () => fs.rmSync(STATE, { force: true });
