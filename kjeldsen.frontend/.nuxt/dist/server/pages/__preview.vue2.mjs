import "../components/pages/pageResolverComponent.vue.mjs";
import { defineComponent, toValue, withAsyncContext, watchEffect, unref } from "vue";
import { ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { useRoute } from "vue-router";
import { useFetch } from "../node_modules/nuxt/dist/app/composables/fetch.mjs";
import { useRouteCache } from "../node_modules/nuxt-multi-cache/dist/runtime/composables/useRouteCache.mjs";
import { useHead } from "../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import _sfc_main$1 from "../components/pages/pageResolverComponent.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "__preview",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const route = useRoute();
    const slug = toValue(route.params.slug || []);
    const apiPath = "/api/content//" + slug.join("/");
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(apiPath, {
      server: true,
      cache: "no-cache"
    }, "$nrss8iNE1W")), __temp = await __temp, __restore(), __temp);
    if ((_a = data.value) == null ? void 0 : _a.properties.cacheKeys) {
      const cacheKeys = data.value.properties.cacheKeys || [];
      const tags = ["reset", ...cacheKeys];
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`
🔥 [${timestamp}] Cache Miss! These keys were not found: 🔥
`);
      console.table(
        cacheKeys.map((key, index) => ({
          "#": index + 1,
          "Cache Key": key
        }))
      );
      useRouteCache((helper) => {
        helper.setMaxAge(3600 * 24).setCacheable().addTags(tags);
      });
    }
    const { data: navigation } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/content/navigation",
      { server: true, cache: "no-cache" },
      "$dpBCu5QOCT"
    )), __temp = await __temp, __restore(), __temp);
    watchEffect(() => {
      var _a2;
      if (data.value) {
        const seo = data.value;
        useHead({
          title: seo.properties.seoTitle ?? ((_a2 = data.value) == null ? void 0 : _a2.name)
        });
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      const _component_PagesPageResolverComponent = _sfc_main$1;
      _push(`<!--[-->`);
      if ((_a2 = unref(navigation)) == null ? void 0 : _a2.properties.links) {
        _push(`<header class="relative z-10 py-6"><nav><ul class="flex justify-center gap-8 text-lg font-mono"><!--[-->`);
        ssrRenderList(unref(navigation).properties.links, (link) => {
          var _a3;
          _push(`<li><a${ssrRenderAttr("href", ((_a3 = link.route) == null ? void 0 : _a3.path) ?? "/")} class="transition-colors duration-200 hover:text-gray-400">${ssrInterpolate(link.title)}</a></li>`);
        });
        _push(`<!--]--></ul></nav></header>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="relative z-10 px-4 pb-24 max-w-4xl mx-auto prose prose-invert">`);
      if (unref(data)) {
        _push(ssrRenderComponent(_component_PagesPageResolverComponent, {
          data: unref(data),
          class: "z-10 relative"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</main><!--]-->`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=__preview.vue2.mjs.map
