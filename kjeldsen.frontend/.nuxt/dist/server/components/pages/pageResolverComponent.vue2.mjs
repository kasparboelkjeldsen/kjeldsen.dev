import "./homePage.vue.mjs";
import "./blogPostContainerPage.vue.mjs";
import __nuxt_component_2 from "./blogPostPage.vue.mjs";
import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import _sfc_main$1 from "./homePage.vue2.mjs";
import _sfc_main$2 from "./blogPostContainerPage.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pageResolverComponent",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PagesHomePage = _sfc_main$1;
      const _component_PagesBlogPostContainerPage = _sfc_main$2;
      const _component_PagesBlogPostPage = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "prose" }, _attrs))}>`);
      if (props.data.contentType === "homePage") {
        _push(ssrRenderComponent(_component_PagesHomePage, { data: _ctx.data }, null, _parent));
      } else if (props.data.contentType === "blogPostContainerPage") {
        _push(ssrRenderComponent(_component_PagesBlogPostContainerPage, { data: _ctx.data }, null, _parent));
      } else if (props.data.contentType === "blogPostPage") {
        _push(ssrRenderComponent(_component_PagesBlogPostPage, { data: _ctx.data }, null, _parent));
      } else {
        _push(`<div><pre>${ssrInterpolate(_ctx.data)}</pre></div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=pageResolverComponent.vue2.mjs.map
