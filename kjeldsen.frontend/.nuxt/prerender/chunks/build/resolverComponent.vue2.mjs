import { defineComponent, h, getCurrentInstance, computed, toRaw, reactive, watch, resolveComponent, defineAsyncComponent, Text, Comment, useSSRContext, ref, shallowRef, toRef, onServerPrefetch, unref, withAsyncContext, mergeProps, provide, createElementBlock } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/index.mjs';
import { ssrRenderSlot, ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue/server-renderer/index.mjs';
import { Line } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/vue-chartjs/dist/index.js';
import { Chart, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/chart.js/dist/chart.js';
import { u as useNuxtApp, a as asyncDataDefaults, c as createError, b as useRuntimeConfig } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper.mjs';
import { parse } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/cookie-es/dist/index.mjs';
import { getRequestHeader, setCookie, getCookie, deleteCookie } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/h3/dist/index.mjs';
import destr from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/destr/dist/index.mjs';
import { isEqual } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/ohash/dist/utils/index.mjs';
import { klona } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/klona/dist/index.mjs';
import { pascalCase, kebabCase } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/scule/dist/index.mjs';
import { find, html } from 'file://X:/kasparboelkjeldsen/kjeldsen.dev/kjeldsen.frontend/node_modules/property-information/index.js';

function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestFetch() {
  var _a;
  return ((_a = useRequestEvent()) == null ? void 0 : _a.$fetch) || globalThis.$fetch;
}

const htmlTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "math",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];

const TEXT_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"];
function isTag(vnode, tag) {
  if (vnode.type === tag) {
    return true;
  }
  if (typeof vnode.type === "object" && vnode.type.tag === tag) {
    return true;
  }
  if (vnode.tag === tag) {
    return true;
  }
  return false;
}
function isText(vnode) {
  return isTag(vnode, "text") || isTag(vnode, Symbol.for("v-txt"));
}
function nodeChildren(node) {
  var _a;
  if (Array.isArray(node.children) || typeof node.children === "string") {
    return node.children;
  }
  if (typeof ((_a = node.children) == null ? void 0 : _a.default) === "function") {
    return node.children.default();
  }
  return [];
}
function nodeTextContent(node) {
  if (!node) {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(nodeTextContent).join("");
  }
  if (isText(node)) {
    return node.value || node.children || "";
  }
  const children = nodeChildren(node);
  if (Array.isArray(children)) {
    return children.map(nodeTextContent).filter(Boolean).join("");
  }
  return "";
}
function unwrap(vnode, tags = []) {
  if (Array.isArray(vnode)) {
    return vnode.flatMap((node) => unwrap(node, tags));
  }
  let result = vnode;
  if (tags.some((tag) => tag === "*" || isTag(vnode, tag))) {
    result = nodeChildren(vnode) || vnode;
    if (!Array.isArray(result) && TEXT_TAGS.some((tag) => isTag(vnode, tag))) {
      result = [result];
    }
  }
  return result;
}
function _flatUnwrap(vnodes, tags = []) {
  vnodes = Array.isArray(vnodes) ? vnodes : [vnodes];
  if (!tags.length) {
    return vnodes;
  }
  return vnodes.flatMap((vnode) => _flatUnwrap(unwrap(vnode, [tags[0]]), tags.slice(1))).filter((vnode) => !(isText(vnode) && nodeTextContent(vnode).trim() === ""));
}
function flatUnwrap(vnodes, tags = []) {
  if (typeof tags === "string") {
    tags = tags.split(/[,\s]/).map((tag) => tag.trim()).filter(Boolean);
  }
  if (!tags.length) {
    return vnodes;
  }
  return _flatUnwrap(vnodes, tags).reduce((acc, item) => {
    if (isText(item)) {
      if (typeof acc[acc.length - 1] === "string") {
        acc[acc.length - 1] += item.children;
      } else {
        acc.push(item.children);
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

function pick$1(obj, keys) {
  return keys.reduce((acc, key) => {
    const value = get(obj, key);
    if (value !== void 0) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function get(obj, key) {
  return key.split(".").reduce((acc, k) => acc && acc[k], obj);
}

const DEFAULT_SLOT = "default";
const rxOn = /^@|^v-on:/;
const rxBind = /^:|^v-bind:/;
const rxModel = /^v-model/;
const nativeInputs = ["select", "textarea", "input"];
const specialParentTags = ["math", "svg"];
const proseComponentMap = Object.fromEntries(["p", "a", "blockquote", "code", "pre", "code", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "ul", "ol", "li", "strong", "table", "thead", "tbody", "td", "th", "tr", "script"].map((t) => [t, `prose-${t}`]));
const _sfc_main$8 = defineComponent({
  name: "MDCRenderer",
  props: {
    /**
     * Content to render
     */
    body: {
      type: Object,
      required: true
    },
    /**
     * Document meta data
     */
    data: {
      type: Object,
      default: () => ({})
    },
    /**
     * Class(es) to bind to the component
     */
    class: {
      type: [String, Object],
      default: void 0
    },
    /**
     * Root tag to use for rendering
     */
    tag: {
      type: [String, Boolean],
      default: void 0
    },
    /**
     * Whether or not to render Prose components instead of HTML tags
     */
    prose: {
      type: Boolean,
      default: void 0
    },
    /**
     * The map of custom components to use for rendering.
     */
    components: {
      type: Object,
      default: () => ({})
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    }
  },
  async setup(props) {
    var _a, _b, _c;
    const app = (_b = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext) == null ? void 0 : _b.app;
    const $nuxt = app == null ? void 0 : app.$nuxt;
    const route = ($nuxt == null ? void 0 : $nuxt.$route) || ($nuxt == null ? void 0 : $nuxt._route);
    const { mdc } = ((_c = $nuxt == null ? void 0 : $nuxt.$config) == null ? void 0 : _c.public) || {};
    const tags = computed(() => {
      var _a2, _b2, _c2, _d;
      return {
        ...((_a2 = mdc == null ? void 0 : mdc.components) == null ? void 0 : _a2.prose) && props.prose !== false ? proseComponentMap : {},
        ...((_b2 = mdc == null ? void 0 : mdc.components) == null ? void 0 : _b2.map) || {},
        ...toRaw(((_d = (_c2 = props.data) == null ? void 0 : _c2.mdc) == null ? void 0 : _d.components) || {}),
        ...props.components
      };
    });
    const contentKey = computed(() => {
      var _a2;
      const components = (((_a2 = props.body) == null ? void 0 : _a2.children) || []).map((n) => n.tag || n.type).filter((t) => !htmlTags.includes(t));
      return Array.from(new Set(components)).sort().join(".");
    });
    const runtimeData = reactive({
      ...props.data
    });
    watch(() => props.data, (newData) => {
      Object.assign(runtimeData, newData);
    });
    await resolveContentComponents(props.body, { tags: tags.value });
    function updateRuntimeData(code, value) {
      const lastIndex = code.split(".").length - 1;
      return code.split(".").reduce((o, k, i) => {
        if (i == lastIndex && o) {
          o[k] = value;
          return o[k];
        }
        return typeof o === "object" ? o[k] : void 0;
      }, runtimeData);
    }
    return { tags, contentKey, route, runtimeData, updateRuntimeData };
  },
  render(ctx) {
    var _a, _b;
    const { tags, tag, body, data, contentKey, route, unwrap, runtimeData, updateRuntimeData } = ctx;
    if (!body) {
      return null;
    }
    const meta = { ...data, tags, $route: route, runtimeData, updateRuntimeData };
    const component = tag !== false ? resolveComponentInstance(tag || ((_a = meta.component) == null ? void 0 : _a.name) || meta.component || "div") : void 0;
    return component ? h(component, { ...(_b = meta.component) == null ? void 0 : _b.props, class: ctx.class, ...this.$attrs, key: contentKey }, { default: defaultSlotRenderer }) : defaultSlotRenderer == null ? void 0 : defaultSlotRenderer();
    function defaultSlotRenderer() {
      const defaultSlot = _renderSlots(body, h, { documentMeta: meta, parentScope: meta, resolveComponent: resolveComponentInstance });
      if (!(defaultSlot == null ? void 0 : defaultSlot.default)) {
        return null;
      }
      if (unwrap) {
        return flatUnwrap(
          defaultSlot.default(),
          typeof unwrap === "string" ? unwrap.split(" ") : ["*"]
        );
      }
      return defaultSlot.default();
    }
  }
});
function _renderNode(node, h2, options, keyInParent) {
  const { documentMeta, parentScope, resolveComponent: resolveComponent2 } = options;
  if (node.type === "text") {
    return h2(Text, node.value);
  }
  if (node.type === "comment") {
    return h2(Comment, null, node.value);
  }
  const originalTag = node.tag;
  const renderTag = findMappedTag(node, documentMeta.tags);
  if (node.tag === "binding") {
    return renderBinding(node, h2, documentMeta, parentScope);
  }
  const _resolveComponent = isUnresolvableTag(renderTag) ? (component2) => component2 : resolveComponent2;
  if (renderTag === "script") {
    return h2(
      "pre",
      { class: "script-to-pre" },
      "<script>\n" + nodeTextContent(node) + "\n<\/script>"
    );
  }
  const component = _resolveComponent(renderTag);
  if (typeof component === "object") {
    component.tag = originalTag;
  }
  const props = propsToData(node, documentMeta);
  if (keyInParent) {
    props.key = keyInParent;
  }
  return h2(
    component,
    props,
    _renderSlots(
      node,
      h2,
      {
        documentMeta,
        parentScope: { ...parentScope, ...props },
        resolveComponent: _resolveComponent
      }
    )
  );
}
function _renderSlots(node, h2, options) {
  const { documentMeta, parentScope, resolveComponent: resolveComponent2 } = options;
  const children = node.children || [];
  const slotNodes = children.reduce((data, node2) => {
    if (!isTemplate(node2)) {
      data[DEFAULT_SLOT].children.push(node2);
      return data;
    }
    const slotName = getSlotName(node2);
    data[slotName] = data[slotName] || { props: {}, children: [] };
    if (node2.type === "element") {
      data[slotName].props = node2.props;
      data[slotName].children.push(...node2.children || []);
    }
    return data;
  }, {
    [DEFAULT_SLOT]: { props: {}, children: [] }
  });
  const slots = Object.entries(slotNodes).reduce((slots2, [name, { props, children: children2 }]) => {
    if (!children2.length) {
      return slots2;
    }
    slots2[name] = (data = {}) => {
      const scopedProps = pick$1(data, Object.keys(props || {}));
      let vNodes = children2.map((child, index) => {
        var _a;
        return _renderNode(
          child,
          h2,
          {
            documentMeta,
            parentScope: { ...parentScope, ...scopedProps },
            resolveComponent: resolveComponent2
          },
          String(((_a = child.props) == null ? void 0 : _a.key) || index)
        );
      });
      if (props == null ? void 0 : props.unwrap) {
        vNodes = flatUnwrap(vNodes, props.unwrap);
      }
      return mergeTextNodes(vNodes);
    };
    return slots2;
  }, {});
  return slots;
}
function renderBinding(node, h2, documentMeta, parentScope = {}) {
  var _a, _b;
  const data = {
    ...documentMeta.runtimeData,
    ...parentScope,
    $document: documentMeta,
    $doc: documentMeta
  };
  const splitter = /\.|\[(\d+)\]/;
  const keys = (_a = node.props) == null ? void 0 : _a.value.trim().split(splitter).filter(Boolean);
  const value = keys.reduce((data2, key) => {
    if (data2 && key in data2) {
      if (typeof data2[key] === "function") {
        return data2[key]();
      } else {
        return data2[key];
      }
    }
    return void 0;
  }, data);
  const defaultValue = (_b = node.props) == null ? void 0 : _b.defaultValue;
  return h2(Text, value ?? defaultValue ?? "");
}
function propsToData(node, documentMeta) {
  const { tag = "", props = {} } = node;
  return Object.keys(props).reduce(function(data, key) {
    if (key === "__ignoreMap") {
      return data;
    }
    const value = props[key];
    if (rxModel.test(key)) {
      return propsToDataRxModel(key, value, data, documentMeta, { native: nativeInputs.includes(tag) });
    }
    if (key === "v-bind") {
      return propsToDataVBind(key, value, data, documentMeta);
    }
    if (rxOn.test(key)) {
      return propsToDataRxOn(key, value, data, documentMeta);
    }
    if (rxBind.test(key)) {
      return propsToDataRxBind(key, value, data, documentMeta);
    }
    const { attribute } = find(html, key);
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      data[attribute] = value.join(" ");
      return data;
    }
    data[attribute] = value;
    return data;
  }, {});
}
function propsToDataRxModel(key, value, data, documentMeta, { native }) {
  var _a;
  const propName = ((_a = key.match(/^v-model:([^=]+)/)) == null ? void 0 : _a[1]) || "modelValue";
  const field = native ? "value" : propName;
  const event = native ? "onInput" : `onUpdate:${propName}`;
  data[field] = evalInContext(value, documentMeta.runtimeData);
  data[event] = (e) => {
    var _a2;
    documentMeta.updateRuntimeData(value, native ? (_a2 = e.target) == null ? void 0 : _a2.value : e);
  };
  return data;
}
function propsToDataVBind(_key, value, data, documentMeta) {
  const val = evalInContext(value, documentMeta);
  data = Object.assign(data, val);
  return data;
}
function propsToDataRxOn(key, value, data, documentMeta) {
  key = key.replace(rxOn, "");
  data.on = data.on || {};
  data.on[key] = () => evalInContext(value, documentMeta);
  return data;
}
function propsToDataRxBind(key, value, data, documentMeta) {
  key = key.replace(rxBind, "");
  data[key] = evalInContext(value, documentMeta);
  return data;
}
const resolveComponentInstance = (component) => {
  if (typeof component === "string") {
    if (htmlTags.includes(component)) {
      return component;
    }
    const _component = resolveComponent(pascalCase(component), false);
    if (!component || (_component == null ? void 0 : _component.name) === "AsyncComponentWrapper") {
      return _component;
    }
    if (typeof _component === "string") {
      return _component;
    }
    if ("setup" in _component) {
      return defineAsyncComponent(() => new Promise((resolve) => resolve(_component)));
    }
    return _component;
  }
  return component;
};
function evalInContext(code, context) {
  const result = code.split(".").reduce((o, k) => typeof o === "object" ? o[k] : void 0, context);
  return typeof result === "undefined" ? destr(code) : result;
}
function getSlotName(node) {
  let name = "";
  for (const propName of Object.keys(node.props || {})) {
    if (!propName.startsWith("#") && !propName.startsWith("v-slot:")) {
      continue;
    }
    name = propName.split(/[:#]/, 2)[1];
    break;
  }
  return name || DEFAULT_SLOT;
}
function isTemplate(node) {
  return node.tag === "template";
}
function isUnresolvableTag(tag) {
  return specialParentTags.includes(tag);
}
function mergeTextNodes(nodes) {
  const mergedNodes = [];
  for (const node of nodes) {
    const previousNode = mergedNodes[mergedNodes.length - 1];
    if (node.type === Text && (previousNode == null ? void 0 : previousNode.type) === Text) {
      previousNode.children = previousNode.children + node.children;
    } else {
      mergedNodes.push(node);
    }
  }
  return mergedNodes;
}
async function resolveContentComponents(body, meta) {
  if (!body) {
    return;
  }
  const components = Array.from(new Set(loadComponents(body, meta)));
  await Promise.all(components.map(async (c) => {
    if ((c == null ? void 0 : c.render) || (c == null ? void 0 : c.ssrRender) || (c == null ? void 0 : c.__ssrInlineRender)) {
      return;
    }
    const resolvedComponent = resolveComponentInstance(c);
    if ((resolvedComponent == null ? void 0 : resolvedComponent.__asyncLoader) && !resolvedComponent.__asyncResolved) {
      await resolvedComponent.__asyncLoader();
    }
  }));
  function loadComponents(node, documentMeta) {
    const tag = node.tag;
    if (node.type === "text" || tag === "binding" || node.type === "comment") {
      return [];
    }
    const renderTag = findMappedTag(node, documentMeta.tags);
    if (isUnresolvableTag(renderTag)) {
      return [];
    }
    const components2 = [];
    if (node.type !== "root" && !htmlTags.includes(renderTag)) {
      components2.push(renderTag);
    }
    for (const child of node.children || []) {
      components2.push(...loadComponents(child, documentMeta));
    }
    return components2;
  }
}
function findMappedTag(node, tags) {
  var _a;
  const tag = node.tag;
  if (!tag || typeof ((_a = node.props) == null ? void 0 : _a.__ignoreMap) !== "undefined") {
    return tag;
  }
  return tags[tag] || tags[pascalCase(tag)] || tags[kebabCase(node.tag)] || tag;
}
const _sfc_setup$2 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};

const isDefer = (dedupe) => dedupe === "defer" || dedupe === false;
function useAsyncData(...args) {
  var _a, _b;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, _handler, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof _handler !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  const nuxtApp = useNuxtApp();
  const handler = !((_a = nuxtApp.ssrContext) == null ? void 0 : _a._sharedPrerenderCache) ? _handler : () => {
    const value = nuxtApp.ssrContext._sharedPrerenderCache.get(key);
    if (value) {
      return value;
    }
    const promise = Promise.resolve().then(() => nuxtApp.runWithContext(_handler));
    nuxtApp.ssrContext._sharedPrerenderCache.set(key, promise);
    return promise;
  };
  const getDefault = () => asyncDataDefaults.value;
  const getDefaultCachedData = () => nuxtApp.isHydrating ? nuxtApp.payload.data[key] : nuxtApp.static.data[key];
  options.server ?? (options.server = true);
  options.default ?? (options.default = getDefault);
  options.getCachedData ?? (options.getCachedData = getDefaultCachedData);
  options.lazy ?? (options.lazy = false);
  options.immediate ?? (options.immediate = true);
  options.deep ?? (options.deep = asyncDataDefaults.deep);
  options.dedupe ?? (options.dedupe = "cancel");
  const initialCachedData = options.getCachedData(key, nuxtApp);
  const hasCachedData = initialCachedData != null;
  if (!nuxtApp._asyncData[key] || !options.immediate) {
    (_b = nuxtApp.payload._errors)[key] ?? (_b[key] = asyncDataDefaults.errorValue);
    const _ref = options.deep ? ref : shallowRef;
    nuxtApp._asyncData[key] = {
      data: _ref(hasCachedData ? initialCachedData : options.default()),
      pending: ref(!hasCachedData),
      error: toRef(nuxtApp.payload._errors, key),
      status: ref("idle"),
      _default: options.default
    };
  }
  const asyncData = { ...nuxtApp._asyncData[key] };
  delete asyncData._default;
  asyncData.refresh = asyncData.execute = (opts = {}) => {
    if (nuxtApp._asyncDataPromises[key]) {
      if (isDefer(opts.dedupe ?? options.dedupe)) {
        return nuxtApp._asyncDataPromises[key];
      }
      nuxtApp._asyncDataPromises[key].cancelled = true;
    }
    if (opts._initial || nuxtApp.isHydrating && opts._initial !== false) {
      const cachedData = opts._initial ? initialCachedData : options.getCachedData(key, nuxtApp);
      if (cachedData != null) {
        return Promise.resolve(cachedData);
      }
    }
    asyncData.pending.value = true;
    asyncData.status.value = "pending";
    const promise = new Promise(
      (resolve, reject) => {
        try {
          resolve(handler(nuxtApp));
        } catch (err) {
          reject(err);
        }
      }
    ).then(async (_result) => {
      if (promise.cancelled) {
        return nuxtApp._asyncDataPromises[key];
      }
      let result = _result;
      if (options.transform) {
        result = await options.transform(_result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      nuxtApp.payload.data[key] = result;
      asyncData.data.value = result;
      asyncData.error.value = asyncDataDefaults.errorValue;
      asyncData.status.value = "success";
    }).catch((error) => {
      if (promise.cancelled) {
        return nuxtApp._asyncDataPromises[key];
      }
      asyncData.error.value = createError(error);
      asyncData.data.value = unref(options.default());
      asyncData.status.value = "error";
    }).finally(() => {
      if (promise.cancelled) {
        return;
      }
      asyncData.pending.value = false;
      delete nuxtApp._asyncDataPromises[key];
    });
    nuxtApp._asyncDataPromises[key] = promise;
    return nuxtApp._asyncDataPromises[key];
  };
  asyncData.clear = () => clearNuxtDataByKey(nuxtApp, key);
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxtApp.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxtApp.hook("app:created", async () => {
        await promise;
      });
    }
  }
  const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = asyncDataDefaults.errorValue;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = void 0;
    nuxtApp._asyncData[key].error.value = asyncDataDefaults.errorValue;
    nuxtApp._asyncData[key].pending.value = false;
    nuxtApp._asyncData[key].status.value = "idle";
  }
  if (key in nuxtApp._asyncDataPromises) {
    if (nuxtApp._asyncDataPromises[key]) {
      nuxtApp._asyncDataPromises[key].cancelled = true;
    }
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}

const _sfc_main$7 = {
  __name: "MDC",
  __ssrInlineRender: true,
  props: {
    tag: {
      type: [String, Boolean],
      default: "div"
    },
    /**
     * Raw markdown string or parsed markdown object from `parseMarkdown`
     */
    value: {
      type: [String, Object],
      required: true
    },
    /**
     * Render only the excerpt
     */
    excerpt: {
      type: Boolean,
      default: false
    },
    /**
     * Options for `parseMarkdown`
     */
    parserOptions: {
      type: Object,
      default: () => ({})
    },
    /**
     * Class to be applied to the root element
     */
    class: {
      type: [String, Array, Object],
      default: ""
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    },
    /**
     * Async Data Unique Key
     * @default `hash(props.value)`
     */
    cacheKey: {
      type: String,
      default: void 0
    },
    /**
     * Partial parsing (if partial is `true`, title and toc generation will not be generated)
     */
    partial: {
      type: Boolean,
      default: true
    }
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const key = computed(() => props.cacheKey ?? hashString(props.value));
    const { data, refresh, error } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(key.value, async () => {
      var _a, _b;
      if (typeof props.value !== "string") {
        return props.value;
      }
      const { parseMarkdown } = await import('./index.mjs');
      return await parseMarkdown(props.value, {
        ...props.parserOptions,
        toc: props.partial ? false : (_a = props.parserOptions) == null ? void 0 : _a.toc,
        contentHeading: props.partial ? false : (_b = props.parserOptions) == null ? void 0 : _b.contentHeading
      });
    }, "$R23qlhow_i")), __temp = await __temp, __restore(), __temp);
    const body = computed(() => {
      var _a, _b;
      return props.excerpt ? (_a = data.value) == null ? void 0 : _a.excerpt : (_b = data.value) == null ? void 0 : _b.body;
    });
    watch(() => props.value, () => {
      refresh();
    });
    function hashString(str) {
      if (typeof str !== "string") {
        str = JSON.stringify(str || "");
      }
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 6) - hash + char;
        hash = hash & hash;
      }
      return `mdc-${hash === 0 ? "0000" : hash.toString(36)}-key`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_MDCRenderer = _sfc_main$8;
      ssrRenderSlot(_ctx.$slots, "default", {
        data: (_a = unref(data)) == null ? void 0 : _a.data,
        body: (_b = unref(data)) == null ? void 0 : _b.body,
        toc: (_c = unref(data)) == null ? void 0 : _c.toc,
        excerpt: (_d = unref(data)) == null ? void 0 : _d.excerpt,
        error: unref(error)
      }, () => {
        var _a2;
        if (body.value) {
          _push(ssrRenderComponent(_component_MDCRenderer, {
            tag: props.tag,
            class: props.class,
            body: body.value,
            data: (_a2 = unref(data)) == null ? void 0 : _a2.data,
            unwrap: props.unwrap
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
      }, _push, _parent);
    };
  }
};
const _sfc_setup$1 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "codeBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_MDC = _sfc_main$7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "font-mono" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_MDC, {
        value: (_a = props.data.properties) == null ? void 0 : _a.code
      }, null, _parent));
      _push(`</div>`);
    };
  }
});

const clientOnlySymbol = Symbol.for("nuxt:client-only");
const __nuxt_component_0 = defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots, attrs }) {
    const mounted = ref(false);
    provide(clientOnlySymbol, true);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});

