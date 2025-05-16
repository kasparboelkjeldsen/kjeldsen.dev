import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "rteBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-white prose" }, _attrs))}>${((_b = (_a = _ctx.data.properties) == null ? void 0 : _a.richText) == null ? void 0 : _b.markup) ?? ""}</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=rteBlock.vue2.mjs.map
