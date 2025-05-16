import { computed, createVNode, resolveDynamicComponent, unref, mergeProps, useSSRContext } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { ssrRenderVNode } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';
import { withLeadingSlash, withTrailingSlash, joinURL } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ufo/dist/index.mjs';
import { e as useRuntimeConfig } from './server.mjs';
import { _ as _sfc_main$1 } from './NuxtImg.vue2.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/hookable/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unctx/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-router/dist/vue-router.node.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/radix3/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/defu/dist/defu.mjs';
import './v3.mjs';
import '../_/renderer.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/destr/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/server.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unhead/dist/utils.mjs';
import '../_/nitro.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ofetch/dist/node.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/node-mock-http/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/unstorage/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/@tusbar/cache-control/dist/cache-control.modern.js';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/consola/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/klona/dist/index.mjs';
import 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/scule/dist/index.mjs';
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

const _sfc_main = {
  __name: "ProseImg",
  __ssrInlineRender: true,
  props: {
    src: {
      type: String,
      default: ""
    },
    alt: {
      type: String,
      default: ""
    },
    width: {
      type: [String, Number],
      default: void 0
    },
    height: {
      type: [String, Number],
      default: void 0
    }
  },
  setup(__props) {
    const props = __props;
    const refinedSrc = computed(() => {
      var _a;
      if (((_a = props.src) == null ? void 0 : _a.startsWith("/")) && !props.src.startsWith("//")) {
        const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL));
        if (_base !== "/" && !props.src.startsWith(_base)) {
          return joinURL(_base, props.src);
        }
      }
      return props.src;
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(_sfc_main$1)), mergeProps({
        src: unref(refinedSrc),
        alt: props.alt,
        width: props.width,
        height: props.height
      }, _attrs), null), _parent);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseImg.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ProseImg.vue2.mjs.map
