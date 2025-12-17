// packages/core/src/interceptor/xhr.ts
import type { MockRule, BypassConfig, GlobalConfig, ApiResponse } from '../types';
import { matchRule } from '../engine/matcher';
import { omitFields } from '../engine/field-omit';
import { PROFILE_DELAYS, DEFAULT_GLOBAL_CONFIG } from '../constants';
import { getStatusText, generateTraceId } from '../utils/http-utils';
import { applyMatchConfig } from '../utils/match-url';
import { logger, setLogLevel } from '../logger';

let OriginalXHR: typeof XMLHttpRequest | null = null;
let currentRules: MockRule[] = [];
let globalConfig: GlobalConfig = { ...DEFAULT_GLOBAL_CONFIG };
const defaultBypassConfig: BypassConfig = {
  origins: [],
  methods: ['OPTIONS'],
  contentTypes: [],
  urlPatterns: [],
};
let bypassConfig: BypassConfig = { ...defaultBypassConfig };

export function installXHRInterceptor(
  rules: MockRule[],
  config?: GlobalConfig,
  bypass?: Partial<BypassConfig>
): void {
  if (OriginalXHR) return;

  OriginalXHR = globalThis.XMLHttpRequest;
  currentRules = rules;
  globalConfig = config ? { ...config } : { ...DEFAULT_GLOBAL_CONFIG };
  // Reset bypass config each install to avoid leaking state across re-installs/tests
  bypassConfig = { ...defaultBypassConfig, ...(bypass || {}) };

  // Set log level from config
  if (globalConfig.logLevel) {
    setLogLevel(globalConfig.logLevel);
  }

  logger.info('XHR interceptor installed with', rules.length, 'rules');

  // @ts-expect-error - We're replacing XMLHttpRequest
  globalThis.XMLHttpRequest = MockXMLHttpRequest;
}

export function uninstallXHRInterceptor(): void {
  if (OriginalXHR) {
    globalThis.XMLHttpRequest = OriginalXHR;
    OriginalXHR = null;
    currentRules = [];
    globalConfig = { ...DEFAULT_GLOBAL_CONFIG };
    bypassConfig = { ...defaultBypassConfig };
    logger.info('XHR interceptor uninstalled');
  }
}

export function updateRules(rules: MockRule[]): void {
  currentRules = rules;
}

function shouldBypass(url: string, method: string, contentType?: string): boolean {
  // Bypass specified content types (e.g., streams, binary)
  if (contentType && bypassConfig.contentTypes.length > 0) {
    const normalizedContentType = contentType.toLowerCase();
    for (const ct of bypassConfig.contentTypes) {
      if (normalizedContentType.includes(ct.toLowerCase())) {
        return true;
      }
    }
  }

  // Bypass specified methods (e.g., OPTIONS for CORS)
  if (bypassConfig.methods.includes(method.toUpperCase())) {
    return true;
  }

  // Bypass specified origins
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (bypassConfig.origins.includes(urlObj.origin)) {
      return true;
    }
  } catch {
    // Invalid URL, don't bypass
  }

  // Bypass matching patterns
  for (const pattern of bypassConfig.urlPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }

  return false;
}


class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}

class MockXMLHttpRequest {
  // Static constants
  static readonly UNSENT = 0;
  static readonly OPENED = 1;
  static readonly HEADERS_RECEIVED = 2;
  static readonly LOADING = 3;
  static readonly DONE = 4;

  // Instance constants (same values, for compatibility)
  readonly UNSENT = 0;
  readonly OPENED = 1;
  readonly HEADERS_RECEIVED = 2;
  readonly LOADING = 3;
  readonly DONE = 4;

  // State
  readyState = MockXMLHttpRequest.UNSENT;
  responseType: XMLHttpRequestResponseType = '';
  response: any = null;
  responseText = '';
  responseXML: Document | null = null;
  status = 0;
  statusText = '';
  timeout = 0;
  withCredentials = false;

  // Event handlers
  onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null = null;
  onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
  onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;

  // Internal state
  private _method = 'GET';
  private _url = '';
  private _async = true;
  private _requestHeaders: Record<string, string> = {};
  private _responseHeaders: Record<string, string> = {};
  private _aborted = false;
  private _timeoutId: ReturnType<typeof setTimeout> | null = null;
  private _realXHR: XMLHttpRequest | null = null;

  /**
   * The final response URL (WHATWG URL string).
   *
   * Axios (browser adapter) commonly reads `response.request.responseURL`.
   * Some projects also read a non-standard `responseUrl` field, so we provide
   * both for compatibility.
   */
  get responseURL(): string {
    const raw =
      // If we're passing through, delegate to the real XHR when available.
      (this._realXHR as any)?.responseURL ||
      // Fallback to the opened URL.
      this._url;

    try {
      const base =
        typeof window !== 'undefined' && window.location
          ? window.location.href
          : 'http://localhost';
      return new URL(raw, base).href;
    } catch {
      return raw;
    }
  }

