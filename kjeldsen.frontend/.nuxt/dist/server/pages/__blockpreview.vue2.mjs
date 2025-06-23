import { defineComponent, mergeProps, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { useRequestEvent } from "../node_modules/nuxt/dist/app/composables/ssr.mjs";
import "../components/blocks/resolverComponent.vue.mjs";
import _sfc_main$1 from "../components/blocks/resolverComponent.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "__blockpreview",
  __ssrInlineRender: true,
  setup(__props) {
    console.log("BlockPreview");
    const event = useRequestEvent();
    const data = event == null ? void 0 : event.context.body.content;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ id: "__preview" }, _attrs))}>`);
      _push(ssrRenderComponent(unref(_sfc_main$1), { data: unref(data) }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=__blockpreview.vue2.mjs.map
