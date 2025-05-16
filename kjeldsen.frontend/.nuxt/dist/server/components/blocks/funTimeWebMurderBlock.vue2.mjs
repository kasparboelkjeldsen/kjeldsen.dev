import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, mergeProps, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { useRuntimeConfig } from "../../node_modules/nuxt/dist/app/nuxt.mjs";
import { useCookie } from "../../node_modules/nuxt/dist/app/composables/cookie.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "funTimeWebMurderBlock",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    config.public.murderClient;
    const usernameCookie = useCookie("pushed-by");
    const username = usernameCookie.value;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "prose prose-invert max-w-none" }, _attrs))}><p class="mb-4 text-gray-300"> To &quot;pull the plug,&quot; You will have to log in with GitHub. <br>I&#39;ll <strong>only retrieve your public GitHub username</strong> — nothing else. Your username will be recorded in the database along with the time you pressed the button. This action will be visible to other users in the activity log. </p>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`<button class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded mt-4">${ssrInterpolate(unref(username) ? "Really? Again?" : "Pull the plug for 30 sec")}</button></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=funTimeWebMurderBlock.vue2.mjs.map
