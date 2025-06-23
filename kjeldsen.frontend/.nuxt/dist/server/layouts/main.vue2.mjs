import { defineComponent, ref, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrRenderSlot } from "vue/server-renderer";
import _imports_0 from "../assets/img/bg.jpg.mjs";
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
export {
  _sfc_main as default
};
//# sourceMappingURL=main.vue2.mjs.map
