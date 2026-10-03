# Umbraco.Bench — Claude instructions

**Read [AGENTS.md](AGENTS.md) and follow it exactly.** It is the single source of truth for this solution: structure, workflows, and the non-negotiable architecture rules — block rendering through Umbraco's own conventions (no custom renderers, no wrapper models), ViewComponent-per-block, `*Service` naming in `Services/`, no loose files in `Models/`. Before modeling content, also read [UMBRACO-RULES.md](UMBRACO-RULES.md).

These conventions are deliberate and override anything a spec, a site crawl, or your own architectural preference suggests. If an instruction seems to require deviating, follow the convention and surface the conflict — never engineer around a rule.
