# Error Mock Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a frontend mock plugin that simulates network errors, business errors, and field omissions to test frontend robustness.

**Architecture:** Monorepo with 5 packages (core, parser, ui, webpack-plugin, vite-plugin). Core intercepts XHR/Fetch requests and applies mock rules. UI built with Svelte + Tailwind. Build plugins inject runtime code in development mode only.

**Tech Stack:** TypeScript, Svelte, Tailwind CSS, Vitest, Playwright, pnpm monorepo

**Review Status:** ✅ Reviewed by Codex and Gemini - all fixes integrated

---

## Phase 1: Project Setup

### Task 1.1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `tsconfig.base.json`
- Create: `.npmrc`

**Step 1: Create root package.json**

```json
{
  "name": "error-mock-plugin",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint packages --ext .ts,.svelte",
    "clean": "pnpm -r clean"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'examples/*'
```

**Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

**Step 4: Create tsconfig.json**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@error-mock/core": ["packages/core/src"],
      "@error-mock/parser": ["packages/parser/src"],
      "@error-mock/ui": ["packages/ui/src"]
    }
  },
  "references": [
    { "path": "packages/core" },
    { "path": "packages/parser" },
    { "path": "packages/ui" },
    { "path": "packages/webpack-plugin" },
    { "path": "packages/vite-plugin" }
  ]
}
```

**Step 5: Create .npmrc**

```
shamefully-hoist=true
strict-peer-dependencies=false
```

**Step 6: Install dependencies**

Run: `pnpm install`
Expected: Dependencies installed successfully

**Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json tsconfig.base.json .npmrc pnpm-lock.yaml
git commit -m "chore: initialize monorepo structure"
```

---

### Task 1.2: Create Core Package Structure

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/types.ts`

**Step 1: Create packages/core/package.json**

```json
{
  "name": "@error-mock/core",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "path-to-regexp": "^6.2.1"
  },
  "devDependencies": {
    "tsup": "^8.0.0"
  }
}
```

**Step 2: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create packages/core/src/types.ts**

```typescript
export interface NetworkConfig {
  delay: number;
  timeout: boolean;
  offline: boolean;
  failRate: number;
}

export interface BusinessConfig {
  errNo: number;
  errMsg: string;
  detailErrMsg: string;
}

export interface FieldOmitConfig {
  enabled: boolean;
  mode: 'manual' | 'random';
  fields: string[];
  random: {
    probability: number;
    maxOmitCount: number;
    excludeFields: string[];
    depthLimit: number;
    omitMode: 'delete' | 'undefined' | 'null';
    seed?: number;
  };
}

export interface MockRule {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  enabled: boolean;
  mockType: 'none' | 'success' | 'businessError' | 'networkError';
  network: NetworkConfig;
  business: BusinessConfig;
  response: {
    useDefault: boolean;
    customResult: unknown;
  };
  fieldOmit: FieldOmitConfig;
}

export interface ApiMeta {
  module: string;
  name: string;
  url: string;
  method: string;
  requestType?: string;
  responseType?: string;
}

export interface ApiResponse<T = unknown> {
  err_no: number;
  err_msg: string;
  detail_err_msg: string;
  result: T;
  sync: boolean;
  time_stamp: number;
  time_zone_ID: string;
  time_zone_offset: number;
  trace_id: string;
}

export interface GlobalConfig {
  enabled: boolean;
  defaultDelay: number;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'dark' | 'light' | 'system';
  keyboardShortcuts: boolean;
}

export interface BypassConfig {
  origins: string[];
  methods: string[];
  contentTypes: string[];
  urlPatterns: RegExp[];
}
```

**Step 4: Create packages/core/src/index.ts**

```typescript
export * from './types';
```

**Step 5: Install core dependencies**

Run: `cd packages/core && pnpm install`
Expected: Dependencies installed

**Step 6: Build to verify**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds, dist/ created

**Step 7: Commit**

```bash
git add packages/core
git commit -m "chore: add core package structure with types"
```

---

## Phase 2: Core - URL Matcher (with path-to-regexp)

> **Review Fix (Codex):** Use path-to-regexp instead of hand-written matching for robust URL parameter support.

### Task 2.1: Implement URL Matcher

**Files:**
- Create: `packages/core/src/engine/matcher.ts`
- Create: `packages/core/src/__tests__/matcher.test.ts`

**Step 1: Write failing test for exact match**

```typescript
// packages/core/src/__tests__/matcher.test.ts
import { describe, it, expect } from 'vitest';
import { matchUrl, matchRule } from '../engine/matcher';

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
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: FAIL with "matchUrl is not defined"