  // Non-standard alias used by some codebases.
  get responseUrl(): string {
    return this.responseURL;
  }

  open(method: string, url: string | URL, async = true, _user?: string | null, _password?: string | null) {
    this._method = method.toUpperCase();
    this._url = url.toString();
    this._async = async;
    this._aborted = false;
    this._requestHeaders = {};
    this._changeState(MockXMLHttpRequest.OPENED);
  }

  setRequestHeader(name: string, value: string) {
    const key = name.toLowerCase();
    this._requestHeaders[key] = this._requestHeaders[key]
      ? `${this._requestHeaders[key]}, ${value}`
      : value;
  }

  getResponseHeader(name: string): string | null {
    return this._responseHeaders[name.toLowerCase()] || null;
  }

  getAllResponseHeaders(): string {
    return Object.entries(this._responseHeaders)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');
  }

  abort() {
    this._aborted = true;
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
    if (this._realXHR) {
      this._realXHR.abort();
    }
    if (this.readyState !== MockXMLHttpRequest.UNSENT &&
        this.readyState !== MockXMLHttpRequest.DONE) {
      this._changeState(MockXMLHttpRequest.DONE);
      this._dispatchEvent('abort');
      this._dispatchEvent('loadend');
    }
  }

  send(body?: Document | XMLHttpRequestBodyInit | null) {
    if (this.readyState !== MockXMLHttpRequest.OPENED) {
      throw new DOMException('Invalid state', 'InvalidStateError');
    }

    this._dispatchEvent('loadstart');

    // Extract pathname from absolute URLs for matching
    let urlForMatching = this._url;
    if (this._url.startsWith('http')) {
      try {
        const urlObj = new URL(this._url);
        urlForMatching = urlObj.pathname + urlObj.search;
      } catch {
        // Keep original if URL parsing fails
      }
    }

    // Get content-type from request headers
    const contentType = this._requestHeaders['content-type'];

    // Check bypass first
    if (shouldBypass(this._url, this._method, contentType)) {
      logger.debug('Bypass request |', this._method, urlForMatching, '| Reason: bypass config');
      this._passthrough(body);
      return;
    }

    const urlAfterStrip = applyMatchConfig(urlForMatching, globalConfig);
    logger.debug('Intercepting |', this._method, urlForMatching, urlAfterStrip !== urlForMatching ? `-> ${urlAfterStrip}` : '', '| Rules:', currentRules.length);

    const rule = matchRule(currentRules, urlAfterStrip, this._method);

    if (!rule) {
      logger.debug('Pass through |', this._method, urlForMatching, '| No matching rule found');
      this._passthrough(body);
      return;
    }

    logger.info('Matched |', this._method, urlForMatching, '| Rule:', rule.id);

    const execute = () => {
      if (this._aborted) return;

      // 1. Network Error Mode - check timeout
      if (rule.network.errorMode === 'timeout') {
        this._handleTimeout();
        return;
      }

      // 2. Network Error Mode - check offline
      if (rule.network.errorMode === 'offline') {
        this._handleError();
        return;
      }

      // 3. Random failure
      if (rule.network.failRate && Math.random() * 100 < rule.network.failRate) {
        this._handleError();
        return;
      }

      // 4. Generate response
      this._handleSuccess(rule);
    };

    // Calculate delay
    let delay = 0;
    if (rule.network.customDelay !== undefined) {
      delay = rule.network.customDelay;
    } else if (rule.network.profile) {
      delay = PROFILE_DELAYS[rule.network.profile];
    } else {
      delay = PROFILE_DELAYS[globalConfig.networkProfile];
    }

    if (this._async) {
      this._timeoutId = setTimeout(execute, delay);
    } else {
      execute();
    }
  }

  private _passthrough(body?: Document | XMLHttpRequestBodyInit | null) {
    this._realXHR = new OriginalXHR!();
    this._realXHR.open(this._method, this._url, this._async);
    this._realXHR.responseType = this.responseType;
    this._realXHR.timeout = this.timeout;
    this._realXHR.withCredentials = this.withCredentials;

    for (const [name, value] of Object.entries(this._requestHeaders)) {
      this._realXHR.setRequestHeader(name, value);
    }

    this._realXHR.onreadystatechange = () => {
      this.readyState = this._realXHR!.readyState;
      if (this._realXHR!.readyState === MockXMLHttpRequest.DONE) {
        this.status = this._realXHR!.status;
        this.statusText = this._realXHR!.statusText;
        this.response = this._realXHR!.response;
        if (this.responseType === '' || this.responseType === 'text') {
          this.responseText = this._realXHR!.responseText;
        }
        const rawHeaders = this._realXHR!.getAllResponseHeaders();
        this._responseHeaders = {};
        if (rawHeaders) {
          rawHeaders
            .trim()
            .split(/[\r\n]+/)
            .forEach((line) => {
              const separatorIndex = line.indexOf(':');
              if (separatorIndex <= 0) return;
              const key = line.slice(0, separatorIndex).trim().toLowerCase();
              if (!key) return;
              const value = line.slice(separatorIndex + 1).trim();
              this._responseHeaders[key] = value;
            });
        }
      }
      this.onreadystatechange?.call(this as any, new Event('readystatechange'));
    };

    this._realXHR.onload = (e) => this.onload?.call(this as any, e);
    this._realXHR.onerror = (e) => this.onerror?.call(this as any, e);
    this._realXHR.onabort = (e) => this.onabort?.call(this as any, e);
    this._realXHR.ontimeout = (e) => this.ontimeout?.call(this as any, e);
    this._realXHR.onloadend = (e) => this.onloadend?.call(this as any, e);
    this._realXHR.onprogress = (e) => this.onprogress?.call(this as any, e);

    this._realXHR.send(body);
  }

