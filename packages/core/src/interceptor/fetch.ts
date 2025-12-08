// packages/core/src/interceptor/fetch.ts
import type { MockRule, BypassConfig } from '../types';
import { matchRule } from '../engine/matcher';
import { generateSuccessResponse, generateBusinessErrorResponse } from '../engine/response';
import { omitFields } from '../engine/field-omit';

let originalFetch: typeof fetch | null = null;
let currentRules: MockRule[] = [];
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
  bypass?: Partial<BypassConfig>
): void {
  if (originalFetch) return; // Already installed

  originalFetch = globalThis.fetch;
  currentRules = rules;
  // Reset bypass config each install to avoid leaking state across re-installs/tests
  bypassConfig = { ...defaultBypassConfig, ...(bypass || {}) };

  globalThis.fetch = async function(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Extract URL and method early to handle relative URLs
    let url: string;
    let method: string;

    if (input instanceof Request) {
      url = input.url;
      method = input.method;
    } else {
      // Handle string or URL input
      url = input.toString();
      method = init?.method?.toUpperCase() || 'GET';
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
    if (shouldBypass(url, method)) {
      return originalFetch!.call(globalThis, input, init);
    }

    const rule = matchRule(currentRules, urlForMatching, method);
    if (!rule || rule.mockType === 'none') {
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
function shouldBypass(url: string, method: string): boolean {
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
 * Delay helper with abort support
 */
function delay(ms: number, signals: AbortSignal[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    let rejected = false;

    const abortHandler = () => {
      if (rejected) return;
      rejected = true;
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    for (const signal of signals) {
      if (signal.aborted) {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      signal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}

/**
 * Handle mock response generation
 */
async function handleMock(rule: MockRule, signals: AbortSignal[]): Promise<Response> {
  const { network, mockType } = rule;

  // Apply delay
  if (network.delay > 0) {
    await delay(network.delay, signals);
  }

  // Check abort after delay
  for (const signal of signals) {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  }

  // Simulate timeout
  if (network.timeout) {
    throw new DOMException('The operation timed out.', 'TimeoutError');
  }

  // Simulate offline
  if (network.offline) {
    throw new TypeError('Failed to fetch');
  }

  // Random failure
  if (network.failRate > 0 && Math.random() * 100 < network.failRate) {
    throw new TypeError('Failed to fetch');
  }

  // Generate response data
  let responseData = mockType === 'businessError'
    ? generateBusinessErrorResponse(rule.business)
    : generateSuccessResponse(rule.response.customResult);

  // Apply field omission
  if (rule.fieldOmit.enabled) {
    responseData = omitFields(responseData, rule.fieldOmit);
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
  });
}