**Step 3: Implement matchUrl with path-to-regexp**

```typescript
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
        path === pattern ? { path, params: {} } : false
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
```

**Step 4: Run tests**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: All tests PASS

**Step 5: Add rule matcher tests**

```typescript
// Add to packages/core/src/__tests__/matcher.test.ts
import type { MockRule } from '../types';

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
```

**Step 6: Run all tests**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add packages/core/src/engine/matcher.ts packages/core/src/__tests__/matcher.test.ts
git commit -m "feat(core): add URL matcher with path-to-regexp support"
```

---

## Phase 3: Core - Response Generator

### Task 3.1: Implement Response Generators

**Files:**
- Create: `packages/core/src/engine/response.ts`
- Create: `packages/core/src/__tests__/response.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/core/src/__tests__/response.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSuccessResponse, generateBusinessErrorResponse } from '../engine/response';

describe('generateSuccessResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates response with custom result', () => {
    const result = { id: 1, name: 'test' };
    const response = generateSuccessResponse(result);

    expect(response.err_no).toBe(0);
    expect(response.err_msg).toBe('');
    expect(response.detail_err_msg).toBe('');
    expect(response.result).toEqual(result);
    expect(response.sync).toBe(true);
    expect(response.time_stamp).toBe(1735689600000);
    expect(response.time_zone_ID).toBe('Asia/Shanghai');
    expect(response.time_zone_offset).toBe(-480);
    expect(typeof response.trace_id).toBe('string');
    expect(response.trace_id).toMatch(/^\[[\da-f]+\]$/);
  });

  it('generates response with null result', () => {
    const response = generateSuccessResponse(null);
    expect(response.result).toBeNull();
  });

  it('generates response with array result', () => {
    const result = [{ id: 1 }, { id: 2 }];
    const response = generateSuccessResponse(result);
    expect(response.result).toEqual(result);
  });
});