  private _handleSuccess(rule: MockRule) {
    let responseData: unknown;
    let statusCode: number;
    let statusText: string;

    if (rule.response.status >= 400) {
      // HTTP Error Response
      const body = rule.response.errorBody || {
        error: getStatusText(rule.response.status),
        message: `HTTP ${rule.response.status}`,
      };

      responseData = rule.fieldOmit.enabled ? omitFields(body, rule.fieldOmit) : body;
      statusCode = rule.response.status;
      statusText = getStatusText(rule.response.status);
    } else {
      // ApiResponse structure (status=200-299)
      // Convert camelCase to snake_case for API response
      const apiResponse: ApiResponse = {
        err_no: rule.response.errNo,
        err_msg: rule.response.errMsg,
        detail_err_msg: rule.response.detailErrMsg,
        result: rule.response.result,
        sync: true,
        time_stamp: Date.now(),
        time_zone_ID: 'Asia/Shanghai',
        time_zone_offset: -480,
        trace_id: generateTraceId(),
      };

      responseData = apiResponse;

      // Apply field omission
      if (rule.fieldOmit.enabled) {
        responseData = omitFields(responseData, rule.fieldOmit);
      }

      statusCode = rule.response.status;
      statusText = getStatusText(rule.response.status);
    }

    const jsonStr = JSON.stringify(responseData);

    this._responseHeaders['content-type'] = 'application/json';
    this.status = statusCode;
    this.statusText = statusText;

    // Set response based on responseType
    switch (this.responseType) {
      case 'json':
        this.response = responseData;
        break;
      case 'text':
      case '':
        this.response = jsonStr;
        this.responseText = jsonStr;
        break;
      case 'blob':
        this.response = new Blob([jsonStr], { type: 'application/json' });
        break;
      case 'arraybuffer':
        const encoder = new TextEncoder();
        this.response = encoder.encode(jsonStr).buffer;
        break;
      case 'document':
        // Not commonly used for JSON APIs
        this.response = null;
        break;
    }

    this._changeState(MockXMLHttpRequest.HEADERS_RECEIVED);
    this._changeState(MockXMLHttpRequest.LOADING);
    this._dispatchEvent('progress');
    this._changeState(MockXMLHttpRequest.DONE);
    this._dispatchEvent('load');
    this._dispatchEvent('loadend');
  }

  private _handleError() {
    this.status = 0;
    this.statusText = '';
    this._changeState(MockXMLHttpRequest.DONE);
    this._dispatchEvent('error');
    this._dispatchEvent('loadend');
  }

  private _handleTimeout() {
    this.status = 0;
    this.statusText = '';
    this._changeState(MockXMLHttpRequest.DONE);
    this._dispatchEvent('timeout');
    this._dispatchEvent('loadend');
  }

  private _changeState(state: number) {
    this.readyState = state;
    this.onreadystatechange?.call(this as any, new Event('readystatechange'));
  }

  private _dispatchEvent(type: string) {
    const event = new ProgressEvent(type, {
      bubbles: false,
      cancelable: false,
      lengthComputable: false,
      loaded: 0,
      total: 0,
    });
    const handler = this[`on${type}` as keyof this] as Function | null;
    if (typeof handler === 'function') {
      handler.call(this, event);
    }
  }

  // Additional methods for compatibility
  overrideMimeType(_mime: string) {
    // No-op for mock
  }

  // EventTarget methods (minimal implementation)
  addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {
    throw new NotImplementedError('addEventListener is not implemented on MockXMLHttpRequest. Use on* event handler properties instead.');
  }

  removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {
    throw new NotImplementedError('removeEventListener is not implemented on MockXMLHttpRequest. Use on* event handler properties instead.');
  }

  dispatchEvent(_event: Event): boolean {
    throw new NotImplementedError('dispatchEvent is not implemented on MockXMLHttpRequest. Use on* event handler properties instead.');
  }
}
