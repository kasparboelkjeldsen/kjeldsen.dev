class BaseHttpRequest {
  constructor(config) {
    this.config = config;
  }
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
class ApiError extends Error {
  constructor(request, response, message) {
    super(message);
    __publicField$1(this, "url");
    __publicField$1(this, "status");
    __publicField$1(this, "statusText");
    __publicField$1(this, "body");
    __publicField$1(this, "request");
    this.name = "ApiError";
    this.url = response.url;
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = response.body;
    this.request = request;
  }
}

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _isResolved, _isRejected, _isCancelled, _cancelHandlers, _promise, _resolve, _reject;
class CancelError extends Error {
  constructor(message) {
    super(message);
    this.name = "CancelError";
  }
  get isCancelled() {
    return true;
  }
}
class CancelablePromise {
  constructor(executor) {
    __privateAdd(this, _isResolved);
    __privateAdd(this, _isRejected);
    __privateAdd(this, _isCancelled);
    __privateAdd(this, _cancelHandlers);
    __privateAdd(this, _promise);
    __privateAdd(this, _resolve);
    __privateAdd(this, _reject);
    __privateSet(this, _isResolved, false);
    __privateSet(this, _isRejected, false);
    __privateSet(this, _isCancelled, false);
    __privateSet(this, _cancelHandlers, []);
    __privateSet(this, _promise, new Promise((resolve, reject) => {
      __privateSet(this, _resolve, resolve);
      __privateSet(this, _reject, reject);
      const onResolve = (value) => {
        if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
          return;
        }
        __privateSet(this, _isResolved, true);
        if (__privateGet(this, _resolve)) __privateGet(this, _resolve).call(this, value);
      };
      const onReject = (reason) => {
        if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
          return;
        }
        __privateSet(this, _isRejected, true);
        if (__privateGet(this, _reject)) __privateGet(this, _reject).call(this, reason);
      };
      const onCancel = (cancelHandler) => {
        if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
          return;
        }
        __privateGet(this, _cancelHandlers).push(cancelHandler);
      };
      Object.defineProperty(onCancel, "isResolved", {
        get: () => __privateGet(this, _isResolved)
      });
      Object.defineProperty(onCancel, "isRejected", {
        get: () => __privateGet(this, _isRejected)
      });
      Object.defineProperty(onCancel, "isCancelled", {
        get: () => __privateGet(this, _isCancelled)
      });
      return executor(onResolve, onReject, onCancel);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(onFulfilled, onRejected) {
    return __privateGet(this, _promise).then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return __privateGet(this, _promise).catch(onRejected);
  }
  finally(onFinally) {
    return __privateGet(this, _promise).finally(onFinally);
  }
  cancel() {
    if (__privateGet(this, _isResolved) || __privateGet(this, _isRejected) || __privateGet(this, _isCancelled)) {
      return;
    }
    __privateSet(this, _isCancelled, true);
    if (__privateGet(this, _cancelHandlers).length) {
      try {
        for (const cancelHandler of __privateGet(this, _cancelHandlers)) {
          cancelHandler();
        }
      } catch (error) {
        console.warn("Cancellation threw an error", error);
        return;
      }
    }
    __privateGet(this, _cancelHandlers).length = 0;
    if (__privateGet(this, _reject)) __privateGet(this, _reject).call(this, new CancelError("Request aborted"));
  }
  get isCancelled() {
    return __privateGet(this, _isCancelled);
  }
}
_isResolved = new WeakMap();
_isRejected = new WeakMap();
_isCancelled = new WeakMap();
_cancelHandlers = new WeakMap();
_promise = new WeakMap();
_resolve = new WeakMap();
_reject = new WeakMap();

const isDefined = (value) => {
  return value !== void 0 && value !== null;
};
const isString = (value) => {
  return typeof value === "string";
};
const isStringWithValue = (value) => {
  return isString(value) && value !== "";
};
const isBlob = (value) => {
  return typeof value === "object" && typeof value.type === "string" && typeof value.stream === "function" && typeof value.arrayBuffer === "function" && typeof value.constructor === "function" && typeof value.constructor.name === "string" && /^(Blob|File)$/.test(value.constructor.name) && /^(Blob|File)$/.test(value[Symbol.toStringTag]);
};
const isFormData = (value) => {
  return value instanceof FormData;
};
const base64 = (str) => {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString("base64");
  }
};
const getQueryString = (params) => {
  const qs = [];
  const append = (key, value) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };
  const process = (key, value) => {
    if (isDefined(value)) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          process(key, v);
        });
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([k, v]) => {
          process(`${key}[${k}]`, v);
        });
      } else {
        append(key, value);
      }
    }
  };
  Object.entries(params).forEach(([key, value]) => {
    process(key, value);
  });
  if (qs.length > 0) {
    return `?${qs.join("&")}`;
  }
  return "";
};
const getUrl = (config, options) => {
  const encoder = config.ENCODE_PATH || encodeURI;
  const path = options.url.replace("{api-version}", config.VERSION).replace(/{(.*?)}/g, (substring, group) => {
    var _a;
    if ((_a = options.path) == null ? void 0 : _a.hasOwnProperty(group)) {
      return encoder(String(options.path[group]));
    }
    return substring;
  });
  const url = `${config.BASE}${path}`;
  if (options.query) {
    return `${url}${getQueryString(options.query)}`;
  }
  return url;
};
const getFormData = (options) => {
  if (options.formData) {
    const formData = new FormData();
    const process = (key, value) => {
      if (isString(value) || isBlob(value)) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    };
    Object.entries(options.formData).filter(([_, value]) => isDefined(value)).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => process(key, v));
      } else {
        process(key, value);
      }
    });
    return formData;
  }
  return void 0;
};
const resolve = async (options, resolver) => {
  if (typeof resolver === "function") {
    return resolver(options);
  }
  return resolver;
};
const getHeaders = async (config, options) => {
  const [token, username, password, additionalHeaders] = await Promise.all([
    resolve(options, config.TOKEN),
    resolve(options, config.USERNAME),
    resolve(options, config.PASSWORD),
    resolve(options, config.HEADERS)
  ]);
  const headers = Object.entries({
    Accept: "application/json",
    ...additionalHeaders,
    ...options.headers
  }).filter(([_, value]) => isDefined(value)).reduce((headers2, [key, value]) => ({
    ...headers2,
    [key]: String(value)
  }), {});
  if (isStringWithValue(token)) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (isStringWithValue(username) && isStringWithValue(password)) {
    const credentials = base64(`${username}:${password}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }
  if (options.body !== void 0) {
    if (options.mediaType) {
      headers["Content-Type"] = options.mediaType;
    } else if (isBlob(options.body)) {
      headers["Content-Type"] = options.body.type || "application/octet-stream";
    } else if (isString(options.body)) {
      headers["Content-Type"] = "text/plain";
    } else if (!isFormData(options.body)) {
      headers["Content-Type"] = "application/json";
    }
  }
  return new Headers(headers);
};
const getRequestBody = (options) => {
  var _a;
  if (options.body !== void 0) {
    if ((_a = options.mediaType) == null ? void 0 : _a.includes("/json")) {
      return JSON.stringify(options.body);
    } else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {
      return options.body;
    } else {
      return JSON.stringify(options.body);
    }
  }
  return void 0;
};
const sendRequest = async (config, options, url, body, formData, headers, onCancel) => {
  const controller = new AbortController();
  const request2 = {
    headers,
    body: body != null ? body : formData,
    method: options.method,
    signal: controller.signal
  };
  if (config.WITH_CREDENTIALS) {
    request2.credentials = config.CREDENTIALS;
  }
  onCancel(() => controller.abort());
  return await fetch(url, request2);
};
const getResponseHeader = (response, responseHeader) => {
  if (responseHeader) {
    const content = response.headers.get(responseHeader);
    if (isString(content)) {
      return content;
    }
  }
  return void 0;
};
const getResponseBody = async (response) => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get("Content-Type");
      if (contentType) {
        const jsonTypes = ["application/json", "application/problem+json"];
        const isJSON = jsonTypes.some((type) => contentType.toLowerCase().startsWith(type));
        if (isJSON) {
          return await response.json();
        } else {
          return await response.text();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return void 0;
};
const catchErrorCodes = (options, result) => {
  var _a, _b;
  const errors = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...options.errors
  };
  const error = errors[result.status];
  if (error) {
    throw new ApiError(options, result, error);
  }
  if (!result.ok) {
    const errorStatus = (_a = result.status) != null ? _a : "unknown";
    const errorStatusText = (_b = result.statusText) != null ? _b : "unknown";
    const errorBody = (() => {
      try {
        return JSON.stringify(result.body, null, 2);
      } catch (e) {
        return void 0;
      }
    })();
    throw new ApiError(
      options,
      result,
      `Generic Error: status: ${errorStatus}; status text: ${errorStatusText}; body: ${errorBody}`
    );
  }
};
const request = (config, options) => {
  return new CancelablePromise(async (resolve2, reject, onCancel) => {
    try {
      const url = getUrl(config, options);
      const formData = getFormData(options);
      const body = getRequestBody(options);
      const headers = await getHeaders(config, options);
      if (!onCancel.isCancelled) {
        const response = await sendRequest(config, options, url, body, formData, headers, onCancel);
        const responseBody = await getResponseBody(response);
        const responseHeader = getResponseHeader(response, options.responseHeader);
        const result = {
          url,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          body: responseHeader != null ? responseHeader : responseBody
        };
        catchErrorCodes(options, result);
        resolve2(result.body);
      }
    } catch (error) {
      reject(error);
    }
  });
};

class FetchHttpRequest extends BaseHttpRequest {
  constructor(config) {
    super(config);
  }
  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  request(options) {
    return request(this.config, options);
  }
}

class ContentService {
  constructor(httpRequest) {
    this.httpRequest = httpRequest;
  }
  /**
   * @returns PagedIApiContentResponseModel OK
   * @throws ApiError
   */
  getContent20({
    fetch,
    filter,
    sort,
    skip,
    take = 10,
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content",
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "fetch": fetch,
        "filter": filter,
        "sort": sort,
        "skip": skip,
        "take": take,
        "expand": expand,
        "fields": fields
      },
      errors: {
        400: `Bad Request`,
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiContentResponseModel OK
   * @throws ApiError
   */
  getContentItemByPath20({
    path = "",
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content/item/{path}",
      path: {
        "path": path
      },
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiContentResponseModel OK
   * @throws ApiError
   */
  getContentItemById20({
    id,
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content/item/{id}",
      path: {
        "id": id
      },
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiContentResponseModel OK
   * @throws ApiError
   */
  getContentItems20({
    id,
    expand,
    fields,
    acceptLanguage,
    acceptSegment,
    apiKey,
    preview,
    startItem
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/content/items",
      headers: {
        "Accept-Language": acceptLanguage,
        "Accept-Segment": acceptSegment,
        "Api-Key": apiKey,
        "Preview": preview,
        "Start-Item": startItem
      },
      query: {
        "id": id,
        "expand": expand,
        "fields": fields
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`
      }
    });
  }
}

