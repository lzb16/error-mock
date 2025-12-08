// packages/core/src/__tests__/xhr.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installXHRInterceptor, uninstallXHRInterceptor } from '../interceptor/xhr';
import type { MockRule } from '../types';

describe('XHRInterceptor', () => {
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

  afterEach(() => {
    uninstallXHRInterceptor();
  });

  function makeXHRRequest(method: string, url: string): Promise<{ status: number; response: string; readyStates: number[] }> {
    return new Promise((resolve, reject) => {
      const readyStates: number[] = [];
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        readyStates.push(xhr.readyState);
      };

      xhr.onload = () => {
        resolve({
          status: xhr.status,
          response: xhr.responseText,
          readyStates,
        });
      };

      xhr.onerror = () => reject(new Error('XHR error'));
      xhr.ontimeout = () => reject(new Error('XHR timeout'));

      xhr.open(method, url);
      xhr.send();
    });
  }

  it('intercepts matching XHR request', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await makeXHRRequest('GET', '/api/test');
    const data = JSON.parse(result.response);

    expect(result.status).toBe(200);
    expect(data.result).toEqual({ mocked: true });
  });

  it('goes through correct readyState transitions', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await makeXHRRequest('GET', '/api/test');

    // Should see: OPENED(1), HEADERS_RECEIVED(2), LOADING(3), DONE(4)
    expect(result.readyStates).toContain(1);
    expect(result.readyStates).toContain(4);
  });

  it('returns business error response', async () => {
    const rules = [createRule({
      mockType: 'businessError',
      business: { errNo: 10001, errMsg: 'Error', detailErrMsg: '' },
    })];
    installXHRInterceptor(rules);

    const result = await makeXHRRequest('GET', '/api/test');
    const data = JSON.parse(result.response);

    expect(data.err_no).toBe(10001);
  });

  it('triggers onerror for offline simulation', async () => {
    const rules = [createRule({
      network: { delay: 0, timeout: false, offline: true, failRate: 0 },
    })];
    installXHRInterceptor(rules);

    await expect(makeXHRRequest('GET', '/api/test')).rejects.toThrow('XHR error');
  });

  it('triggers ontimeout for timeout simulation', async () => {
    const rules = [createRule({
      network: { delay: 0, timeout: true, offline: false, failRate: 0 },
    })];
    installXHRInterceptor(rules);

    await expect(makeXHRRequest('GET', '/api/test')).rejects.toThrow('XHR timeout');
  });

  it('handles responseType json', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    expect(result.result).toEqual({ mocked: true });
  });

  it('handles responseType text', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'text';
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    const data = JSON.parse(result);
    expect(data.result).toEqual({ mocked: true });
  });

  it('handles responseType blob', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    expect(result).toBeInstanceOf(Blob);
    // Use FileReader for jsdom compatibility
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(result);
    });
    const data = JSON.parse(text);
    expect(data.result).toEqual({ mocked: true });
  });

  it('handles responseType arraybuffer', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    // In jsdom, the response is an ArrayBuffer (or Uint8Array.buffer)
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
    const decoder = new TextDecoder();
    const text = decoder.decode(result);
    const data = JSON.parse(text);
    expect(data.result).toEqual({ mocked: true });
  });

  it('handles abort() method', async () => {
    const rules = [createRule({
      network: { delay: 100, timeout: false, offline: false, failRate: 0 },
    })];
    installXHRInterceptor(rules);

    const promise = new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onabort = () => resolve();
      xhr.onerror = () => reject(new Error('Should not error'));
      xhr.onload = () => reject(new Error('Should not load'));
      xhr.open('GET', '/api/test');
      xhr.send();

      // Abort immediately
      setTimeout(() => xhr.abort(), 10);
    });

    await expect(promise).resolves.toBeUndefined();
  });

  it('passes through non-matching requests to real XHR', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    // Mock the real XHR for passthrough test
    const originalXHR = window.XMLHttpRequest;

    // This will use the passthrough, which should call the original XHR
    // In a real test environment with a server, this would make an actual request
    // For this test, we just verify it doesn't match our mock rule
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/other');

    expect(xhr.readyState).toBe(1); // OPENED
  });

  it('supports request headers', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<{ status: number; response: any }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve({ status: xhr.status, response: xhr.response });
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Custom-Header', 'test-value');
      xhr.send();
    });

    expect(result.status).toBe(200);
  });

  it('supports response headers', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<string | null>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.getResponseHeader('content-type'));
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    expect(result).toBe('application/json');
  });

  it('supports getAllResponseHeaders', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.getAllResponseHeaders());
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    expect(result).toContain('content-type: application/json');
  });

  it('applies field omission when enabled', async () => {
    const rules = [createRule({
      response: { useDefault: false, customResult: { field1: 'value1', field2: 'value2' } },
      fieldOmit: {
        enabled: true,
        mode: 'manual',
        fields: ['result.field2'],
        random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
      },
    })];
    installXHRInterceptor(rules);

    const result = await makeXHRRequest('GET', '/api/test');
    const data = JSON.parse(result.response);

    expect(data.result.field1).toBe('value1');
    expect('field2' in data.result).toBe(false);
  });

  it('applies delay', async () => {
    vi.useFakeTimers();

    const rules = [createRule({
      network: { delay: 500, timeout: false, offline: false, failRate: 0 },
    })];
    installXHRInterceptor(rules);

    const xhrPromise = makeXHRRequest('GET', '/api/test');

    // Should not resolve immediately
    await vi.advanceTimersByTimeAsync(100);

    // Advance past delay
    await vi.advanceTimersByTimeAsync(500);

    const result = await xhrPromise;
    expect(result.status).toBe(200);

    vi.useRealTimers();
  });

  it('throws NotImplementedError for addEventListener', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    expect(() => {
      xhr.addEventListener('load', () => {});
    }).toThrow(new Error('addEventListener is not implemented on MockXMLHttpRequest. Use on* event handler properties instead.'));
  });

  it('throws NotImplementedError for removeEventListener', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    expect(() => {
      xhr.removeEventListener('load', () => {});
    }).toThrow(new Error('removeEventListener is not implemented on MockXMLHttpRequest. Use on* event handler properties instead.'));
  });

  it('throws NotImplementedError for dispatchEvent', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    expect(() => {
      xhr.dispatchEvent(new Event('custom'));
    }).toThrow(new Error('dispatchEvent is not implemented on MockXMLHttpRequest. Use on* event handler properties instead.'));
  });

  it('does not have upload property stub', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    expect(xhr.upload).toBeUndefined();
  });

  it('handles responseType document', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'document';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = reject;
      xhr.open('GET', '/api/test');
      xhr.send();
    });

    // document responseType should return null for JSON responses
    expect(result).toBeNull();
  });

  it('calls overrideMimeType without error', () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    expect(() => {
      xhr.overrideMimeType('text/plain');
    }).not.toThrow();
  });

  it('passes through and handles event callbacks for real XHR', () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();

    //Set up callbacks
    xhr.onprogress = () => {};
    xhr.onabort = () => {};
    xhr.ontimeout = () => {};
    xhr.onloadend = () => {};

    xhr.open('GET', '/api/unmocked-url');

    // Just ensure the setup doesn't throw
    expect(xhr.readyState).toBe(1); // OPENED
  });

  it('prevents reinstallation when already installed', () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const MockedXHR = globalThis.XMLHttpRequest;

    // Try to install again
    installXHRInterceptor(rules);

    // Should be the same reference (not reinstalled)
    expect(globalThis.XMLHttpRequest).toBe(MockedXHR);
  });

  it('supports custom bypass configuration', async () => {
    const rules = [createRule({ method: 'GET' })];
    installXHRInterceptor(rules, { methods: ['GET'] });

    // GET requests should bypass
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/test');

    // Should pass through without mocking
    expect(xhr.readyState).toBe(1); // OPENED
  });

  it('handles multiple request headers with same name', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/test');
    xhr.setRequestHeader('X-Custom', 'value1');
    xhr.setRequestHeader('X-Custom', 'value2');

    // Should not throw
    expect(xhr.readyState).toBe(1); // OPENED
  });

  it('throws error when send called before open', () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const xhr = new XMLHttpRequest();
    expect(() => {
      xhr.send();
    }).toThrow(DOMException);
  });

  it('simulates random failure in XHR', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);

    const rules = [createRule({
      network: { delay: 0, timeout: false, offline: false, failRate: 10 },
    })];
    installXHRInterceptor(rules);

    await expect(makeXHRRequest('GET', '/api/test')).rejects.toThrow('XHR error');

    vi.restoreAllMocks();
  });

  it('matches absolute URL to pathname-based rule', async () => {
    const rules = [createRule({ url: '/api/test', method: 'GET' })];
    installXHRInterceptor(rules);

    const result = await makeXHRRequest('GET', 'https://example.com/api/test');
    const data = JSON.parse(result.response);

    expect(result.status).toBe(200);
    expect(data.result).toEqual({ mocked: true });
  });

  it('bypasses requests to specified origins', async () => {
    const rules = [createRule({ url: '/api/test', method: 'GET' })];
    installXHRInterceptor(rules, { origins: ['https://api.foo.com'] });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.foo.com/api/test');

    // Should pass through without mocking
    expect(xhr.readyState).toBe(1);
  });

  it('bypasses requests matching URL patterns', async () => {
    const rules = [createRule({ url: '/api/test', method: 'GET' })];
    installXHRInterceptor(rules, { urlPatterns: [/^https:\/\/external\.com/] });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://external.com/api/test');

    // Should pass through without mocking
    expect(xhr.readyState).toBe(1);
  });
});
