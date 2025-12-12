// packages/core/src/interceptor/fetch.ts
import type { MockRule, BypassConfig, GlobalConfig, ApiResponse } from '../types';
import { matchRule } from '../engine/matcher';
import { omitFields } from '../engine/field-omit';
import { PROFILE_DELAYS, DEFAULT_GLOBAL_CONFIG } from '../constants';

let originalFetch: typeof fetch | null = null;
let currentRules: MockRule[] = [];
let globalConfig: GlobalConfig = { ...DEFAULT_GLOBAL_CONFIG };
const defaultBypassConfig: BypassConfig = {
  origins: [],
  methods: ['OPTIONS'],
  contentTypes: [],
  urlPatterns: [],
};
let bypassConfig: BypassConfig = { ...defaultBypassConfig };

/**
 * Install the fetch interceptor
 */
export function installFetchInterceptor(
  rules: MockRule[],
  config?: GlobalConfig,
  bypass?: Partial<BypassConfig>
): void {
  if (originalFetch) return; // Already installed

  originalFetch = globalThis.fetch;
  currentRules = rules;
  globalConfig = config ? { ...config } : { ...DEFAULT_GLOBAL_CONFIG };
  // Reset bypass config each install to avoid leaking state across re-installs/tests
  bypassConfig = { ...defaultBypassConfig, ...(bypass || {}) };

  globalThis.fetch = async function(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Extract URL and method early to handle relative URLs
    let url: string;
    let method: string;
    let contentType: string | undefined;

    if (input instanceof Request) {
      url = input.url;
      method = input.method;
      contentType = input.headers.get('content-type') || undefined;
    } else {
      // Handle string or URL input
      url = input.toString();
      method = init?.method?.toUpperCase() || 'GET';
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          contentType = init.headers.get('content-type') || undefined;
        } else if (Array.isArray(init.headers)) {
          const ctEntry = init.headers.find(([name]) => name.toLowerCase() === 'content-type');
          contentType = ctEntry?.[1];
        } else {
          const headers = init.headers as Record<string, string>;
          contentType = headers['content-type'] || headers['Content-Type'];
        }
      }
    }

    // For relative URLs in non-browser environments, we need to create a full URL
    // but we'll use the path for matching
    let urlForMatching: string;
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      urlForMatching = urlObj.pathname + urlObj.search;
    } else {
      urlForMatching = url;
    }

    // Check bypass (pass full URL for origin-based bypass rules)
    if (shouldBypass(url, method, contentType)) {
      return originalFetch!.call(globalThis, input, init);
    }

    const rule = matchRule(currentRules, urlForMatching, method);
    if (!rule) {
      return originalFetch!.call(globalThis, input, init);
    }

    // Collect abort signals
    const signals: AbortSignal[] = [];
    if (input instanceof Request && input.signal) {
      signals.push(input.signal);
    }
    if (init?.signal) {
      signals.push(init.signal);
    }

    // Check if already aborted
    for (const signal of signals) {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
    }

    return handleMock(rule, signals);
  };
}

/**
 * Uninstall the fetch interceptor
 */
export function uninstallFetchInterceptor(): void {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
    originalFetch = null;
    currentRules = [];
    globalConfig = { ...DEFAULT_GLOBAL_CONFIG };
    bypassConfig = { ...defaultBypassConfig };
  }
}

/**
 * Update rules without reinstalling
 */
export function updateRules(rules: MockRule[]): void {
  currentRules = rules;
}

/**
 * Check if request should bypass interception
 */
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

/**
 * Get HTTP status text for common status codes
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}

/**
 * Generate trace ID for response
 */
function generateTraceId(): string {
  const hex = Math.random().toString(16).slice(2, 12).padStart(10, '0');
  return `[${hex}]`;
}

/**
 * Sleep helper with abort support
 */
function sleep(ms: number, signals: AbortSignal[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const handlers: Array<{ signal: AbortSignal; handler: () => void }> = [];

    const cleanup = () => {
      handlers.forEach(({ signal, handler }) => {
        signal.removeEventListener('abort', handler);
      });
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const abortHandler = () => {
      cleanup();
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    for (const signal of signals) {
      if (signal.aborted) {
        cleanup();
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', abortHandler, { once: true });
      handlers.push({ signal, handler: abortHandler });
    }
  });
}

/**
 * Handle mock response generation
 */
async function handleMock(rule: MockRule, signals: AbortSignal[]): Promise<Response> {
  // 1. Calculate delay
  let delay = 0;
  if (rule.network.customDelay !== undefined) {
    delay = rule.network.customDelay;
  } else if (rule.network.profile) {
    delay = PROFILE_DELAYS[rule.network.profile];
  } else {
    delay = PROFILE_DELAYS[globalConfig.networkProfile];
  }

  if (delay > 0) {
    await sleep(delay, signals);
  }

  // Check abort after delay
  for (const signal of signals) {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  }

  // 2. Network Error Mode
  if (rule.network.errorMode === 'timeout') {
    throw new DOMException('The operation timed out.', 'TimeoutError');
  }

  if (rule.network.errorMode === 'offline') {
    throw new TypeError('Failed to fetch');
  }

  // 3. Random Failure
  if (rule.network.failRate && Math.random() * 100 < rule.network.failRate) {
    throw new TypeError('Failed to fetch');
  }

  // 4. Generate response based on status
  let responseData: unknown;

  if (rule.response.status >= 400) {
    // HTTP Error Response
    const body = rule.response.errorBody || {
      error: getStatusText(rule.response.status),
      message: `HTTP ${rule.response.status}`,
    };

    // Apply field omission before returning
    const finalData = rule.fieldOmit.enabled ? omitFields(body, rule.fieldOmit) : body;

    return new Response(JSON.stringify(finalData), {
      status: rule.response.status,
      statusText: getStatusText(rule.response.status),
      headers: { 'Content-Type': 'application/json' },
    });
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

    return new Response(JSON.stringify(responseData), {
      status: rule.response.status,
      statusText: getStatusText(rule.response.status),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
