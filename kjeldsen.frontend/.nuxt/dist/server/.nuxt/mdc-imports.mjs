import _RemarkEmoji from "remark-emoji";
import rehypeHighlight from "../node_modules/_nuxtjs/mdc/dist/runtime/highlighter/rehype-nuxt.mjs";
const remarkPlugins = {
  "remark-emoji": { instance: _RemarkEmoji }
};
const rehypePlugins = {
  "highlight": { instance: rehypeHighlight, options: {} }
};
const highlight = { "theme": "github-dark", "wrapperStyle": true };
export {
  highlight,
  rehypePlugins,
  remarkPlugins
};
//# sourceMappingURL=mdc-imports.mjs.map
