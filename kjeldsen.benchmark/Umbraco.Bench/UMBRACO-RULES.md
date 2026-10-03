# Umbraco Rules

Project conventions, enforced by code in `Umbraco.Bench.Umbraco` where possible. The short version of the ten UmbraCommandments.

1. **Never put content behind a composition.** Removing a composition permanently deletes its content on every document that used it — no recovery through revisions. Compositions are for meta, settings, CTAs. Litmus test: *if we remove this composition later, is what remains still viable content?*
2. **There are six kinds of document type — file each in its folder.** Page (renders), Block (renders; lives in block list/grid; never used as a composition), Composition (composed onto others; never rendered, never pickable), Data (element; never renders — settings, events, people), Repository (container node; never renders), Repository Item (the pickable records inside a Repository).
3. **Data types never sit at the root of the data type tree.** Built-ins under `/Umbraco/<editor>`, custom ones under `/Custom/<editor>`. `DataTypeSavedHandler` enforces this on every save.
4. **Register in an `IComposer`, not Program.cs.** If `IUmbracoBuilder` can do it, it belongs in `Composers/`. Non-Umbraco concerns (CORS, App Insights) go in `WebApplicationBuilder` extension methods.
5. **Production runs in production mode.** Umbraco Application Url set, `--configuration Release`, HTTPS only, no model generation, no template editing. `appsettings.json` ships configured this way — don't soften it; put dev conveniences in `appsettings.Development.json`.
6. **Aliases are English and camelCase.** No exceptions.
7. **Dictionary keys are PascalCase with dots** (`My.Dictionary.Item`), and a dictionary folder never has values of its own.
8. **Media always lives in a folder.**
9. **The content root only holds Repositories.** The site hangs under the WWW `siteRoot` node; going multi-site means adding another Page beneath it, not re-architecting. Because WWW never renders, the site Page needs a **domain** or nothing answers on `/` — assign `/` for a single site, a hostname each for several.
10. **uSync everything — commit `Umbraco.Bench.Umbraco/uSync/`.** Export is automatic; you should not need to trigger it. On Umbraco Cloud, use Umbraco Deploy instead.
