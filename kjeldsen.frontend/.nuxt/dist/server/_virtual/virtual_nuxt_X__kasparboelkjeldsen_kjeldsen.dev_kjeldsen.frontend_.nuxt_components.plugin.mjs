import { defineNuxtPlugin } from "../node_modules/nuxt/dist/app/nuxt.mjs";
import LazyProseA from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseA.vue.mjs";
import LazyProseBlockquote from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseBlockquote.vue.mjs";
import LazyProseCode from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseCode.vue.mjs";
import LazyProseEm from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseEm.vue.mjs";
import LazyProseH1 from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseH1.vue.mjs";
import LazyProseH2 from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseH2.vue.mjs";
import LazyProseH3 from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseH3.vue.mjs";
import LazyProseH4 from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseH4.vue.mjs";
import LazyProseH5 from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseH5.vue.mjs";
import LazyProseH6 from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseH6.vue.mjs";
import LazyProseHr from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseHr.vue.mjs";
import LazyProseImg from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseImg.vue.mjs";
import LazyProseLi from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseLi.vue.mjs";
import LazyProseOl from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseOl.vue.mjs";
import LazyProseP from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseP.vue.mjs";
import LazyProsePre from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProsePre.vue.mjs";
import LazyProseScript from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseScript.vue.mjs";
import LazyProseStrong from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseStrong.vue.mjs";
import LazyProseTable from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseTable.vue.mjs";
import LazyProseTbody from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseTbody.vue.mjs";
import LazyProseTd from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseTd.vue.mjs";
import LazyProseTh from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseTh.vue.mjs";
import LazyProseThead from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseThead.vue.mjs";
import LazyProseTr from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseTr.vue.mjs";
import LazyProseUl from "../node_modules/_nuxtjs/mdc/dist/runtime/components/prose/ProseUl.vue.mjs";
const lazyGlobalComponents = [
  ["ProseA", LazyProseA],
  ["ProseBlockquote", LazyProseBlockquote],
  ["ProseCode", LazyProseCode],
  ["ProseEm", LazyProseEm],
  ["ProseH1", LazyProseH1],
  ["ProseH2", LazyProseH2],
  ["ProseH3", LazyProseH3],
  ["ProseH4", LazyProseH4],
  ["ProseH5", LazyProseH5],
  ["ProseH6", LazyProseH6],
  ["ProseHr", LazyProseHr],
  ["ProseImg", LazyProseImg],
  ["ProseLi", LazyProseLi],
  ["ProseOl", LazyProseOl],
  ["ProseP", LazyProseP],
  ["ProsePre", LazyProsePre],
  ["ProseScript", LazyProseScript],
  ["ProseStrong", LazyProseStrong],
  ["ProseTable", LazyProseTable],
  ["ProseTbody", LazyProseTbody],
  ["ProseTd", LazyProseTd],
  ["ProseTh", LazyProseTh],
  ["ProseThead", LazyProseThead],
  ["ProseTr", LazyProseTr],
  ["ProseUl", LazyProseUl]
];
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = defineNuxtPlugin({
  name: "nuxt:global-components",
  setup(nuxtApp) {
    for (const [name, component] of lazyGlobalComponents) {
      nuxtApp.vueApp.component(name, component);
      nuxtApp.vueApp.component("Lazy" + name, component);
    }
  }
});
export {
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 as default
};
//# sourceMappingURL=virtual_nuxt_X__kasparboelkjeldsen_kjeldsen.dev_kjeldsen.frontend_.nuxt_components.plugin.mjs.map
