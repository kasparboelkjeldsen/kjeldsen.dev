import { defineComponent, ref, mergeProps, useSSRContext } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrRenderSlot } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';

const _imports_0 = "" + __buildAssetsURL("bg.CRdmJdi9.jpg");

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "main",
  __ssrInlineRender: true,
  setup(__props) {
    const parallaxOffset = ref(0);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-screen bg-black text-white font-sans" }, _attrs))}><div class="fixed inset-0 z-0 overflow-hidden"><div class="will-change-transform" style="${ssrRenderStyle({ transform: `translateY(${parallaxOffset.value}px)` })}"><img${ssrRenderAttr("src", _imports_0)} alt="" class="w-full h-full object-cover fancy-background"></div><div class="absolute inset-0 custom-vignette-gradient"></div></div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});

const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/main.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=main.vue.mjs.map
