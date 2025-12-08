// packages/core/src/interceptor/xhr.ts
import type { MockRule, BypassConfig } from '../types';
import { matchRule } from '../engine/matcher';
import { generateSuccessResponse, generateBusinessErrorResponse } from '../engine/response';
import { omitFields } from '../engine/field-omit';

let OriginalXHR: typeof XMLHttpRequest | null = null;
let currentRules: MockRule[] = [];
let bypassConfig: BypassConfig = {
  origins: [],
  methods: ['OPTIONS'],
  contentTypes: [],
  urlPatterns: [],
};

export function installXHRInterceptor(
  rules: MockRule[],
  bypass?: Partial<BypassConfig>
): void {
  if (OriginalXHR) return;

  OriginalXHR = globalThis.XMLHttpRequest;
  currentRules = rules;
  if (bypass) {
    bypassConfig = { ...bypassConfig, ...bypass };
  }

  // @ts-expect-error - We're replacing XMLHttpRequest
  globalThis.XMLHttpRequest = MockXMLHttpRequest;
}

export function uninstallXHRInterceptor(): void {
  if (OriginalXHR) {
    globalThis.XMLHttpRequest = OriginalXHR;
    OriginalXHR = null;
    currentRules = [];
  }
}

export function updateRules(rules: MockRule[]): void {
  currentRules = rules;
}

function shouldBypass(url: string, method: string): boolean {
  if (bypassConfig.methods.includes(method.toUpperCase())) return true;
  return false;
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

    const rule = matchRule(currentRules, this._url, this._method);

    if (!rule || rule.mockType === 'none' || shouldBypass(this._url, this._method)) {
      this._passthrough(body);
      return;
    }

    const execute = () => {
      if (this._aborted) return;

      const { network } = rule;

      // Timeout check
      if (network.timeout) {
        this._handleTimeout();
        return;
      }

      // Offline check
      if (network.offline) {
        this._handleError();
        return;
      }

      // Random failure
      if (network.failRate > 0 && Math.random() * 100 < network.failRate) {
        this._handleError();
        return;
      }

      // Generate success response
      this._handleSuccess(rule);
    };

    if (this._async) {
      this._timeoutId = setTimeout(execute, rule.network.delay);
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
    let responseData = rule.mockType === 'businessError'
      ? generateBusinessErrorResponse(rule.business)
      : generateSuccessResponse(rule.response.customResult);

    if (rule.fieldOmit.enabled) {
      responseData = omitFields(responseData, rule.fieldOmit);
    }

    const jsonStr = JSON.stringify(responseData);

    this._responseHeaders['content-type'] = 'application/json';
    this.status = 200;
    this.statusText = 'OK';

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
    // TODO: Implement if needed
  }

  removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {
    // TODO: Implement if needed
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  // Upload property (for compatibility)
  get upload(): XMLHttpRequestUpload {
    // Return a minimal mock for the upload property
    return {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as any;
  }
}
