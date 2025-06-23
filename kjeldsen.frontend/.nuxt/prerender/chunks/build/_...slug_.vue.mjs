import { defineComponent, toValue, withAsyncContext, watchEffect, unref, useSSRContext } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';
import { useRoute } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-router/dist/vue-router.node.mjs';
import { u as useFetch, a as useRouteCache, _ as _sfc_main$1 } from './useRouteCache.mjs';
import { u as useHead } from './v3.mjs';
import './resolverComponent.vue2.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-chartjs/dist/index.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/chart.js/dist/chart.js';
import './server.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/hookable/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unctx/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/radix3/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/defu/dist/defu.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ufo/dist/index.mjs';
import './_plugin-vue_export-helper.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/cookie-es/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/destr/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/utils/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/klona/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/scule/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/property-information/index.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/index.mjs';
import '../_/renderer.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/server.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/utils.mjs';
import '../_/nitro.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ofetch/dist/node.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/node-mock-http/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@tusbar/cache-control/dist/cache-control.modern.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/consola/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/pathe/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs.mjs';
import 'file:///X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/nuxt/dist/core/runtime/nitro/utils/cache-driver.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/devalue/index.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/plugins.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[...slug]",
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
    }, "$yCqnlWmzBQ")), __temp = await __temp, __restore(), __temp);
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
      "$IK-7g8r1rt"
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

const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_...slug_.vue.mjs.map
