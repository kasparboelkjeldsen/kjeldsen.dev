import { defineAsyncComponent } from "vue";
const layouts = {
  main: defineAsyncComponent(() => import("../layouts/main.vue.mjs").then((m) => m.default || m))
};
export {
  layouts as default
};
//# sourceMappingURL=virtual_nuxt_X__kasparboelkjeldsen_kjeldsen.dev_kjeldsen.frontend_.nuxt_layouts.mjs.map
