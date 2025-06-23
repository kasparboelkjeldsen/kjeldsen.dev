import { defineComponent, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import "./codeBlock.vue.mjs";
import "./funTimeWebMurderBlock.vue.mjs";
import BlocksFunTimeWebEkg from "./funTimeWebEkg.vue.mjs";
import "./rteBlock.vue.mjs";
import "./imageBlock.vue.mjs";
import "./testBlock.vue.mjs";
import _sfc_main$1 from "./rteBlock.vue2.mjs";
import _sfc_main$2 from "./funTimeWebMurderBlock.vue2.mjs";
import _sfc_main$3 from "./codeBlock.vue2.mjs";
import _sfc_main$4 from "./imageBlock.vue2.mjs";
import _sfc_main$5 from "./testBlock.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "resolverComponent",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (props.data.contentType === "funTimeWebEkg") {
        _push(ssrRenderComponent(unref(BlocksFunTimeWebEkg), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "rteBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$1), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "funTimeWebMurderBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$2), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "codeBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$3), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "imageBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$4), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "testBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$5), {
          data: props.data
        }, null, _parent));
      } else {
        _push(`<div><h1>${ssrInterpolate(props.data.contentType)}</h1><pre>${ssrInterpolate(props.data)}</pre></div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=resolverComponent.vue2.mjs.map