class MediaService {
  constructor(httpRequest) {
    this.httpRequest = httpRequest;
  }
  /**
   * @returns PagedIApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMedia20({
    fetch,
    filter,
    sort,
    skip,
    take = 10,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media",
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "fetch": fetch,
        "filter": filter,
        "sort": sort,
        "skip": skip,
        "take": take,
        "expand": expand,
        "fields": fields
      },
      errors: {
        400: `Bad Request`
      }
    });
  }
  /**
   * @returns IApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMediaItemByPath20({
    path,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media/item/{path}",
      path: {
        "path": path
      },
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMediaItemById20({
    id,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media/item/{id}",
      path: {
        "id": id
      },
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "expand": expand,
        "fields": fields
      },
      errors: {
        404: `Not Found`
      }
    });
  }
  /**
   * @returns IApiMediaWithCropsResponseModel OK
   * @throws ApiError
   */
  getMediaItems20({
    id,
    expand,
    fields,
    apiKey
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/umbraco/delivery/api/v2/media/items",
      headers: {
        "Api-Key": apiKey
      },
      query: {
        "id": id,
        "expand": expand,
        "fields": fields
      }
    });
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class DeliveryClient {
  constructor(config, HttpRequest = FetchHttpRequest) {
    __publicField(this, "content");
    __publicField(this, "media");
    __publicField(this, "request");
    var _a, _b, _c, _d;
    this.request = new HttpRequest({
      BASE: (_a = config == null ? void 0 : config.BASE) != null ? _a : "",
      VERSION: (_b = config == null ? void 0 : config.VERSION) != null ? _b : "Latest",
      WITH_CREDENTIALS: (_c = config == null ? void 0 : config.WITH_CREDENTIALS) != null ? _c : false,
      CREDENTIALS: (_d = config == null ? void 0 : config.CREDENTIALS) != null ? _d : "include",
      TOKEN: config == null ? void 0 : config.TOKEN,
      USERNAME: config == null ? void 0 : config.USERNAME,
      PASSWORD: config == null ? void 0 : config.PASSWORD,
      HEADERS: config == null ? void 0 : config.HEADERS,
      ENCODE_PATH: config == null ? void 0 : config.ENCODE_PATH
    });
    this.content = new ContentService(this.request);
    this.media = new MediaService(this.request);
  }
}

export { DeliveryClient as D };
//# sourceMappingURL=DeliveryClient.mjs.map
