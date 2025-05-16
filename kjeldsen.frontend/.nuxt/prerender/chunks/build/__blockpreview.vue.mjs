import { defineComponent, mergeProps, unref, useSSRContext } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';
import { u as useRequestEvent } from './server.mjs';
import { _ as _sfc_main$1 } from './resolverComponent.vue2.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/hookable/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unctx/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-router/dist/vue-router.node.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/radix3/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/defu/dist/defu.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ufo/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-chartjs/dist/index.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/chart.js/dist/chart.js';
import './_plugin-vue_export-helper.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/cookie-es/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/destr/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/utils/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/klona/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/scule/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/property-information/index.js';
import './NuxtImg.vue2.mjs';
import './v3.mjs';
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
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ipx/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs.mjs';
import 'file:///X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/nuxt/dist/core/runtime/nitro/utils/cache-driver.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/devalue/index.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/plugins.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "__blockpreview",
  __ssrInlineRender: true,
  setup(__props) {
    const event = useRequestEvent();
    const data = event == null ? void 0 : event.context.body.content;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ id: "__preview" }, _attrs))}>`);
      _push(ssrRenderComponent(unref(_sfc_main$1), { data: unref(data) }, null, _parent));
      _push(`</div>`);
    };
  }
});

const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/__blockpreview.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__blockpreview.vue.mjs.map
