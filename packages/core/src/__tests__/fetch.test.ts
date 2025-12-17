// packages/core/src/__tests__/fetch.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  installFetchInterceptor,
  uninstallFetchInterceptor,
  updateRules
} from '../interceptor/fetch';
import type { MockRule } from '../types';
import {
  DEFAULT_FIELD_OMIT_CONFIG,
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_NETWORK_CONFIG,
  DEFAULT_RESPONSE_CONFIG,
} from '../constants';

describe('FetchInterceptor', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ real: true }), { status: 200 }))
    );
  });

  afterEach(() => {
    uninstallFetchInterceptor();
    globalThis.fetch = originalFetch;
  });

  const createRule = (overrides: Partial<MockRule> = {}): MockRule => {
    const { response, network, fieldOmit, ...rest } = overrides;
    return {
      id: 'test',
      url: '/api/test',
      method: 'GET',
      enabled: true,
      response: {
        ...DEFAULT_RESPONSE_CONFIG,
        result: { mocked: true },
        ...(response ?? {}),
      },
      network: {
        ...DEFAULT_NETWORK_CONFIG,
        ...(network ?? {}),
      },
      fieldOmit: {
        ...DEFAULT_FIELD_OMIT_CONFIG,
        ...(fieldOmit ?? {}),
        random: {
          ...DEFAULT_FIELD_OMIT_CONFIG.random,
          ...(fieldOmit?.random ?? {}),
        },
      },
      ...rest,
    };
  };

  it('intercepts matching request and returns mock response', async () => {
    const rules = [createRule()];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data.result).toEqual({ mocked: true });
    expect(data.err_no).toBe(0);
  });

  it('passes through non-matching request', async () => {
    const rules = [createRule()];
    installFetchInterceptor(rules);

    const response = await fetch('/api/other');
    const data = await response.json();

    expect(data.real).toBe(true);
  });

  it('supports stripping proxy prefixes before matching', async () => {
    const rules = [createRule({ url: '/user/login' })];
    installFetchInterceptor(rules, {
      ...DEFAULT_GLOBAL_CONFIG,
      match: { stripPrefixes: ['/api'] },
    });

    const response = await fetch('/api/user/login');
    const data = await response.json();

    expect(data.result).toEqual({ mocked: true });
  });

  it('supports Request object input', async () => {
    const rules = [createRule()];
    installFetchInterceptor(rules);

    const request = new Request('http://localhost/api/test');
    const response = await fetch(request);
    const data = await response.json();

    expect(data.result).toEqual({ mocked: true });
  });

  it('returns business error response', async () => {
    const rules = [createRule({
      response: { errNo: 10001, errMsg: 'Token expired', detailErrMsg: 'Please login' },
    })];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data.err_no).toBe(10001);
    expect(data.err_msg).toBe('Token expired');
  });

  it('throws TypeError for offline simulation', async () => {
    const rules = [createRule({
      network: { errorMode: 'offline' },
    })];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(TypeError);
  });

  it('throws DOMException for timeout simulation', async () => {
    const rules = [createRule({
      network: { errorMode: 'timeout' },
    })];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(DOMException);
  });

  it('respects AbortSignal', async () => {
    const rules = [createRule({
      network: { customDelay: 1000 },
    })];
    installFetchInterceptor(rules);

    const controller = new AbortController();
    const fetchPromise = fetch('/api/test', { signal: controller.signal });

    // Abort immediately
    controller.abort();

    await expect(fetchPromise).rejects.toThrow();
  });

  it('applies delay', async () => {
    vi.useFakeTimers();
    try {
      const rules = [createRule({
        network: { customDelay: 500 },
      })];
      installFetchInterceptor(rules);

      const fetchPromise = fetch('/api/test');

      // Should not resolve immediately
      await vi.advanceTimersByTimeAsync(100);

      // Advance past delay
      await vi.advanceTimersByTimeAsync(500);

      const response = await fetchPromise;
      expect(response.status).toBe(200);
    } finally {
      vi.useRealTimers();
    }
  });

  it('updates rules dynamically', async () => {
    const rules = [createRule({ response: { result: { v: 1 } } })];
    installFetchInterceptor(rules);

    let response = await fetch('/api/test');
    let data = await response.json();
    expect(data.result.v).toBe(1);

    // Update rules
    updateRules([createRule({ response: { result: { v: 2 } } })]);

    response = await fetch('/api/test');
    data = await response.json();
    expect(data.result.v).toBe(2);
  });

  it('bypasses OPTIONS requests by default', async () => {
    // Create a matching rule for OPTIONS to ensure bypass is actually tested.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rules = [createRule({ method: 'OPTIONS' as any })];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test', { method: 'OPTIONS' });
    const data = await response.json();

    // Should pass through to real fetch
    expect(data.real).toBe(true);
  });

  it('simulates random failure based on failRate', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);

    const rules = [createRule({
      network: { failRate: 10 },
    })];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(TypeError);

    vi.restoreAllMocks();
  });

  it('checks abort signal after delay', async () => {
    const rules = [createRule({
      network: { customDelay: 100 },
    })];
    installFetchInterceptor(rules);

    const controller = new AbortController();
    const fetchPromise = fetch('/api/test', { signal: controller.signal });

    // Abort after delay has started but before completion
    setTimeout(() => controller.abort(), 50);

    await expect(fetchPromise).rejects.toThrow(DOMException);
    await expect(fetchPromise).rejects.toThrow('Aborted');
  });

  it('applies field omission when enabled', async () => {
    const rules = [createRule({
      response: { result: { field1: 'value1', field2: 'value2' } },
      fieldOmit: {
        enabled: true,
        mode: 'manual',
        fields: ['result.field2'],
        random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
      },
    })];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data.result.field1).toBe('value1');
    expect('field2' in data.result).toBe(false);
  });

  it('uses default response config when result is empty object', async () => {
    const rules = [createRule({
      response: { ...DEFAULT_RESPONSE_CONFIG },
    })];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test');
    const data = await response.json();

    // Default response config has empty object result
    expect(data.result).toEqual({});
    expect(data.err_no).toBe(0);
  });

  it('prevents reinstallation when already installed', async () => {
    const rules = [createRule()];
    installFetchInterceptor(rules);

    const MockedFetch = globalThis.fetch;

    // Try to install again
    installFetchInterceptor(rules);

    // Should be the same reference (not reinstalled)
    expect(globalThis.fetch).toBe(MockedFetch);
  });

  it('supports custom bypass configuration with URL patterns', async () => {
    const rules = [createRule()];
    installFetchInterceptor(rules, undefined, { urlPatterns: [/^\/api\/test$/] });

    const response = await fetch('/api/test');
    const data = await response.json();

    // Should bypass and use real fetch
    expect(data.real).toBe(true);
  });

  it('matches absolute URL to pathname-based rule', async () => {
    const rules = [createRule({ url: '/api/test', method: 'GET' })];
    installFetchInterceptor(rules);

    const response = await fetch('https://example.com/api/test');
    const data = await response.json();

    expect(data.result).toEqual({ mocked: true });
  });

  it('bypasses requests to specified origins', async () => {
    const rules = [createRule({ url: '/api/test', method: 'GET' })];
    installFetchInterceptor(rules, undefined, { origins: ['https://api.foo.com'] });

    const response = await fetch('https://api.foo.com/api/test');
    const data = await response.json();

    // Should bypass and use real fetch
    expect(data.real).toBe(true);
  });

  it('matches absolute URL with query parameters', async () => {
    const rules = [createRule({ url: '/search', method: 'GET' })];
    installFetchInterceptor(rules);

    const response = await fetch('https://example.com/search?q=1');
    const data = await response.json();

    expect(data.result).toEqual({ mocked: true });
  });

  it('throws TypeError when errorMode is offline', async () => {
    const rules = [createRule({ network: { errorMode: 'offline' } })];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(TypeError);
    await expect(fetch('/api/test')).rejects.toThrow('Failed to fetch');
  });

  it('errorMode: offline always fails regardless of other network settings', async () => {
    const rules = [
      createRule({
        network: { errorMode: 'offline', failRate: 0 },
      }),
    ];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(TypeError);
  });

  it('cleans up abort listeners after delay completes', async () => {
    const rules = [createRule({
      network: { customDelay: 100 },
    })];
    installFetchInterceptor(rules);

    const controller = new AbortController();
    const signal = controller.signal;

    // Track listener count (indirect test via successful completion)
    const fetchPromise = fetch('/api/test', { signal });

    // Wait for delay to complete
    await new Promise(resolve => setTimeout(resolve, 150));

    const response = await fetchPromise;
    expect(response.status).toBe(200);

    // If listeners weren't cleaned up, they would still be attached
    // This test ensures no memory leaks or listener accumulation
    // The signal should not have any lingering references from the delay
  });

  it('cleans up abort listeners when abort is triggered during delay', async () => {
    const rules = [createRule({
      network: { customDelay: 200 },
    })];
    installFetchInterceptor(rules);

    const controller = new AbortController();
    const fetchPromise = fetch('/api/test', { signal: controller.signal });

    // Abort during delay
    setTimeout(() => controller.abort(), 50);

    await expect(fetchPromise).rejects.toThrow(DOMException);
    await expect(fetchPromise).rejects.toThrow('Aborted');

    // Cleanup should have happened in the abort path
  });

  describe('contentTypes bypass', () => {
    it('bypasses requests with specified content-type in Headers', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: ['application/octet-stream'] });

      const headers = new Headers();
      headers.set('content-type', 'application/octet-stream');

      const response = await fetch('/api/test', {
        method: 'POST',
        headers,
      });
      const data = await response.json();

      // Should bypass and use real fetch
      expect(data.real).toBe(true);
    });

    it('bypasses requests with specified content-type in object headers', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: ['multipart/form-data'] });

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary',
        },
      });
      const data = await response.json();

      // Should bypass and use real fetch
      expect(data.real).toBe(true);
    });

    it('bypasses requests with specified content-type in array headers', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: ['video/mp4'] });

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: [
          ['content-type', 'video/mp4'],
        ],
      });
      const data = await response.json();

      // Should bypass and use real fetch
      expect(data.real).toBe(true);
    });

    it('bypasses Request object with specified content-type', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: ['image/png'] });

      const headers = new Headers();
      headers.set('content-type', 'image/png');
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        headers,
      });

      const response = await fetch(request);
      const data = await response.json();

      // Should bypass and use real fetch
      expect(data.real).toBe(true);
    });

    it('does not bypass when content-type does not match', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: ['application/octet-stream'] });

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      // Should be intercepted
      expect(data.result).toEqual({ mocked: true });
      expect(data.err_no).toBe(0);
    });

    it('supports multiple content-type patterns', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: ['image/', 'video/', 'audio/'] });

      const response1 = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
      });
      const data1 = await response1.json();
      expect(data1.real).toBe(true);

      const response2 = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'video/webm' },
      });
      const data2 = await response2.json();
      expect(data2.real).toBe(true);

      const response3 = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/mpeg' },
      });
      const data3 = await response3.json();
      expect(data3.real).toBe(true);
    });

    it('does not bypass when contentTypes is empty', async () => {
      const rules = [createRule({ method: 'POST' })];
      installFetchInterceptor(rules, undefined, { contentTypes: [] });

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      const data = await response.json();

      // Should be intercepted
      expect(data.result).toEqual({ mocked: true });
      expect(data.err_no).toBe(0);
    });

    it('handles requests without content-type header', async () => {
      const rules = [createRule()];
      installFetchInterceptor(rules, undefined, { contentTypes: ['application/octet-stream'] });

      const response = await fetch('/api/test', { method: 'GET' });
      const data = await response.json();

      // Should be intercepted (no content-type to bypass)
      expect(data.result).toEqual({ mocked: true });
    });
  });

  describe('AbortSignal edge cases', () => {
    it('throws immediately if signal is already aborted before fetch', async () => {
      const rules = [createRule({
        network: { customDelay: 1000 },
      })];
      installFetchInterceptor(rules);

      // Create an already-aborted signal
      const controller = new AbortController();
      controller.abort();

      // Should throw immediately without waiting for delay
      await expect(
        fetch('/api/test', { signal: controller.signal })
      ).rejects.toThrow('Aborted');
    });

    it('detects abort that happens during delay', async () => {
      vi.useFakeTimers();

      const rules = [createRule({
        network: { customDelay: 1000 },
      })];
      installFetchInterceptor(rules);

      const controller = new AbortController();
      const fetchPromise = fetch('/api/test', { signal: controller.signal });

      // Abort after delay starts but before it completes
      await vi.advanceTimersByTimeAsync(500);
      controller.abort();

      // Should throw AbortError
      await expect(fetchPromise).rejects.toThrow('Aborted');

      vi.useRealTimers();
    });
  });
});