const CookieDefaults = {
  path: "/",
  watch: true,
  decode: (val) => destr(decodeURIComponent(val)),
  encode: (val) => encodeURIComponent(typeof val === "string" ? val : JSON.stringify(val))
};
function useCookie(name, _opts) {
  var _a;
  const opts = { ...CookieDefaults, ..._opts };
  opts.filter ?? (opts.filter = (key) => key === name);
  const cookies = readRawCookies(opts) || {};
  let delay;
  if (opts.maxAge !== void 0) {
    delay = opts.maxAge * 1e3;
  } else if (opts.expires) {
    delay = opts.expires.getTime() - Date.now();
  }
  const hasExpired = delay !== void 0 && delay <= 0;
  const cookieValue = klona(hasExpired ? void 0 : cookies[name] ?? ((_a = opts.default) == null ? void 0 : _a.call(opts)));
  const cookie = ref(cookieValue);
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      if (opts.readonly || isEqual(cookie.value, cookies[name])) {
        return;
      }
      nuxtApp._cookies || (nuxtApp._cookies = {});
      if (name in nuxtApp._cookies) {
        if (isEqual(cookie.value, nuxtApp._cookies[name])) {
          return;
        }
      }
      nuxtApp._cookies[name] = cookie.value;
      writeServerCookie(useRequestEvent(nuxtApp), name, cookie.value, opts);
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:error", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  {
    return parse(getRequestHeader(useRequestEvent(), "cookie") || "", opts);
  }
}
function writeServerCookie(event, name, value, opts = {}) {
  if (event) {
    if (value !== null && value !== void 0) {
      return setCookie(event, name, value, opts);
    }
    if (getCookie(event, name) !== void 0) {
      return deleteCookie(event, name, opts);
    }
  }
}

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
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

