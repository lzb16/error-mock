// packages/core/src/engine/matcher.ts
import { match, type MatchFunction } from 'path-to-regexp';
import type { MockRule } from '../types';

// Cache compiled matchers for performance
const matcherCache = new Map<string, MatchFunction<Record<string, string>>>();

function getMatcher(pattern: string): MatchFunction<Record<string, string>> {
  if (!matcherCache.has(pattern)) {
    try {
      matcherCache.set(pattern, match(pattern, {
        decode: decodeURIComponent,
        strict: false,
        end: true,
      }));
    } catch {
      // Invalid pattern, create a simple exact matcher
      matcherCache.set(pattern, (path: string) =>
        path === pattern ? { path, index: 0, params: {} } : false
      );
    }
  }
  return matcherCache.get(pattern)!;
}

function normalizeUrl(url: string): string {
  // Remove query string
  const [pathname] = url.split('?');
  // Remove trailing slash (except for root)
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
}

export function matchUrl(requestUrl: string, ruleUrl: string): boolean {
  const normalizedRequest = normalizeUrl(requestUrl);
  const normalizedRule = normalizeUrl(ruleUrl);

  // Fast path: exact match
  if (normalizedRequest === normalizedRule) {
    return true;
  }

  // Use path-to-regexp for parameter matching
  const matcher = getMatcher(normalizedRule);
  return !!matcher(normalizedRequest);
}

export function matchRule(
  rules: MockRule[],
  requestUrl: string,
  requestMethod: string
): MockRule | null {
  for (const rule of rules) {
    if (!rule.enabled) {
      continue;
    }

    if (rule.method.toUpperCase() !== requestMethod.toUpperCase()) {
      continue;
    }

    if (matchUrl(requestUrl, rule.url)) {
      return rule;
    }
  }

  return null;
}

// Clear cache (useful for testing)
export function clearMatcherCache(): void {
  matcherCache.clear();
}
