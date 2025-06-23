import _sfc_main$1 from "../../node_modules/_nuxtjs/mdc/dist/runtime/components/MDC.vue.mjs";
import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "codeBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_MDC = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "font-mono" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_MDC, {
        value: (_a = props.data.properties) == null ? void 0 : _a.code
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=codeBlock.vue2.mjs.map
