// packages/core/src/__tests__/matcher.test.ts
import { describe, it, expect } from 'vitest';
import { matchUrl, matchRule } from '../engine/matcher';
import type { MockRule } from '../types';

describe('matchUrl', () => {
  describe('exact match', () => {
    it('matches exact URL', () => {
      expect(matchUrl('/api/user/login', '/api/user/login')).toBe(true);
    });

    it('does not match different URL', () => {
      expect(matchUrl('/api/user/login', '/api/user/logout')).toBe(false);
    });
  });

  describe('path parameters', () => {
    it('matches URL with single path parameter', () => {
      expect(matchUrl('/api/user/123', '/api/user/:id')).toBe(true);
    });

    it('matches URL with multiple path parameters', () => {
      expect(matchUrl('/api/user/123/posts/456', '/api/user/:userId/posts/:postId')).toBe(true);
    });

    it('does not match when segment count differs', () => {
      expect(matchUrl('/api/user/123/extra', '/api/user/:id')).toBe(false);
    });

    it('matches with encoded parameters', () => {
      expect(matchUrl('/api/search/hello%20world', '/api/search/:query')).toBe(true);
    });
  });

  describe('query parameters', () => {
    it('ignores query parameters in request', () => {
      expect(matchUrl('/api/search?keyword=test&page=1', '/api/search')).toBe(true);
    });
  });

  describe('trailing slashes', () => {
    it('matches with trailing slash in request', () => {
      expect(matchUrl('/api/user/', '/api/user')).toBe(true);
    });

    it('matches with trailing slash in pattern', () => {
      expect(matchUrl('/api/user', '/api/user/')).toBe(true);
    });
  });
});

describe('matchRule', () => {
  const createRule = (overrides: Partial<MockRule> = {}): MockRule => ({
    id: 'test-rule',
    url: '/api/user/login',
    method: 'POST',
    enabled: true,
    mockType: 'success',
    network: { delay: 0, timeout: false, offline: false, failRate: 0 },
    business: { errNo: 0, errMsg: '', detailErrMsg: '' },
    response: { useDefault: true, customResult: null },
    fieldOmit: {
      enabled: false,
      mode: 'manual',
      fields: [],
      random: {
        probability: 0,
        maxOmitCount: 0,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
      },
    },
    ...overrides,
  });

  it('matches rule by URL and method', () => {
    const rules = [createRule()];
    const result = matchRule(rules, '/api/user/login', 'POST');
    expect(result).toEqual(rules[0]);
  });

  it('returns null when no match', () => {
    const rules = [createRule()];
    const result = matchRule(rules, '/api/user/logout', 'POST');
    expect(result).toBeNull();
  });

  it('returns null when method does not match', () => {
    const rules = [createRule()];
    const result = matchRule(rules, '/api/user/login', 'GET');
    expect(result).toBeNull();
  });

  it('skips disabled rules', () => {
    const rules = [createRule({ enabled: false })];
    const result = matchRule(rules, '/api/user/login', 'POST');
    expect(result).toBeNull();
  });

  it('matches first matching rule', () => {
    const rules = [
      createRule({ id: 'first', url: '/api/user/:id' }),
      createRule({ id: 'second', url: '/api/user/123' }),
    ];
    const result = matchRule(rules, '/api/user/123', 'POST');
    expect(result?.id).toBe('first');
  });
});
