import { defineComponent, mergeProps, computed, toValue, reactive, withAsyncContext, unref, useSSRContext, getCurrentInstance } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderAttr } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';
import { _ as _sfc_main$6, a as useAsyncData, b as useRequestFetch } from './resolverComponent.vue2.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper.mjs';
import { hash } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/index.mjs';
import { f as fetchDefaults } from './server.mjs';

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "gridItem",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BlocksResolverComponent = _sfc_main$6;
      const _component_GridItem = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "pt-4 pb-4",
        style: {
          gridColumn: _ctx.item.columnSpan ? `span ${_ctx.item.columnSpan} / span ${_ctx.item.columnSpan}` : void 0,
          gridRow: _ctx.item.rowSpan ? `span ${_ctx.item.rowSpan} / span ${_ctx.item.rowSpan}` : void 0
        }
      }, _attrs))}><div class="mb-2">`);
      if (_ctx.item.content) {
        _push(ssrRenderComponent(_component_BlocksResolverComponent, {
          data: _ctx.item.content
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (_ctx.item.areas && _ctx.item.areas.length) {
        _push(`<div><!--[-->`);
        ssrRenderList(_ctx.item.areas, (area, areaIndex) => {
          _push(`<div class="mt-4 border-t pt-4"><div class="font-bold mb-2">Area: ${ssrInterpolate(area.alias)}</div><div class="grid gap-2" style="${ssrRenderStyle(`grid-template-columns: repeat(${area.columnSpan}, minmax(0, 1fr));`)}"><!--[-->`);
          ssrRenderList(area.items, (areaItem, areaItemIndex) => {
            _push(ssrRenderComponent(_component_GridItem, {
              key: areaItemIndex,
              item: areaItem
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "gridModule",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GridItem = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "grid gap-4",
        style: `grid-template-columns: repeat(${_ctx.data.gridColumns}, minmax(0, 1fr));`
      }, _attrs))}><!--[-->`);
      ssrRenderList(_ctx.data.items, (item, index) => {
        _push(ssrRenderComponent(_component_GridItem, {
          key: index,
          item
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "homePage",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GridModule = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (_ctx.data.properties.grid) {
        _push(ssrRenderComponent(_component_GridModule, {
          data: _ctx.data.properties.grid
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});

function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _request = computed(() => toValue(request));
  const _key = opts.key || hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]);
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = _key === autoKey ? "$f" + _key : _key;
  if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch,
    immediate,
    getCachedData,
    deep,
    dedupe,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchDefaults,
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    immediate,
    getCachedData,
    deep,
    dedupe,
    watch: watch === false ? [] : [_fetchOptions, _request, ...watch || []]
  };
  let controller;
  const asyncData = useAsyncData(key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller, new DOMException("Request aborted as another request to the same endpoint was initiated.", "AbortError"));
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const timeoutLength = toValue(opts.timeout);
    let timeoutId;
    if (timeoutLength) {
      timeoutId = setTimeout(() => controller.abort(new DOMException("Request aborted due to timeout.", "AbortError")), timeoutLength);
      controller.signal.onabort = () => clearTimeout(timeoutId);
    }
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch) {
      const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(opts.baseURL) || toValue(opts.baseURL)[0] === "/");
      if (isLocalFetch) {
        _$fetch = useRequestFetch();
      }
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions }).finally(() => {
      clearTimeout(timeoutId);
    });
  }, _asyncDataOptions);
  return asyncData;
}
function generateOptionSegments(opts) {
  var _a;
  const segments = [
    ((_a = toValue(opts.method)) == null ? void 0 : _a.toUpperCase()) || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.params || opts.query]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  return segments;
}

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "blogPostContainerPage",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const props = __props;
    function GetWriter(model) {
      return model.map((item) => {
        var _a2;
        return (_a2 = item.properties) == null ? void 0 : _a2.writerName;
      }).filter((name) => !!name).join(", ");
    }
    const { data: children } = ([__temp, __restore] = withAsyncContext(() => useFetch(`/api/content/children/${props.data.id}`, { server: true }, "$sFdoVrx6oy")), __temp = await __temp, __restore(), __temp);
    const blogPosts = (_a = children.value) == null ? void 0 : _a.items;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "px-4 pb-24 max-w-6xl mx-auto" }, _attrs))}><h1 class="text-4xl font-bold leading-tight tracking-tight mb-10">Blog</h1><ul class="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2"><!--[-->`);
      ssrRenderList(unref(blogPosts), (child) => {
        var _a2, _b, _c;
        _push(`<li class="bg-zinc-900 rounded-xl overflow-hidden shadow hover:shadow-xl transition-shadow"><a${ssrRenderAttr("href", ((_a2 = child.route) == null ? void 0 : _a2.path) ?? "#")} class="block group h-full">`);
        if ((_c = (_b = child.properties.seoListImage) == null ? void 0 : _b[0]) == null ? void 0 : _c.url) {
          _push(`<div><img${ssrRenderAttr("src", child.properties.seoListImage[0].url)} alt="" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="p-6">`);
        if (child.properties.writer) {
          _push(`<p class="text-white">${ssrInterpolate(GetWriter(child.properties.writer))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h2 class="text-xl font-semibold mb-2 text-white">${ssrInterpolate(child.properties.seoTitle)}</h2><p class="text-gray-400 text-sm">${ssrInterpolate(child.properties.seoDescription)}</p></div></a></li>`);
      });
      _push(`<!--]--></ul></section>`);
    };
  }
});

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "blogPostPage",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_GridModule = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-a1c62d90><h1 data-v-a1c62d90>${ssrInterpolate(_ctx.data.properties.seoTitle ?? _ctx.data.name)}</h1><h3 data-v-a1c62d90>${ssrInterpolate((_b = (_a = _ctx.data.properties.writer) == null ? void 0 : _a.at(0)) == null ? void 0 : _b.name)}</h3>`);
      if (_ctx.data.properties.grid) {
        _push(ssrRenderComponent(_component_GridModule, {
          data: _ctx.data.properties.grid
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});

const _sfc_setup = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/pages/blogPostPage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a1c62d90"]]);

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pageResolverComponent",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PagesHomePage = _sfc_main$3;
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

const MULTI_CACHE_ROUTE_CONTEXT_KEY = "__MULTI_CACHE_ROUTE";
function getMultiCacheRouteHelper(event) {
  return event == null ? void 0 : event[MULTI_CACHE_ROUTE_CONTEXT_KEY];
}

function useRouteCache(cb, providedEvent) {
  const event = (() => {
    if (!getCurrentInstance()) {
      return;
    }
    const ssrContext = useSSRContext();
    if (ssrContext) {
      return ssrContext.event;
    }
  })();
  if (!event) {
    return;
  }
  const helper = getMultiCacheRouteHelper(event);
  if (!helper) {
    return;
  }
  cb(helper);
}

export { _sfc_main as _, useRouteCache as a, useFetch as u };
//# sourceMappingURL=useRouteCache.mjs.map
