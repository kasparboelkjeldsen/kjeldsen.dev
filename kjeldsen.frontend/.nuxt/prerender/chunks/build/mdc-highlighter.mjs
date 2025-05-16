import { createOnigurumaEngine } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/engine-oniguruma.mjs';
import { createJavaScriptRegexEngine } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/engine-javascript.mjs';

let configs;
function getMdcConfigs () {
if (!configs) {
  configs = Promise.all([
  ]);
}
return configs
}

function createShikiHighlighter({
  langs = [],
  themes = [],
  bundledLangs = {},
  bundledThemes = {},
  getMdcConfigs,
  options: shikiOptions,
  engine
} = {}) {
  let shiki;
  let configs;
  async function _getShiki() {
    const { createHighlighterCore, addClassToHast, isSpecialLang, isSpecialTheme } = await import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/core.mjs');
    const { transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight } = await import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/transformers/dist/index.mjs');
    const shiki2 = await createHighlighterCore({
      langs,
      themes,
      engine: engine || createJavaScriptRegexEngine()
    });
    for await (const config of await getConfigs()) {
      await config.shiki?.setup?.(shiki2);
    }
    return {
      shiki: shiki2,
      addClassToHast,
      isSpecialLang,
      isSpecialTheme,
      transformers: [
        transformerNotationDiff(),
        transformerNotationErrorLevel(),
        transformerNotationFocus(),
        transformerNotationHighlight()
      ]
    };
  }
  async function getShiki() {
    if (!shiki) {
      shiki = _getShiki();
    }
    return shiki;
  }
  async function getConfigs() {
    if (!configs) {
      configs = Promise.resolve(getMdcConfigs?.() || []);
    }
    return configs;
  }
  const highlighter = async (code, lang, theme, options = {}) => {
    const {
      shiki: shiki2,
      addClassToHast,
      isSpecialLang,
      isSpecialTheme,
      transformers: baseTransformers
    } = await getShiki();
    const codeToHastOptions = {
      defaultColor: false,
      meta: {
        __raw: options.meta
      }
    };
    if (lang === "ts-type" || lang === "typescript-type") {
      lang = "typescript";
      codeToHastOptions.grammarContextCode = "let a:";
    } else if (lang === "vue-html" || lang === "vue-template") {
      lang = "vue";
      codeToHastOptions.grammarContextCode = "<template>";
    }
    const themesObject = { ...typeof theme === "string" ? { default: theme } : theme || {} };
    const loadedThemes = shiki2.getLoadedThemes();
    const loadedLanguages = shiki2.getLoadedLanguages();
    if (typeof lang === "string" && !loadedLanguages.includes(lang) && !isSpecialLang(lang)) {
      if (bundledLangs[lang]) {
        await shiki2.loadLanguage(bundledLangs[lang]);
      } else {
        lang = "text";
      }
    }
    for (const [color, theme2] of Object.entries(themesObject)) {
      if (typeof theme2 === "string" && !loadedThemes.includes(theme2) && !isSpecialTheme(theme2)) {
        if (bundledThemes[theme2]) {
          await shiki2.loadTheme(bundledThemes[theme2]);
        } else {
          themesObject[color] = "none";
        }
      }
    }
    const transformersMap = /* @__PURE__ */ new Map();
    for (const transformer of baseTransformers) {
      transformersMap.set(transformer.name || `transformer:${Math.random()}-${transformer.constructor.name}`, transformer);
    }
    for (const config of await getConfigs()) {
      const newTransformers = typeof config.shiki?.transformers === "function" ? await config.shiki?.transformers(code, lang, theme, options) : config.shiki?.transformers || [];
      for (const transformer of newTransformers) {
        transformersMap.set(transformer.name || `transformer:${Math.random()}-${transformer.constructor.name}`, transformer);
      }
    }
    const root = shiki2.codeToHast(code.trimEnd(), {
      lang,
      ...codeToHastOptions,
      themes: themesObject,
      transformers: [
        ...transformersMap.values(),
        {
          name: "mdc:highlight",
          line(node, line) {
            if (options.highlights?.includes(line))
              addClassToHast(node, "highlight");
            node.properties.line = line;
          }
        },
        {
          name: "mdc:newline",
          line(node) {
            if (code?.includes("\n")) {
              if (node.children.length === 0 || node.children.length === 1 && node.children[0].type === "element" && node.children[0].children.length === 1 && node.children[0].children[0].type === "text" && node.children[0].children[0].value === "") {
                node.children = [{
                  type: "element",
                  tagName: "span",
                  properties: {
                    emptyLinePlaceholder: true
                  },
                  children: [{ type: "text", value: "\n" }]
                }];
                return;
              }
              const last = node.children.at(-1);
              if (last?.type === "element" && last.tagName === "span") {
                const text = last.children.at(-1);
                if (text?.type === "text")
                  text.value += "\n";
              }
            }
          }
        }
      ]
    });
    const preEl = root.children[0];
    const codeEl = preEl.children[0];
    const wrapperStyle = shikiOptions?.wrapperStyle;
    preEl.properties.style = wrapperStyle ? typeof wrapperStyle === "string" ? wrapperStyle : preEl.properties.style : "";
    const styles = [];
    Object.keys(themesObject).forEach((color) => {
      const colorScheme = color !== "default" ? `.${color}` : "";
      styles.push(
        wrapperStyle ? `${colorScheme} .shiki,` : "",
        `html .${color} .shiki span {`,
        `color: var(--shiki-${color});`,
        `background: var(--shiki-${color}-bg);`,
        `font-style: var(--shiki-${color}-font-style);`,
        `font-weight: var(--shiki-${color}-font-weight);`,
        `text-decoration: var(--shiki-${color}-text-decoration);`,
        "}"
      );
      styles.push(
        `html${colorScheme} .shiki span {`,
        `color: var(--shiki-${color});`,
        `background: var(--shiki-${color}-bg);`,
        `font-style: var(--shiki-${color}-font-style);`,
        `font-weight: var(--shiki-${color}-font-weight);`,
        `text-decoration: var(--shiki-${color}-text-decoration);`,
        "}"
      );
    });
    return {
      tree: codeEl.children,
      className: Array.isArray(preEl.properties.class) ? preEl.properties.class.join(" ") : preEl.properties.class,
      inlineStyle: preEl.properties.style,
      style: styles.join("")
    };
  };
  return highlighter;
}

const bundledLangs = {
"typescript": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/typescript.mjs').then(r => r.default || r),
"ts": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/typescript.mjs').then(r => r.default || r),
"javascript": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/javascript.mjs').then(r => r.default || r),
"js": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/javascript.mjs').then(r => r.default || r),
"csharp": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/csharp.mjs').then(r => r.default || r),
"c#": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/csharp.mjs').then(r => r.default || r),
"cs": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/csharp.mjs').then(r => r.default || r),
"vue-html": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/vue-html.mjs').then(r => r.default || r),
"vue": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/vue.mjs').then(r => r.default || r),
"json": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/langs/dist/json.mjs').then(r => r.default || r),
};
const bundledThemes = {
"github-dark": () => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@shikijs/themes/dist/github-dark.mjs').then(r => r.default || r),
};
const options = {"wrapperStyle":true};
const engine = createOnigurumaEngine(() => import('file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/shiki/dist/wasm.mjs'));
const highlighter = createShikiHighlighter({ bundledLangs, bundledThemes, options, getMdcConfigs, engine });

export { createShikiHighlighter, highlighter as default };
//# sourceMappingURL=mdc-highlighter.mjs.map