const dataPoints = 400;
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "funTimeWebEkg",
  __ssrInlineRender: true,
  setup(__props) {
    Chart.register(
      Title,
      Tooltip,
      Legend,
      LineElement,
      CategoryScale,
      LinearScale,
      PointElement
    );
    const status = ref("I'm alive! 😄");
    const murders = ref([]);
    const config = useRuntimeConfig();
    config.public.cmsHost;
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString();
    };
    const chartData = ref({
      responsive: true,
      maintainAspectRatio: false,
      labels: Array(dataPoints).fill(""),
      datasets: [
        {
          label: "Heartbeat",
          data: Array(dataPoints).fill(0),
          borderColor: "rgb(0, 255, 0)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    });
    const chartOptions = {
      responsive: true,
      animation: { duration: 0 },
      scales: {
        x: { display: false },
        y: { min: 0, max: 1.5, display: false }
      },
      plugins: { legend: { display: false } }
    };
    Array.from({ length: 50 }, (_, i) => {
      const x = i / 49;
      return x < 0.1 ? 1.2 * (x / 0.1) : 1.2 * Math.exp(-5 * (x - 0.1));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-6ffea522><h2 class="text-white text-2xl font-bold" data-v-6ffea522>${ssrInterpolate(status.value)}</h2><div class="h-20 mb-8" data-v-6ffea522>`);
      _push(ssrRenderComponent(unref(Line), {
        data: chartData.value,
        options: chartOptions
      }, null, _parent));
      _push(`</div>`);
      if (murders.value.length) {
        _push(`<div class="prose prose-invert mt-6" data-v-6ffea522><h3 data-v-6ffea522>💀 Crime Scene Log</h3><ul data-v-6ffea522><!--[-->`);
        ssrRenderList(murders.value, (murder) => {
          _push(`<li class="flex justify-between items-center border-b border-gray-700 py-2" data-v-6ffea522><span class="font-semibold" data-v-6ffea522>${ssrInterpolate(murder.username)} `);
          if (murder.count > 1) {
            _push(`<span class="text-sm text-pink-400 ml-2" data-v-6ffea522> (${ssrInterpolate(murder.count)} times — chill 😅) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><span class="text-sm text-gray-400" data-v-6ffea522>${ssrInterpolate(formatDate(murder.last))}</span></li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<div class="text-gray-400 mt-6 italic" data-v-6ffea522> 🕊️ No murders on record. Peace reigns, or I&#39;m dead. </div>`);
      }
      _push(`</div>`);
    };
  }
});

const _sfc_setup = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/blocks/funTimeWebEkg.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const BlocksFunTimeWebEkg = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-6ffea522"]]);

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "imageBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const event = useRequestEvent();
    const isBlockPreview = event == null ? void 0 : event.context.blockPreview;
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (!unref(isBlockPreview)) {
        _push(`<img${ssrRenderAttr("src", (_c = (_b = (_a = _ctx.data.properties) == null ? void 0 : _a.image) == null ? void 0 : _b.at(0)) == null ? void 0 : _c.url)}${ssrRenderAttr("alt", ((_d = _ctx.data.properties) == null ? void 0 : _d.altText) ?? "")} class="rounded-lg">`);
      } else {
        _push(`<!---->`);
      }
      if (unref(isBlockPreview)) {
        _push(`<img${ssrRenderAttr("src", (_g = (_f = (_e = _ctx.data.properties) == null ? void 0 : _e.image) == null ? void 0 : _f.at(0)) == null ? void 0 : _g.url)}${ssrRenderAttr("alt", ((_h = _ctx.data.properties) == null ? void 0 : _h.altText) ?? "")} class="w-full">`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "testBlock",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>${ssrInterpolate(_ctx.data.properties)}</div>`);
    };
  }
});

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
        _push(ssrRenderComponent(unref(_sfc_main$3), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "funTimeWebMurderBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$5), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "codeBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$6), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "imageBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$2), {
          data: props.data
        }, null, _parent));
      } else if (props.data.contentType === "testBlock") {
        _push(ssrRenderComponent(unref(_sfc_main$1), {
          data: props.data
        }, null, _parent));
      } else {
        _push(`<div><h1>${ssrInterpolate(props.data.contentType)}</h1><pre>${ssrInterpolate(props.data)}</pre></div>`);
      }
      _push(`</div>`);
    };
  }
});

export { TEXT_TAGS as T, _sfc_main as _, useAsyncData as a, useRequestFetch as b, isText as c, nodeChildren as d, unwrap as e, flatUnwrap as f, htmlTags as h, isTag as i, nodeTextContent as n, useRequestEvent as u };
//# sourceMappingURL=resolverComponent.vue2.mjs.map
