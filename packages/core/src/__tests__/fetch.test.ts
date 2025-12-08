// packages/core/src/__tests__/fetch.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  installFetchInterceptor,
  uninstallFetchInterceptor,
  updateRules
} from '../interceptor/fetch';
import type { MockRule } from '../types';

describe('FetchInterceptor', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ real: true }), { status: 200 })
    );
  });

  afterEach(() => {
    uninstallFetchInterceptor();
    globalThis.fetch = originalFetch;
  });

  const createRule = (overrides: Partial<MockRule> = {}): MockRule => ({
    id: 'test',
    url: '/api/test',
    method: 'GET',
    enabled: true,
    mockType: 'success',
    network: { delay: 0, timeout: false, offline: false, failRate: 0 },
    business: { errNo: 0, errMsg: '', detailErrMsg: '' },
    response: { useDefault: false, customResult: { mocked: true } },
    fieldOmit: {
      enabled: false,
      mode: 'manual',
      fields: [],
      random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
    },
    ...overrides,
  });

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
      mockType: 'businessError',
      business: { errNo: 10001, errMsg: 'Token expired', detailErrMsg: 'Please login' },
    })];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(data.err_no).toBe(10001);
    expect(data.err_msg).toBe('Token expired');
  });

  it('throws TypeError for offline simulation', async () => {
    const rules = [createRule({
      network: { delay: 0, timeout: false, offline: true, failRate: 0 },
    })];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(TypeError);
  });

  it('throws DOMException for timeout simulation', async () => {
    const rules = [createRule({
      network: { delay: 0, timeout: true, offline: false, failRate: 0 },
    })];
    installFetchInterceptor(rules);

    await expect(fetch('/api/test')).rejects.toThrow(DOMException);
  });

  it('respects AbortSignal', async () => {
    const rules = [createRule({
      network: { delay: 1000, timeout: false, offline: false, failRate: 0 },
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

    const rules = [createRule({
      network: { delay: 500, timeout: false, offline: false, failRate: 0 },
    })];
    installFetchInterceptor(rules);

    const fetchPromise = fetch('/api/test');

    // Should not resolve immediately
    await vi.advanceTimersByTimeAsync(100);

    // Advance past delay
    await vi.advanceTimersByTimeAsync(500);

    const response = await fetchPromise;
    expect(response.status).toBe(200);

    vi.useRealTimers();
  });

  it('updates rules dynamically', async () => {
    const rules = [createRule({ response: { useDefault: false, customResult: { v: 1 } } })];
    installFetchInterceptor(rules);

    let response = await fetch('/api/test');
    let data = await response.json();
    expect(data.result.v).toBe(1);

    // Update rules
    updateRules([createRule({ response: { useDefault: false, customResult: { v: 2 } } })]);

    response = await fetch('/api/test');
    data = await response.json();
    expect(data.result.v).toBe(2);
  });

  it('bypasses OPTIONS requests by default', async () => {
    const rules = [createRule({ method: 'GET' })];
    installFetchInterceptor(rules);

    const response = await fetch('/api/test', { method: 'OPTIONS' });
    const data = await response.json();

    // Should pass through to real fetch
    expect(data.real).toBe(true);
  });
});