describe('generateBusinessErrorResponse', () => {
  it('generates response with business error', () => {
    const response = generateBusinessErrorResponse({
      errNo: 10001,
      errMsg: 'Token expired',
      detailErrMsg: 'Please login again',
    });

    expect(response.err_no).toBe(10001);
    expect(response.err_msg).toBe('Token expired');
    expect(response.detail_err_msg).toBe('Please login again');
    expect(response.result).toBeNull();
    expect(response.sync).toBe(true);
  });

  it('generates response with empty error message', () => {
    const response = generateBusinessErrorResponse({
      errNo: 500,
      errMsg: '',
      detailErrMsg: '',
    });

    expect(response.err_no).toBe(500);
    expect(response.err_msg).toBe('');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/response.test.ts`
Expected: FAIL

**Step 3: Implement response generators**

```typescript
// packages/core/src/engine/response.ts
import type { ApiResponse, BusinessConfig } from '../types';

function generateTraceId(): string {
  const hex = Math.random().toString(16).slice(2, 12).padStart(10, '0');
  return `[${hex}]`;
}

function createBaseResponse<T>(result: T): ApiResponse<T> {
  return {
    err_no: 0,
    err_msg: '',
    detail_err_msg: '',
    result,
    sync: true,
    time_stamp: Date.now(),
    time_zone_ID: 'Asia/Shanghai',
    time_zone_offset: -480,
    trace_id: generateTraceId(),
  };
}

export function generateSuccessResponse<T>(result: T): ApiResponse<T> {
  return createBaseResponse(result);
}

export function generateBusinessErrorResponse(
  config: BusinessConfig
): ApiResponse<null> {
  return {
    ...createBaseResponse(null),
    err_no: config.errNo,
    err_msg: config.errMsg,
    detail_err_msg: config.detailErrMsg,
  };
}
```

**Step 4: Run tests**

Run: `pnpm vitest run packages/core/src/__tests__/response.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/response.ts packages/core/src/__tests__/response.test.ts
git commit -m "feat(core): add response generators"
```

---

## Phase 4: Core - Field Omission (with mulberry32 RNG)

> **Review Fix (Codex):** Use mulberry32 for deterministic seeded random, add structuredClone fallback, proper depth limiting.

### Task 4.1: Implement Field Omission

**Files:**
- Create: `packages/core/src/engine/field-omit.ts`
- Create: `packages/core/src/__tests__/field-omit.test.ts`

**Step 1: Write comprehensive tests**

```typescript
// packages/core/src/__tests__/field-omit.test.ts
import { describe, it, expect } from 'vitest';
import { omitFields } from '../engine/field-omit';
import type { FieldOmitConfig } from '../types';

const createConfig = (overrides: Partial<FieldOmitConfig> = {}): FieldOmitConfig => ({
  enabled: true,
  mode: 'manual',
  fields: [],
  random: {
    probability: 0,
    maxOmitCount: 0,
    excludeFields: [],
    depthLimit: 5,
    omitMode: 'delete',
  },
  ...overrides,
});

describe('omitFields - disabled', () => {
  it('returns original data when disabled', () => {
    const data = { name: 'test', age: 20 };
    const config = createConfig({ enabled: false, fields: ['age'] });
    const result = omitFields(data, config);
    expect(result).toEqual(data);
  });
});

describe('omitFields - manual mode', () => {
  it('deletes specified field', () => {
    const data = { name: 'test', age: 20 };
    const config = createConfig({ fields: ['age'] });
    const result = omitFields(data, config);

    expect(result).toEqual({ name: 'test' });
    expect('age' in result).toBe(false);
  });

  it('deletes nested field using dot notation', () => {
    const data = { user: { name: 'test', profile: { age: 20, city: 'NYC' } } };
    const config = createConfig({ fields: ['user.profile.age'] });
    const result = omitFields(data, config);

    expect(result.user.profile).toEqual({ city: 'NYC' });
    expect('age' in result.user.profile).toBe(false);
  });

  it('deletes multiple fields', () => {
    const data = { a: 1, b: 2, c: 3 };
    const config = createConfig({ fields: ['a', 'c'] });
    const result = omitFields(data, config);

    expect(result).toEqual({ b: 2 });
  });

  it('handles non-existent field path silently', () => {
    const data = { name: 'test' };
    const config = createConfig({ fields: ['nonexistent.path'] });
    const result = omitFields(data, config);

    expect(result).toEqual({ name: 'test' });
  });

  it('does not mutate original data', () => {
    const data = { name: 'test', age: 20 };
    const config = createConfig({ fields: ['age'] });
    omitFields(data, config);

    expect(data.age).toBe(20);
  });
});

describe('omitFields - random mode', () => {
  it('respects maxOmitCount', () => {
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    const remainingKeys = Object.keys(result);
    expect(remainingKeys.length).toBeGreaterThanOrEqual(3);
  });

  it('respects excludeFields', () => {
    const data = { err_no: 0, err_msg: '', result: { name: 'test' } };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 10,
        excludeFields: ['err_no', 'err_msg'],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    expect(result.err_no).toBe(0);
    expect(result.err_msg).toBe('');
  });

  it('respects depthLimit', () => {
    const data = {
      level1: {
        level2: {
          level3: {
            level4: { value: 'deep' }
          }
        }
      }
    };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 10,
        excludeFields: [],
        depthLimit: 2,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    // Fields deeper than depthLimit should not be touched
    expect(result.level1?.level2?.level3?.level4?.value).toBe('deep');
  });

  it('sets undefined when omitMode is undefined', () => {
    const data = { a: 1, b: 2 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 1,
        excludeFields: ['a'],
        depthLimit: 5,
        omitMode: 'undefined',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    expect(result.a).toBe(1);
    expect(result.b).toBeUndefined();
    expect('b' in result).toBe(true);
  });

  it('sets null when omitMode is null', () => {
    const data = { a: 1, b: 2 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 1,
        excludeFields: ['a'],
        depthLimit: 5,
        omitMode: 'null',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    expect(result.a).toBe(1);
    expect(result.b).toBeNull();
  });

  it('produces deterministic results with same seed', () => {
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 50,
        maxOmitCount: 3,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 42,
      },
    });

    const result1 = omitFields(structuredClone(data), config);
    const result2 = omitFields(structuredClone(data), config);

    expect(result1).toEqual(result2);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run packages/core/src/__tests__/field-omit.test.ts`
Expected: FAIL

**Step 3: Implement field omission with mulberry32**

```typescript
// packages/core/src/engine/field-omit.ts
import type { FieldOmitConfig } from '../types';

/**
 * Mulberry32 - High quality 32-bit seeded PRNG
 * Produces deterministic, evenly distributed random numbers
 */
function mulberry32(seed: number): () => number {
  return function() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Deep clone with structuredClone fallback for older environments
 */
function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  // Fallback for environments without structuredClone
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Collect all field paths in an object up to a certain depth
 */
function collectAllPaths(
  obj: unknown,
  prefix: string,
  depthLimit: number,
  currentDepth: number
): string[] {
  const paths: string[] = [];

  if (currentDepth >= depthLimit) return paths;
  if (obj === null || obj === undefined || typeof obj !== 'object') return paths;

  const entries = Array.isArray(obj)
    ? obj.map((v, i) => [String(i), v] as const)
    : Object.entries(obj as Record<string, unknown>);

  for (const [key, value] of entries) {
    const path = prefix ? `${prefix}.${key}` : key;
    paths.push(path);

    if (value && typeof value === 'object') {
      paths.push(...collectAllPaths(value, path, depthLimit, currentDepth + 1));
    }
  }

  return paths;
}

/**
 * Apply omission to a field by path
 */
function applyOmit(
  obj: unknown,
  path: string,
  mode: 'delete' | 'undefined' | 'null'
): void {
  const parts = path.split('.');
  let current = obj as Record<string, unknown>;

  // Navigate to parent
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      return; // Path doesn't exist, skip silently
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (current && typeof current === 'object' && lastPart in current) {
    switch (mode) {
      case 'delete':
        delete current[lastPart];
        break;
      case 'undefined':
        current[lastPart] = undefined;
        break;
      case 'null':
        current[lastPart] = null;
        break;
    }
  }
}

/**
 * Omit fields in manual mode
 */
function omitManual<T>(data: T, fields: string[]): T {
  for (const fieldPath of fields) {
    applyOmit(data, fieldPath, 'delete');
  }
  return data;
}

/**
 * Omit fields in random mode
 */
function omitRandom<T>(data: T, config: FieldOmitConfig['random']): T {
  const rng = config.seed !== undefined
    ? mulberry32(config.seed)
    : Math.random;

  const allPaths = collectAllPaths(data, '', config.depthLimit, 0);

  // Filter out protected fields and their children
  const eligiblePaths = allPaths.filter(path => {
    return !config.excludeFields.some(excluded =>
      path === excluded || path.startsWith(`${excluded}.`)
    );
  });

  // Shuffle for more even distribution
  const shuffled = [...eligiblePaths].sort(() => rng() - 0.5);

  // Select fields to omit based on probability
  let omitCount = 0;
  const toOmit: string[] = [];

  for (const path of shuffled) {
    if (omitCount >= config.maxOmitCount) break;
    if (rng() * 100 < config.probability) {
      toOmit.push(path);
      omitCount++;
    }
  }

  // Apply omissions
  for (const path of toOmit) {
    applyOmit(data, path, config.omitMode);
  }

  return data;
}

/**
 * Main entry point for field omission
 */
export function omitFields<T>(data: T, config: FieldOmitConfig): T {
  if (!config.enabled) {
    return data;
  }

  // Always deep clone to avoid mutating original
  const cloned = deepClone(data);

  if (config.mode === 'manual') {
    return omitManual(cloned, config.fields);
  }

  return omitRandom(cloned, config.random);
}
```

**Step 4: Run tests**

Run: `pnpm vitest run packages/core/src/__tests__/field-omit.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/field-omit.ts packages/core/src/__tests__/field-omit.test.ts
git commit -m "feat(core): add field omission with mulberry32 seeded RNG"
```

---

## Phase 5: Core - Fetch Interceptor (with AbortSignal support)

> **Review Fix (Codex):** Support Request objects, AbortSignal, proper error types (DOMException).

### Task 5.1: Implement Fetch Interceptor

**Files:**
- Create: `packages/core/src/interceptor/fetch.ts`
- Create: `packages/core/src/__tests__/fetch.test.ts`

**Step 1: Write comprehensive tests**

```typescript
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

    const request = new Request('/api/test');
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
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run packages/core/src/__tests__/fetch.test.ts`
Expected: FAIL

**Step 3: Implement fetch interceptor**

```typescript
// packages/core/src/interceptor/fetch.ts
import type { MockRule, BypassConfig } from '../types';
import { matchRule } from '../engine/matcher';
import { generateSuccessResponse, generateBusinessErrorResponse } from '../engine/response';
import { omitFields } from '../engine/field-omit';

let originalFetch: typeof fetch | null = null;
let currentRules: MockRule[] = [];
let bypassConfig: BypassConfig = {
  origins: [],
  methods: ['OPTIONS'],
  contentTypes: [],
  urlPatterns: [],
};

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
  if (bypass) {
    bypassConfig = { ...bypassConfig, ...bypass };
  }

  globalThis.fetch = async function(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Normalize to Request object for consistent handling
    const request = input instanceof Request
      ? input
      : new Request(input, init);

    const url = request.url;
    const method = request.method;

    // Check bypass
    if (shouldBypass(url, method)) {
      return originalFetch!.call(globalThis, request);
    }

    const rule = matchRule(currentRules, url, method);
    if (!rule || rule.mockType === 'none') {
      return originalFetch!.call(globalThis, request);
    }

    // Collect abort signals
    const signals: AbortSignal[] = [];
    if (request.signal) signals.push(request.signal);
    if (init?.signal) signals.push(init.signal);

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
    const urlObj = new URL(url, window.location.origin);
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

    const abortHandler = () => {
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
```

**Step 4: Run tests**

Run: `pnpm vitest run packages/core/src/__tests__/fetch.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/core/src/interceptor/fetch.ts packages/core/src/__tests__/fetch.test.ts
git commit -m "feat(core): add fetch interceptor with AbortSignal support"
```

---

## Phase 6: Core - XHR Interceptor (Complete Implementation)

> **Review Fix (Codex):** Full readyState transitions, responseType handling, headers, abort behavior.

### Task 6.1: Implement XHR Interceptor

**Files:**
- Create: `packages/core/src/interceptor/xhr.ts`
- Create: `packages/core/src/__tests__/xhr.test.ts`

**Step 1: Write comprehensive tests**

```typescript
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
});
```

**Step 2: Implement XHR interceptor**

```typescript
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

  OriginalXHR = window.XMLHttpRequest;
  currentRules = rules;
  if (bypass) {
    bypassConfig = { ...bypassConfig, ...bypass };
  }

  // @ts-expect-error - We're replacing XMLHttpRequest
  window.XMLHttpRequest = MockXMLHttpRequest;
}

export function uninstallXHRInterceptor(): void {
  if (OriginalXHR) {
    window.XMLHttpRequest = OriginalXHR;
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
}
```

**Step 3: Run tests**

Run: `pnpm vitest run packages/core/src/__tests__/xhr.test.ts`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add packages/core/src/interceptor/xhr.ts packages/core/src/__tests__/xhr.test.ts
git commit -m "feat(core): add XHR interceptor with full readyState support"
```

---

### Task 6.2: Create Unified Interceptor API

**Files:**
- Create: `packages/core/src/interceptor/index.ts`
- Update: `packages/core/src/index.ts`

**Step 1: Create unified interceptor**

```typescript
// packages/core/src/interceptor/index.ts
import type { MockRule, BypassConfig } from '../types';
import {
  installFetchInterceptor,
  uninstallFetchInterceptor,
  updateRules as updateFetchRules,
} from './fetch';
import {
  installXHRInterceptor,
  uninstallXHRInterceptor,
  updateRules as updateXHRRules,
} from './xhr';

export function install(rules: MockRule[], bypass?: Partial<BypassConfig>): void {
  installFetchInterceptor(rules, bypass);
  installXHRInterceptor(rules, bypass);
}

export function uninstall(): void {
  uninstallFetchInterceptor();
  uninstallXHRInterceptor();
}

export function updateRules(rules: MockRule[]): void {
  updateFetchRules(rules);
  updateXHRRules(rules);
}

export { installFetchInterceptor, uninstallFetchInterceptor } from './fetch';
export { installXHRInterceptor, uninstallXHRInterceptor } from './xhr';
```

**Step 2: Update main exports**

```typescript
// packages/core/src/index.ts
export * from './types';
export * from './engine/matcher';
export * from './engine/response';
export * from './engine/field-omit';
export * from './interceptor';
```

**Step 3: Build and verify**

Run: `cd packages/core && pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add packages/core/src/interceptor/index.ts packages/core/src/index.ts
git commit -m "feat(core): add unified interceptor API"
```

---

## Phase 7: Core - Storage Layer

### Task 7.1: Implement localStorage Storage

**Files:**
- Create: `packages/core/src/storage/local.ts`
- Create: `packages/core/src/__tests__/storage.test.ts`

**Step 1: Write tests**

```typescript
// packages/core/src/__tests__/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { RuleStorage } from '../storage/local';
import type { MockRule } from '../types';

describe('RuleStorage', () => {
  const storage = new RuleStorage('test-prefix');

  const createRule = (id: string): MockRule => ({
    id,
    url: `/api/${id}`,
    method: 'GET',
    enabled: true,
    mockType: 'success',
    network: { delay: 0, timeout: false, offline: false, failRate: 0 },
    business: { errNo: 0, errMsg: '', detailErrMsg: '' },
    response: { useDefault: true, customResult: null },
    fieldOmit: {
      enabled: false,
      mode: 'manual',
      fields: [],
      random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
    },
  });

  beforeEach(() => {
    storage.clear();
  });

  it('saves and retrieves rules', () => {
    const rules = [createRule('test1'), createRule('test2')];
    storage.saveRules(rules);

    const retrieved = storage.getRules();
    expect(retrieved).toEqual(rules);
  });

  it('updates single rule', () => {
    const rules = [createRule('test1')];
    storage.saveRules(rules);

    const updated = { ...rules[0], enabled: false };
    storage.updateRule(updated);

    const retrieved = storage.getRules();
    expect(retrieved[0].enabled).toBe(false);
  });

  it('returns empty array when no rules saved', () => {
    const retrieved = storage.getRules();
    expect(retrieved).toEqual([]);
  });

  it('exports and imports config', () => {
    const rules = [createRule('test1')];
    storage.saveRules(rules);
    storage.saveGlobalConfig({ enabled: false });

    const exported = storage.exportConfig();
    storage.clear();

    expect(storage.getRules()).toEqual([]);

    storage.importConfig(exported);
    expect(storage.getRules()).toEqual(rules);
    expect(storage.getGlobalConfig().enabled).toBe(false);
  });
});
```

**Step 2: Implement RuleStorage**

```typescript
// packages/core/src/storage/local.ts
import type { MockRule, GlobalConfig } from '../types';

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  enabled: true,
  defaultDelay: 0,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
};

export class RuleStorage {
  private prefix: string;

  constructor(prefix = 'error-mock') {
    this.prefix = prefix;
  }

  private get rulesKey(): string {
    return `${this.prefix}:rules`;
  }

  private get configKey(): string {
    return `${this.prefix}:config`;
  }

  saveRules(rules: MockRule[]): void {
    try {
      localStorage.setItem(this.rulesKey, JSON.stringify(rules));
    } catch (e) {
      console.error('[ErrorMock] Failed to save rules:', e);
    }
  }

  getRules(): MockRule[] {
    try {
      const data = localStorage.getItem(this.rulesKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[ErrorMock] Failed to read rules:', e);
      return [];
    }
  }

  updateRule(rule: MockRule): void {
    const rules = this.getRules();
    const index = rules.findIndex((r) => r.id === rule.id);
    if (index !== -1) {
      rules[index] = rule;
      this.saveRules(rules);
    }
  }

  clear(): void {
    localStorage.removeItem(this.rulesKey);
    localStorage.removeItem(this.configKey);
  }

  getGlobalConfig(): GlobalConfig {
    try {
      const data = localStorage.getItem(this.configKey);
      return data ? { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(data) } : DEFAULT_GLOBAL_CONFIG;
    } catch {
      return DEFAULT_GLOBAL_CONFIG;
    }
  }

  saveGlobalConfig(config: Partial<GlobalConfig>): void {
    try {
      const current = this.getGlobalConfig();
      localStorage.setItem(this.configKey, JSON.stringify({ ...current, ...config }));
    } catch (e) {
      console.error('[ErrorMock] Failed to save config:', e);
    }
  }

  exportConfig(): string {
    return JSON.stringify({
      rules: this.getRules(),
      config: this.getGlobalConfig(),
    }, null, 2);
  }

  importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.rules) this.saveRules(data.rules);
      if (data.config) this.saveGlobalConfig(data.config);
      return true;
    } catch {
      return false;
    }
  }
}
```

**Step 3: Update exports**

```typescript
// Update packages/core/src/index.ts
export * from './types';
export * from './engine/matcher';
export * from './engine/response';
export * from './engine/field-omit';
export * from './interceptor';
export * from './storage/local';
```

**Step 4: Run tests and commit**

Run: `pnpm vitest run packages/core/src/__tests__/storage.test.ts`
Expected: PASS

```bash
git add packages/core/src/storage packages/core/src/__tests__/storage.test.ts packages/core/src/index.ts
git commit -m "feat(core): add localStorage-based rule storage"
```

---

## Phase 8: Parser Package (with TypeScript AST)

> **Review Fix (Codex):** Use TypeScript AST instead of regex for robust parsing.

### Task 8.1: Create Parser Package

**Files:**
- Create: `packages/parser/package.json`
- Create: `packages/parser/tsconfig.json`
- Create: `packages/parser/src/types.ts`
- Create: `packages/parser/src/adapters/default.ts`
- Create: `packages/parser/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@error-mock/parser",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0"
  }
}
```

**Step 2: Create types.ts**

```typescript
// packages/parser/src/types.ts
export interface ApiMeta {
  module: string;
  name: string;
  url: string;
  method: string;
  requestType?: string;
  responseType?: string;
}

export interface ApiAdapter {
  parse(apiDir: string): ApiMeta[];
}

export interface ParserOptions {
  apiDir: string;
  adapter?: ApiAdapter;
}
```

**Step 3: Create default adapter with TypeScript AST**

```typescript
// packages/parser/src/adapters/default.ts
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import type { ApiMeta, ApiAdapter } from '../types';

/**
 * Parse a single API file using TypeScript AST
 */
export function parseApiFile(code: string, moduleName: string): ApiMeta[] {
  const sourceFile = ts.createSourceFile(
    'api.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const results: ApiMeta[] = [];
  const urlConstants = new Map<string, string>();

  // First pass: collect URL constants
  function collectUrlConstants(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) &&
            decl.name.text.endsWith('Url') &&
            decl.initializer) {
          if (ts.isStringLiteral(decl.initializer)) {
            urlConstants.set(decl.name.text, decl.initializer.text);
          } else if (ts.isNoSubstitutionTemplateLiteral(decl.initializer)) {
            urlConstants.set(decl.name.text, decl.initializer.text);
          }
        }
      }
    }
    ts.forEachChild(node, collectUrlConstants);
  }

  // Second pass: find createRequest calls
  function findCreateRequestCalls(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        if (!ts.isCallExpression(decl.initializer)) continue;

        const call = decl.initializer;
        const callExpr = call.expression;

        // Check if it's createRequest<...>(...)
        if (ts.isIdentifier(callExpr) && callExpr.text === 'createRequest') {
          const apiMeta = extractApiMeta(decl.name.text, call, sourceFile, urlConstants);
          if (apiMeta) {
            results.push({ ...apiMeta, module: moduleName });
          }
        }
      }
    }
    ts.forEachChild(node, findCreateRequestCalls);
  }

  ts.forEachChild(sourceFile, collectUrlConstants);
  ts.forEachChild(sourceFile, findCreateRequestCalls);

  return results;
}

function extractApiMeta(
  name: string,
  call: ts.CallExpression,
  sourceFile: ts.SourceFile,
  urlConstants: Map<string, string>
): Omit<ApiMeta, 'module'> | null {
  const typeArgs = call.typeArguments;
  const [arg] = call.arguments;

  if (!arg || !ts.isObjectLiteralExpression(arg)) return null;

  let url = '';
  let method = 'GET';

  for (const prop of arg.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;

    const propName = prop.name.text;

    if (propName === 'url') {
      if (ts.isStringLiteral(prop.initializer)) {
        url = prop.initializer.text;
      } else if (ts.isIdentifier(prop.initializer)) {
        url = urlConstants.get(prop.initializer.text) || '';
      }
    }

    if (propName === 'method') {
      if (ts.isStringLiteral(prop.initializer)) {
        method = prop.initializer.text.toUpperCase();
      }
    }
  }

  if (!url) return null;

  const responseType = typeArgs?.[0]?.getText(sourceFile) || 'unknown';
  const requestType = typeArgs?.[1]?.getText(sourceFile) || 'unknown';

  return { name, url, method, responseType, requestType };
}

/**
 * Create the default adapter that scans src/api directories
 */
export function createDefaultAdapter(): ApiAdapter {
  return {
    parse(apiDir: string): ApiMeta[] {
      const results: ApiMeta[] = [];

      if (!fs.existsSync(apiDir)) {
        console.warn(`[ErrorMock] API directory not found: ${apiDir}`);
        return results;
      }

      const modules = fs.readdirSync(apiDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const moduleName of modules) {
        const indexPath = path.join(apiDir, moduleName, 'index.ts');

        if (!fs.existsSync(indexPath)) {
          continue;
        }

        try {
          const code = fs.readFileSync(indexPath, 'utf-8');
          const apis = parseApiFile(code, moduleName);
          results.push(...apis);
        } catch (e) {
          console.warn(`[ErrorMock] Failed to parse ${indexPath}:`, e);
        }
      }

      return results;
    },
  };
}
```

**Step 4: Create tests**

```typescript
// packages/parser/src/__tests__/default-adapter.test.ts
import { describe, it, expect } from 'vitest';
import { parseApiFile } from '../adapters/default';

describe('parseApiFile', () => {
  it('extracts API metadata from createRequest pattern', () => {
    const code = `
      export const getUserUrl = '/api/user/info';
      export const getUser = createRequest<GetUserResponse, GetUserRequest>({
        url: getUserUrl,
      });

      export const updateUserUrl = '/api/user/update';
      export const updateUser = createRequest<UpdateUserResponse, UpdateUserRequest>({
        url: updateUserUrl,
        method: 'POST',
      });
    `;

    const result = parseApiFile(code, 'user');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      module: 'user',
      name: 'getUser',
      url: '/api/user/info',
      method: 'GET',
    });
    expect(result[1]).toMatchObject({
      module: 'user',
      name: 'updateUser',
      url: '/api/user/update',
      method: 'POST',
    });
  });

  it('handles inline URL strings', () => {
    const code = `
      export const getData = createRequest<DataResponse, DataRequest>({
        url: '/api/data',
        method: 'GET',
      });
    `;

    const result = parseApiFile(code, 'data');

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('/api/data');
  });

  it('handles multi-line object literals', () => {
    const code = `
      export const complexUrl = '/api/complex';
      export const complex = createRequest<
        ComplexResponse,
        ComplexRequest
      >({
        url: complexUrl,
        method: 'POST',
      });
    `;

    const result = parseApiFile(code, 'complex');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('complex');
  });

  it('returns empty array for invalid code', () => {
    const code = `
      const notAnExport = 'hello';
    `;

    const result = parseApiFile(code, 'test');

    expect(result).toHaveLength(0);
  });
});
```

**Step 5: Create index.ts**

```typescript
// packages/parser/src/index.ts
export * from './types';
export { parseApiFile, createDefaultAdapter } from './adapters/default';
```

**Step 6: Install, build, and test**

Run: `cd packages/parser && pnpm install && pnpm build`
Run: `pnpm vitest run packages/parser`
Expected: PASS

**Step 7: Commit**

```bash
git add packages/parser
git commit -m "feat(parser): add TypeScript AST-based API parser"
```

---

## Phase 9: UI Package (Svelte + Tailwind with fixes)

> **Review Fix (Gemini):** Strict em- prefix, improved drag detection, keyboard navigation, a11y, focus trap, toast notifications.

Due to the length of this document, the UI implementation details are provided in a separate section below with all Gemini review fixes applied.

### Task 9.1 - 9.8: UI Package Implementation

See `docs/plans/2025-12-09-ui-implementation.md` for detailed UI tasks with:
- FloatButton with distance-based drag detection
- Modal with focus trap
- ApiList with keyboard navigation
- RuleEditor split into sub-components
- BatchPanel with "Mixed" state handling
- Toast notification system
- All Tailwind classes with `em-` prefix

---

## Phase 10: Build Plugins

### Task 10.1: Webpack Plugin

See original implementation - no changes from review.

### Task 10.2: Vite Plugin

See original implementation - no changes from review.

---

## Phase 11: Testing & Coverage

### Task 11.1: Configure Vitest with 90% Coverage

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'packages/core/src/**/*.ts',
        'packages/parser/src/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/types.ts',
        '**/index.ts',
        '**/__tests__/**',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
```

---

## Review Fixes Summary

| # | Issue | Fix Applied |
|---|-------|-------------|
| 1 | API Parser regex fragile | ✅ TypeScript AST |
| 2 | XHR Mock incomplete | ✅ Full readyState, responseType, headers |
| 3 | Fetch no AbortSignal | ✅ AbortSignal support |
| 4 | Bad RNG | ✅ mulberry32 |
| 5 | structuredClone compat | ✅ Fallback added |
| 6 | URL matcher basic | ✅ path-to-regexp |
| 7 | Tailwind prefix missing | ✅ All em- prefixes |
| 8 | Drag detection flawed | ✅ Distance threshold |
| 9 | No keyboard nav | ✅ Arrow keys, Space |
| 10 | No a11y | ✅ aria-labels, focus trap |
| 11 | No batch "Mixed" state | ✅ batchState store |
| 12 | No toast | ✅ Toast component |

---

## Final Checklist

- [ ] All packages build successfully
- [ ] All tests pass with 90%+ coverage
- [ ] Vite example runs correctly
- [ ] umi3 example runs correctly
- [ ] UI displays correctly with em- prefixed styles
- [ ] Keyboard navigation works
- [ ] Mock rules persist in localStorage
- [ ] Field omission works in both modes
- [ ] Network errors simulate correctly
