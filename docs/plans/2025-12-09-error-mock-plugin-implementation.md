# Error Mock Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a frontend mock plugin that simulates network errors, business errors, and field omissions to test frontend robustness.

**Architecture:** Monorepo with 5 packages (core, parser, ui, webpack-plugin, vite-plugin). Core intercepts XHR/Fetch requests and applies mock rules. UI built with Svelte + Tailwind. Build plugins inject runtime code in development mode only.

**Tech Stack:** TypeScript, Svelte, Tailwind CSS, Vitest, Playwright, pnpm monorepo

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

## Phase 2: Core - Rule Matcher

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
  it('matches exact URL', () => {
    expect(matchUrl('/api/user/login', '/api/user/login')).toBe(true);
  });

  it('does not match different URL', () => {
    expect(matchUrl('/api/user/login', '/api/user/logout')).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: FAIL with "matchUrl is not defined"

**Step 3: Write minimal implementation**

```typescript
// packages/core/src/engine/matcher.ts
export function matchUrl(requestUrl: string, ruleUrl: string): boolean {
  const normalizedRequest = requestUrl.split('?')[0];
  const normalizedRule = ruleUrl.split('?')[0];

  if (normalizedRequest === normalizedRule) {
    return true;
  }

  return matchWithParams(normalizedRequest, normalizedRule);
}

function matchWithParams(requestUrl: string, ruleUrl: string): boolean {
  const requestParts = requestUrl.split('/');
  const ruleParts = ruleUrl.split('/');

  if (requestParts.length !== ruleParts.length) {
    return false;
  }

  return ruleParts.every((part, i) => {
    if (part.startsWith(':')) {
      return true;
    }
    return part === requestParts[i];
  });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: PASS

**Step 5: Add more test cases**

```typescript
// Add to packages/core/src/__tests__/matcher.test.ts
describe('matchUrl with path params', () => {
  it('matches URL with path parameter', () => {
    expect(matchUrl('/api/user/123', '/api/user/:id')).toBe(true);
  });

  it('matches URL with multiple path parameters', () => {
    expect(matchUrl('/api/user/123/posts/456', '/api/user/:userId/posts/:postId')).toBe(true);
  });

  it('does not match when segment count differs', () => {
    expect(matchUrl('/api/user/123/extra', '/api/user/:id')).toBe(false);
  });
});

describe('matchUrl with query params', () => {
  it('ignores query parameters in request', () => {
    expect(matchUrl('/api/search?keyword=test', '/api/search')).toBe(true);
  });
});
```

**Step 6: Run all tests**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add packages/core/src/engine/matcher.ts packages/core/src/__tests__/matcher.test.ts
git commit -m "feat(core): add URL matcher with path param support"
```

---

### Task 2.2: Implement Rule Matcher

**Files:**
- Modify: `packages/core/src/engine/matcher.ts`
- Modify: `packages/core/src/__tests__/matcher.test.ts`

**Step 1: Write failing test for rule matching**

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
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: FAIL with "matchRule is not defined" or test failures

**Step 3: Implement matchRule**

```typescript
// Add to packages/core/src/engine/matcher.ts
import type { MockRule } from '../types';

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
```

**Step 4: Run tests**

Run: `pnpm vitest run packages/core/src/__tests__/matcher.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/matcher.ts packages/core/src/__tests__/matcher.test.ts
git commit -m "feat(core): add rule matcher"
```

---

## Phase 3: Core - Response Generator

### Task 3.1: Implement Success Response Generator

**Files:**
- Create: `packages/core/src/engine/response.ts`
- Create: `packages/core/src/__tests__/response.test.ts`

**Step 1: Write failing test**

```typescript
// packages/core/src/__tests__/response.test.ts
import { describe, it, expect } from 'vitest';
import { generateSuccessResponse } from '../engine/response';

describe('generateSuccessResponse', () => {
  it('generates response with custom result', () => {
    const result = { id: 1, name: 'test' };
    const response = generateSuccessResponse(result);

    expect(response.err_no).toBe(0);
    expect(response.err_msg).toBe('');
    expect(response.detail_err_msg).toBe('');
    expect(response.result).toEqual(result);
    expect(response.sync).toBe(true);
    expect(typeof response.time_stamp).toBe('number');
    expect(response.time_zone_ID).toBe('Asia/Shanghai');
    expect(typeof response.trace_id).toBe('string');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/response.test.ts`
Expected: FAIL

**Step 3: Implement generateSuccessResponse**

```typescript
// packages/core/src/engine/response.ts
import type { ApiResponse } from '../types';

function generateTraceId(): string {
  const hex = Math.random().toString(16).slice(2, 12);
  return `[${hex}]`;
}

export function generateSuccessResponse<T>(result: T): ApiResponse<T> {
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
```

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/response.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/response.ts packages/core/src/__tests__/response.test.ts
git commit -m "feat(core): add success response generator"
```

---

### Task 3.2: Implement Business Error Response Generator

**Files:**
- Modify: `packages/core/src/engine/response.ts`
- Modify: `packages/core/src/__tests__/response.test.ts`

**Step 1: Write failing test**

```typescript
// Add to packages/core/src/__tests__/response.test.ts
import { generateBusinessErrorResponse } from '../engine/response';

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
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/response.test.ts`
Expected: FAIL

**Step 3: Implement generateBusinessErrorResponse**

```typescript
// Add to packages/core/src/engine/response.ts
import type { ApiResponse, BusinessConfig } from '../types';

export function generateBusinessErrorResponse(
  config: BusinessConfig
): ApiResponse<null> {
  return {
    err_no: config.errNo,
    err_msg: config.errMsg,
    detail_err_msg: config.detailErrMsg,
    result: null,
    sync: true,
    time_stamp: Date.now(),
    time_zone_ID: 'Asia/Shanghai',
    time_zone_offset: -480,
    trace_id: generateTraceId(),
  };
}
```

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/response.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/response.ts packages/core/src/__tests__/response.test.ts
git commit -m "feat(core): add business error response generator"
```

---

## Phase 4: Core - Field Omission

### Task 4.1: Implement Manual Field Omission

**Files:**
- Create: `packages/core/src/engine/field-omit.ts`
- Create: `packages/core/src/__tests__/field-omit.test.ts`

**Step 1: Write failing test**

```typescript
// packages/core/src/__tests__/field-omit.test.ts
import { describe, it, expect } from 'vitest';
import { omitFields } from '../engine/field-omit';

describe('omitFields - manual mode', () => {
  it('deletes specified field', () => {
    const data = { name: 'test', age: 20 };
    const result = omitFields(data, {
      enabled: true,
      mode: 'manual',
      fields: ['age'],
      random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
    });

    expect(result).toEqual({ name: 'test' });
    expect('age' in result).toBe(false);
  });

  it('deletes nested field using dot notation', () => {
    const data = { user: { name: 'test', profile: { age: 20 } } };
    const result = omitFields(data, {
      enabled: true,
      mode: 'manual',
      fields: ['user.profile.age'],
      random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
    });

    expect(result.user.profile).toEqual({});
    expect('age' in result.user.profile).toBe(false);
  });

  it('returns original data when disabled', () => {
    const data = { name: 'test', age: 20 };
    const result = omitFields(data, {
      enabled: false,
      mode: 'manual',
      fields: ['age'],
      random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
    });

    expect(result).toEqual(data);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/field-omit.test.ts`
Expected: FAIL

**Step 3: Implement omitFields for manual mode**

```typescript
// packages/core/src/engine/field-omit.ts
import type { FieldOmitConfig } from '../types';

export function omitFields<T>(data: T, config: FieldOmitConfig): T {
  if (!config.enabled) {
    return data;
  }

  const cloned = structuredClone(data);

  if (config.mode === 'manual') {
    return omitManual(cloned, config.fields);
  }

  return omitRandom(cloned, config.random);
}

function omitManual<T>(data: T, fields: string[]): T {
  for (const fieldPath of fields) {
    deleteFieldByPath(data, fieldPath);
  }
  return data;
}

function deleteFieldByPath(obj: unknown, path: string): void {
  const parts = path.split('.');
  let current = obj as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      return;
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (current && typeof current === 'object') {
    delete current[lastPart];
  }
}

function omitRandom<T>(data: T, config: FieldOmitConfig['random']): T {
  // Will implement in next task
  return data;
}
```

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/field-omit.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/field-omit.ts packages/core/src/__tests__/field-omit.test.ts
git commit -m "feat(core): add manual field omission"
```

---

### Task 4.2: Implement Random Field Omission

**Files:**
- Modify: `packages/core/src/engine/field-omit.ts`
- Modify: `packages/core/src/__tests__/field-omit.test.ts`

**Step 1: Write failing test**

```typescript
// Add to packages/core/src/__tests__/field-omit.test.ts
describe('omitFields - random mode', () => {
  it('respects maxOmitCount', () => {
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const result = omitFields(data, {
      enabled: true,
      mode: 'random',
      fields: [],
      random: {
        probability: 100,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const remainingKeys = Object.keys(result);
    expect(remainingKeys.length).toBeGreaterThanOrEqual(3);
  });

  it('respects excludeFields', () => {
    const data = { err_no: 0, err_msg: '', result: { name: 'test' } };
    const result = omitFields(data, {
      enabled: true,
      mode: 'random',
      fields: [],
      random: {
        probability: 100,
        maxOmitCount: 10,
        excludeFields: ['err_no', 'err_msg'],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    expect(result.err_no).toBe(0);
    expect(result.err_msg).toBe('');
  });

  it('sets undefined when omitMode is undefined', () => {
    const data = { name: 'test', age: 20 };
    const result = omitFields(data, {
      enabled: true,
      mode: 'random',
      fields: [],
      random: {
        probability: 100,
        maxOmitCount: 1,
        excludeFields: ['name'],
        depthLimit: 5,
        omitMode: 'undefined',
        seed: 12345,
      },
    });

    expect(result.name).toBe('test');
    expect(result.age).toBeUndefined();
    expect('age' in result).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/field-omit.test.ts`
Expected: FAIL

**Step 3: Implement random field omission**

```typescript
// Update packages/core/src/engine/field-omit.ts

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function collectFieldPaths(
  obj: unknown,
  prefix: string,
  paths: string[],
  depthLimit: number,
  currentDepth: number
): void {
  if (currentDepth >= depthLimit) return;
  if (obj === null || typeof obj !== 'object') return;

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    paths.push(path);

    const value = (obj as Record<string, unknown>)[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      collectFieldPaths(value, path, paths, depthLimit, currentDepth + 1);
    }
  }
}

function omitRandom<T>(data: T, config: FieldOmitConfig['random']): T {
  const random = config.seed !== undefined
    ? seededRandom(config.seed)
    : Math.random.bind(Math);

  const allPaths: string[] = [];
  collectFieldPaths(data, '', allPaths, config.depthLimit, 0);

  const eligiblePaths = allPaths.filter(
    (path) => !config.excludeFields.some(
      (excluded) => path === excluded || path.startsWith(`${excluded}.`)
    )
  );

  const toOmit: string[] = [];
  for (const path of eligiblePaths) {
    if (toOmit.length >= config.maxOmitCount) break;
    if (random() * 100 < config.probability) {
      toOmit.push(path);
    }
  }

  for (const path of toOmit) {
    applyOmit(data, path, config.omitMode);
  }

  return data;
}

function applyOmit(
  obj: unknown,
  path: string,
  mode: 'delete' | 'undefined' | 'null'
): void {
  const parts = path.split('.');
  let current = obj as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      return;
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (current && typeof current === 'object') {
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
```

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/field-omit.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/engine/field-omit.ts packages/core/src/__tests__/field-omit.test.ts
git commit -m "feat(core): add random field omission with seed support"
```

---

## Phase 5: Core - Interceptors

### Task 5.1: Implement Fetch Interceptor

**Files:**
- Create: `packages/core/src/interceptor/fetch.ts`
- Create: `packages/core/src/__tests__/fetch.test.ts`

**Step 1: Write failing test**

```typescript
// packages/core/src/__tests__/fetch.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installFetchInterceptor, uninstallFetchInterceptor } from '../interceptor/fetch';
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
});
```

**Step 2: Run test to verify it fails**

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

export function installFetchInterceptor(
  rules: MockRule[],
  bypass?: Partial<BypassConfig>
): void {
  if (originalFetch) return;

  originalFetch = globalThis.fetch;
  currentRules = rules;
  if (bypass) {
    bypassConfig = { ...bypassConfig, ...bypass };
  }

  globalThis.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';

    if (shouldBypass(url, method)) {
      return originalFetch!(input, init);
    }

    const rule = matchRule(currentRules, url, method);
    if (!rule || rule.mockType === 'none') {
      return originalFetch!(input, init);
    }

    return handleMock(rule);
  };
}

export function uninstallFetchInterceptor(): void {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
    originalFetch = null;
  }
}

export function updateRules(rules: MockRule[]): void {
  currentRules = rules;
}

function shouldBypass(url: string, method: string): boolean {
  if (bypassConfig.methods.includes(method.toUpperCase())) {
    return true;
  }

  try {
    const urlObj = new URL(url, window.location.origin);
    if (bypassConfig.origins.includes(urlObj.origin)) {
      return true;
    }
  } catch {
    // Invalid URL, don't bypass
  }

  for (const pattern of bypassConfig.urlPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }

  return false;
}

async function handleMock(rule: MockRule): Promise<Response> {
  const { network, mockType } = rule;

  // Apply delay
  if (network.delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, network.delay));
  }

  // Check network errors
  if (network.timeout) {
    throw new TypeError('Network request timed out');
  }

  if (network.offline) {
    throw new TypeError('Failed to fetch');
  }

  // Random failure
  if (network.failRate > 0 && Math.random() * 100 < network.failRate) {
    throw new TypeError('Failed to fetch');
  }

  // Generate response
  let responseData;
  if (mockType === 'businessError') {
    responseData = generateBusinessErrorResponse(rule.business);
  } else {
    responseData = generateSuccessResponse(rule.response.customResult);
  }

  // Apply field omission
  if (rule.fieldOmit.enabled) {
    responseData = omitFields(responseData, rule.fieldOmit);
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/fetch.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/interceptor/fetch.ts packages/core/src/__tests__/fetch.test.ts
git commit -m "feat(core): add fetch interceptor"
```

---

### Task 5.2: Implement XHR Interceptor

**Files:**
- Create: `packages/core/src/interceptor/xhr.ts`
- Create: `packages/core/src/__tests__/xhr.test.ts`

**Step 1: Write failing test**

```typescript
// packages/core/src/__tests__/xhr.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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

  it('intercepts matching XHR request', async () => {
    const rules = [createRule()];
    installXHRInterceptor(rules);

    const result = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/test');
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(new Error('XHR failed'));
      xhr.send();
    });

    const data = JSON.parse(result);
    expect(data.result).toEqual({ mocked: true });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/xhr.test.ts`
Expected: FAIL

**Step 3: Implement XHR interceptor**

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

  window.XMLHttpRequest = createMockedXHR() as unknown as typeof XMLHttpRequest;
}

export function uninstallXHRInterceptor(): void {
  if (OriginalXHR) {
    window.XMLHttpRequest = OriginalXHR;
    OriginalXHR = null;
  }
}

export function updateRules(rules: MockRule[]): void {
  currentRules = rules;
}

function createMockedXHR() {
  return class MockedXHR {
    private _method = '';
    private _url = '';
    private _requestHeaders: Record<string, string> = {};
    private _responseText = '';
    private _status = 0;
    private _readyState = 0;
    private _realXHR: XMLHttpRequest | null = null;

    public onload: (() => void) | null = null;
    public onerror: ((e: Event) => void) | null = null;
    public ontimeout: (() => void) | null = null;
    public onreadystatechange: (() => void) | null = null;

    get responseText() { return this._responseText; }
    get response() { return this._responseText; }
    get status() { return this._status; }
    get readyState() { return this._readyState; }

    open(method: string, url: string) {
      this._method = method;
      this._url = url;
    }

    setRequestHeader(name: string, value: string) {
      this._requestHeaders[name] = value;
    }

    send(body?: Document | XMLHttpRequestBodyInit | null) {
      const rule = matchRule(currentRules, this._url, this._method);

      if (!rule || rule.mockType === 'none' || shouldBypass(this._url, this._method)) {
        this._realXHR = new OriginalXHR!();
        this._realXHR.open(this._method, this._url);

        for (const [name, value] of Object.entries(this._requestHeaders)) {
          this._realXHR.setRequestHeader(name, value);
        }

        this._realXHR.onload = () => {
          this._responseText = this._realXHR!.responseText;
          this._status = this._realXHR!.status;
          this._readyState = this._realXHR!.readyState;
          this.onload?.();
        };

        this._realXHR.onerror = (e) => this.onerror?.(e);
        this._realXHR.ontimeout = () => this.ontimeout?.();
        this._realXHR.send(body);
        return;
      }

      this.handleMock(rule);
    }

    private handleMock(rule: MockRule) {
      const { network, mockType } = rule;

      setTimeout(() => {
        if (network.timeout) {
          this.ontimeout?.();
          return;
        }

        if (network.offline) {
          this.onerror?.(new Event('error'));
          return;
        }

        if (network.failRate > 0 && Math.random() * 100 < network.failRate) {
          this.onerror?.(new Event('error'));
          return;
        }

        let responseData;
        if (mockType === 'businessError') {
          responseData = generateBusinessErrorResponse(rule.business);
        } else {
          responseData = generateSuccessResponse(rule.response.customResult);
        }

        if (rule.fieldOmit.enabled) {
          responseData = omitFields(responseData, rule.fieldOmit);
        }

        this._responseText = JSON.stringify(responseData);
        this._status = 200;
        this._readyState = 4;
        this.onreadystatechange?.();
        this.onload?.();
      }, network.delay);
    }

    abort() {
      this._realXHR?.abort();
    }
  };
}

function shouldBypass(url: string, method: string): boolean {
  if (bypassConfig.methods.includes(method.toUpperCase())) {
    return true;
  }
  return false;
}
```

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/xhr.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/core/src/interceptor/xhr.ts packages/core/src/__tests__/xhr.test.ts
git commit -m "feat(core): add XHR interceptor"
```

---

### Task 5.3: Create Unified Interceptor API

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

## Phase 6: Storage Layer

### Task 6.1: Implement localStorage Storage

**Files:**
- Create: `packages/core/src/storage/local.ts`
- Create: `packages/core/src/__tests__/storage.test.ts`

**Step 1: Write failing test**

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
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/core/src/__tests__/storage.test.ts`
Expected: FAIL

**Step 3: Implement RuleStorage**

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

**Step 4: Run test**

Run: `pnpm vitest run packages/core/src/__tests__/storage.test.ts`
Expected: PASS

**Step 5: Export from core**

```typescript
// Update packages/core/src/index.ts
export * from './types';
export * from './engine/matcher';
export * from './engine/response';
export * from './engine/field-omit';
export * from './interceptor';
export * from './storage/local';
```

**Step 6: Commit**

```bash
git add packages/core/src/storage/local.ts packages/core/src/__tests__/storage.test.ts packages/core/src/index.ts
git commit -m "feat(core): add localStorage-based rule storage"
```

---

## Phase 7: Parser Package

### Task 7.1: Create Parser Package Structure

**Files:**
- Create: `packages/parser/package.json`
- Create: `packages/parser/tsconfig.json`
- Create: `packages/parser/src/types.ts`
- Create: `packages/parser/src/index.ts`

**Step 1: Create packages/parser/package.json**

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

**Step 2: Create packages/parser/tsconfig.json**

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

**Step 3: Create packages/parser/src/types.ts**

```typescript
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

**Step 4: Create packages/parser/src/index.ts**

```typescript
export * from './types';
```

**Step 5: Install dependencies**

Run: `cd packages/parser && pnpm install`
Expected: Dependencies installed

**Step 6: Commit**

```bash
git add packages/parser
git commit -m "chore: add parser package structure"
```

---

### Task 7.2: Implement Default Adapter

**Files:**
- Create: `packages/parser/src/adapters/default.ts`
- Create: `packages/parser/src/__tests__/default-adapter.test.ts`

**Step 1: Write failing test**

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
    expect(result[0]).toEqual({
      module: 'user',
      name: 'getUser',
      url: '/api/user/info',
      method: 'GET',
      responseType: 'GetUserResponse',
      requestType: 'GetUserRequest',
    });
    expect(result[1]).toEqual({
      module: 'user',
      name: 'updateUser',
      url: '/api/user/update',
      method: 'POST',
      responseType: 'UpdateUserResponse',
      requestType: 'UpdateUserRequest',
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run packages/parser/src/__tests__/default-adapter.test.ts`
Expected: FAIL

**Step 3: Implement parseApiFile**

```typescript
// packages/parser/src/adapters/default.ts
import type { ApiMeta } from '../types';

interface UrlConstant {
  name: string;
  value: string;
}

interface CreateRequestCall {
  name: string;
  urlConstant: string;
  method: string;
  responseType: string;
  requestType: string;
}

export function parseApiFile(code: string, moduleName: string): ApiMeta[] {
  const urlConstants = extractUrlConstants(code);
  const createRequestCalls = extractCreateRequestCalls(code);

  const urlMap = new Map(urlConstants.map((u) => [u.name, u.value]));

  return createRequestCalls.map((call) => ({
    module: moduleName,
    name: call.name,
    url: urlMap.get(call.urlConstant) || '',
    method: call.method,
    responseType: call.responseType,
    requestType: call.requestType,
  }));
}

function extractUrlConstants(code: string): UrlConstant[] {
  const regex = /export\s+const\s+(\w+Url)\s*=\s*['"`]([^'"`]+)['"`]/g;
  const results: UrlConstant[] = [];
  let match;

  while ((match = regex.exec(code)) !== null) {
    results.push({
      name: match[1],
      value: match[2],
    });
  }

  return results;
}

function extractCreateRequestCalls(code: string): CreateRequestCall[] {
  const regex = /export\s+const\s+(\w+)\s*=\s*createRequest<(\w+),\s*(\w+)>\(\{\s*url:\s*(\w+)(?:,\s*method:\s*['"`](\w+)['"`])?\s*,?\s*\}\)/g;
  const results: CreateRequestCall[] = [];
  let match;

  while ((match = regex.exec(code)) !== null) {
    results.push({
      name: match[1],
      urlConstant: match[4],
      method: match[5] || 'GET',
      responseType: match[2],
      requestType: match[3],
    });
  }

  return results;
}
```

**Step 4: Run test**

Run: `pnpm vitest run packages/parser/src/__tests__/default-adapter.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/parser/src/adapters/default.ts packages/parser/src/__tests__/default-adapter.test.ts
git commit -m "feat(parser): add default adapter for createRequest pattern"
```

---

### Task 7.3: Implement Full Adapter with Directory Scanning

**Files:**
- Modify: `packages/parser/src/adapters/default.ts`
- Update: `packages/parser/src/index.ts`

**Step 1: Implement directory scanning**

```typescript
// Add to packages/parser/src/adapters/default.ts
import * as fs from 'fs';
import * as path from 'path';
import type { ApiAdapter, ApiMeta } from '../types';

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

**Step 2: Update index.ts**

```typescript
// packages/parser/src/index.ts
export * from './types';
export { parseApiFile, createDefaultAdapter } from './adapters/default';
```

**Step 3: Build and verify**

Run: `cd packages/parser && pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add packages/parser/src/adapters/default.ts packages/parser/src/index.ts
git commit -m "feat(parser): add directory scanning to default adapter"
```

---

## Phase 8: UI Package (Svelte + Tailwind)

### Task 8.1: Create UI Package Structure

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/vite.config.ts`
- Create: `packages/ui/tailwind.config.js`
- Create: `packages/ui/postcss.config.js`

**Step 1: Create packages/ui/package.json**

```json
{
  "name": "@error-mock/ui",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/error-mock-ui.js",
  "module": "./dist/error-mock-ui.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/error-mock-ui.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@error-mock/core": "workspace:*"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.2.0",
    "vite": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0"
  }
}
```

**Step 2: Create packages/ui/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ErrorMockUI',
      fileName: 'error-mock-ui',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
    },
  },
});
```

**Step 3: Create packages/ui/tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{svelte,ts,js}'],
  prefix: 'em-',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Step 4: Create packages/ui/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 5: Create packages/ui/tsconfig.json**

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

**Step 6: Install dependencies**

Run: `cd packages/ui && pnpm install`
Expected: Dependencies installed

**Step 7: Commit**

```bash
git add packages/ui/package.json packages/ui/vite.config.ts packages/ui/tailwind.config.js packages/ui/postcss.config.js packages/ui/tsconfig.json
git commit -m "chore: add UI package structure with Svelte and Tailwind"
```

---

### Task 8.2: Create Svelte Stores

**Files:**
- Create: `packages/ui/src/stores/rules.ts`
- Create: `packages/ui/src/stores/config.ts`

**Step 1: Create rules store**

```typescript
// packages/ui/src/stores/rules.ts
import { writable, derived } from 'svelte/store';
import type { MockRule, ApiMeta } from '@error-mock/core';

export const apiMetas = writable<ApiMeta[]>([]);
export const mockRules = writable<MockRule[]>([]);
export const selectedIds = writable<Set<string>>(new Set());
export const searchQuery = writable('');

export const filteredMetas = derived(
  [apiMetas, searchQuery],
  ([$apiMetas, $searchQuery]) => {
    if (!$searchQuery) return $apiMetas;
    const query = $searchQuery.toLowerCase();
    return $apiMetas.filter(
      (meta) =>
        meta.name.toLowerCase().includes(query) ||
        meta.url.toLowerCase().includes(query) ||
        meta.module.toLowerCase().includes(query)
    );
  }
);

export const groupedMetas = derived(filteredMetas, ($filteredMetas) => {
  const groups = new Map<string, ApiMeta[]>();
  for (const meta of $filteredMetas) {
    const list = groups.get(meta.module) || [];
    list.push(meta);
    groups.set(meta.module, list);
  }
  return groups;
});

export const activeMockCount = derived(mockRules, ($mockRules) =>
  $mockRules.filter((r) => r.enabled && r.mockType !== 'none').length
);

export function getRuleForApi(apiMeta: ApiMeta, rules: MockRule[]): MockRule | undefined {
  return rules.find((r) => r.url === apiMeta.url && r.method === apiMeta.method);
}

export function createDefaultRule(apiMeta: ApiMeta): MockRule {
  return {
    id: `${apiMeta.module}-${apiMeta.name}`,
    url: apiMeta.url,
    method: apiMeta.method as MockRule['method'],
    enabled: false,
    mockType: 'none',
    network: { delay: 0, timeout: false, offline: false, failRate: 0 },
    business: { errNo: 0, errMsg: '', detailErrMsg: '' },
    response: { useDefault: true, customResult: null },
    fieldOmit: {
      enabled: false,
      mode: 'manual',
      fields: [],
      random: {
        probability: 30,
        maxOmitCount: 3,
        excludeFields: ['err_no', 'err_msg'],
        depthLimit: 5,
        omitMode: 'delete',
      },
    },
  };
}
```

**Step 2: Create config store**

```typescript
// packages/ui/src/stores/config.ts
import { writable } from 'svelte/store';
import type { GlobalConfig } from '@error-mock/core';

const DEFAULT_CONFIG: GlobalConfig = {
  enabled: true,
  defaultDelay: 0,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
};

export const globalConfig = writable<GlobalConfig>(DEFAULT_CONFIG);
export const isModalOpen = writable(false);
export const isMinimized = writable(false);
```

**Step 3: Commit**

```bash
git add packages/ui/src/stores/rules.ts packages/ui/src/stores/config.ts
git commit -m "feat(ui): add Svelte stores for rules and config"
```

---

### Task 8.3: Create Float Button Component

**Files:**
- Create: `packages/ui/src/components/FloatButton.svelte`
- Create: `packages/ui/src/styles/main.css`

**Step 1: Create main.css**

```css
/* packages/ui/src/styles/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 2: Create FloatButton.svelte**

```svelte
<!-- packages/ui/src/components/FloatButton.svelte -->
<script lang="ts">
  import { spring } from 'svelte/motion';
  import { activeMockCount, isModalOpen, isMinimized } from '../stores';

  const coords = spring(
    { x: window.innerWidth - 80, y: window.innerHeight - 80 },
    { stiffness: 0.1, damping: 0.25 }
  );

  let isDragging = false;
  let dragStartTime = 0;

  function handleMousedown(e: MouseEvent) {
    isDragging = true;
    dragStartTime = Date.now();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = $coords.x;
    const initialY = $coords.y;

    function handleMousemove(e: MouseEvent) {
      coords.set({
        x: Math.max(0, Math.min(window.innerWidth - 60, initialX + (e.clientX - startX))),
        y: Math.max(0, Math.min(window.innerHeight - 60, initialY + (e.clientY - startY))),
      });
    }

    function handleMouseup() {
      isDragging = false;
      window.removeEventListener('mousemove', handleMousemove);
      window.removeEventListener('mouseup', handleMouseup);
    }

    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseup);
  }

  function handleClick() {
    if (Date.now() - dragStartTime < 200) {
      isModalOpen.set(true);
      isMinimized.set(false);
    }
  }
</script>

{#if !$isModalOpen || $isMinimized}
  <button
    class="em-fixed em-z-[9999] em-flex em-items-center em-gap-2 em-rounded-full
           em-bg-slate-800 em-px-3 em-py-2 em-text-white em-shadow-lg
           em-transition-all hover:em-bg-slate-700 active:em-scale-95"
    style="left: {$coords.x}px; top: {$coords.y}px; touch-action: none;"
    on:mousedown={handleMousedown}
    on:click={handleClick}
  >
    <span class="em-text-lg">🔧</span>
    {#if $activeMockCount > 0}
      <span class="em-flex em-items-center em-gap-1 em-text-sm">
        <span class="em-h-2 em-w-2 em-rounded-full em-bg-red-500 em-animate-pulse"></span>
        {$activeMockCount} Active
      </span>
    {/if}
  </button>
{/if}
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/FloatButton.svelte packages/ui/src/styles/main.css
git commit -m "feat(ui): add draggable float button component"
```

---

### Task 8.4: Create Modal Component

**Files:**
- Create: `packages/ui/src/components/Modal.svelte`

**Step 1: Create Modal.svelte**

```svelte
<!-- packages/ui/src/components/Modal.svelte -->
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { isModalOpen, isMinimized } from '../stores';

  function handleClose() {
    isModalOpen.set(false);
  }

  function handleMinimize() {
    isMinimized.set(true);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $isModalOpen && !$isMinimized}
  <div
    class="em-fixed em-inset-0 em-z-[9998] em-flex em-items-center em-justify-center"
    transition:fade={{ duration: 150 }}
  >
    <!-- Backdrop (non-blocking) -->
    <div
      class="em-absolute em-inset-0 em-bg-black/20 em-backdrop-blur-sm"
      on:click={handleClose}
      on:keydown={(e) => e.key === 'Enter' && handleClose()}
      role="button"
      tabindex="0"
    ></div>

    <!-- Modal -->
    <div
      class="em-relative em-flex em-h-[600px] em-w-[900px] em-max-w-[90vw] em-max-h-[90vh]
             em-overflow-hidden em-rounded-xl em-border em-border-slate-700
             em-bg-slate-900/95 em-text-slate-200 em-shadow-2xl em-backdrop-blur-md"
      transition:fly={{ y: 20, duration: 200 }}
    >
      <!-- Header -->
      <div class="em-absolute em-top-0 em-left-0 em-right-0 em-flex em-h-12 em-items-center
                  em-justify-between em-border-b em-border-slate-700 em-px-4 em-bg-slate-800/50">
        <h1 class="em-flex em-items-center em-gap-2 em-font-semibold">
          <span>🔧</span>
          Error Mock
        </h1>
        <div class="em-flex em-gap-2">
          <button
            class="em-h-6 em-w-6 em-rounded em-bg-slate-700 hover:em-bg-slate-600
                   em-flex em-items-center em-justify-center em-text-xs"
            on:click={handleMinimize}
          >
            −
          </button>
          <button
            class="em-h-6 em-w-6 em-rounded em-bg-slate-700 hover:em-bg-red-600
                   em-flex em-items-center em-justify-center em-text-xs"
            on:click={handleClose}
          >
            ×
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="em-flex em-flex-1 em-pt-12">
        <slot />
      </div>
    </div>
  </div>
{/if}
```

**Step 2: Commit**

```bash
git add packages/ui/src/components/Modal.svelte
git commit -m "feat(ui): add glassmorphism modal component"
```

---

### Task 8.5: Create API List Component

**Files:**
- Create: `packages/ui/src/components/ApiList.svelte`

**Step 1: Create ApiList.svelte**

```svelte
<!-- packages/ui/src/components/ApiList.svelte -->
<script lang="ts">
  import {
    groupedMetas,
    mockRules,
    selectedIds,
    searchQuery,
    getRuleForApi,
  } from '../stores';
  import type { ApiMeta } from '@error-mock/core';

  let expandedModules = new Set<string>();

  function toggleModule(module: string) {
    if (expandedModules.has(module)) {
      expandedModules.delete(module);
    } else {
      expandedModules.add(module);
    }
    expandedModules = expandedModules;
  }

  function toggleSelect(api: ApiMeta) {
    const id = `${api.module}-${api.name}`;
    if ($selectedIds.has(id)) {
      $selectedIds.delete(id);
    } else {
      $selectedIds.add(id);
    }
    selectedIds.set($selectedIds);
  }

  function getStatus(api: ApiMeta): 'active-success' | 'active-error' | 'inactive' {
    const rule = getRuleForApi(api, $mockRules);
    if (!rule || !rule.enabled || rule.mockType === 'none') return 'inactive';
    if (rule.mockType === 'businessError' || rule.mockType === 'networkError') return 'active-error';
    return 'active-success';
  }

  function selectModule(module: string) {
    const apis = $groupedMetas.get(module) || [];
    const allSelected = apis.every((api) => $selectedIds.has(`${api.module}-${api.name}`));

    if (allSelected) {
      apis.forEach((api) => $selectedIds.delete(`${api.module}-${api.name}`));
    } else {
      apis.forEach((api) => $selectedIds.add(`${api.module}-${api.name}`));
    }
    selectedIds.set($selectedIds);
  }
</script>

<aside class="em-flex em-w-1/3 em-flex-col em-border-r em-border-slate-700 em-bg-slate-900/50">
  <!-- Search -->
  <div class="em-p-3 em-border-b em-border-slate-700">
    <input
      type="text"
      placeholder="Search... (⌘K)"
      bind:value={$searchQuery}
      class="em-w-full em-rounded em-bg-slate-800 em-px-3 em-py-1.5 em-text-sm
             em-text-slate-200 em-placeholder-slate-500
             focus:em-outline-none focus:em-ring-1 focus:em-ring-indigo-500"
    />
  </div>

  <!-- List -->
  <div class="em-flex-1 em-overflow-y-auto em-p-2">
    {#each [...$groupedMetas] as [module, apis]}
      <div class="em-mb-2">
        <!-- Module Header -->
        <button
          class="em-flex em-w-full em-items-center em-justify-between em-rounded em-px-2 em-py-1
                 em-text-sm em-font-medium em-text-slate-400 hover:em-bg-slate-800"
          on:click={() => toggleModule(module)}
        >
          <span class="em-flex em-items-center em-gap-1">
            <span class="em-text-xs">{expandedModules.has(module) ? '▼' : '▶'}</span>
            {module}
            <span class="em-text-xs em-text-slate-500">({apis.length})</span>
          </span>
          <input
            type="checkbox"
            class="em-rounded em-border-slate-600 em-bg-slate-700"
            checked={apis.every((api) => $selectedIds.has(`${api.module}-${api.name}`))}
            on:click|stopPropagation={() => selectModule(module)}
          />
        </button>

        <!-- APIs -->
        {#if expandedModules.has(module)}
          <div class="em-ml-4 em-mt-1 em-space-y-1">
            {#each apis as api}
              {@const status = getStatus(api)}
              {@const id = `${api.module}-${api.name}`}
              <button
                class="em-group em-flex em-w-full em-items-center em-justify-between em-rounded
                       em-px-2 em-py-1.5 em-text-sm hover:em-bg-slate-800
                       {$selectedIds.has(id) ? 'em-bg-slate-800' : ''}"
                on:click={() => toggleSelect(api)}
              >
                <div class="em-flex em-items-center em-gap-2">
                  <input
                    type="checkbox"
                    class="em-rounded em-border-slate-600 em-bg-slate-700"
                    checked={$selectedIds.has(id)}
                    on:click|stopPropagation
                  />
                  <span class="em-h-2 em-w-2 em-rounded-full
                    {status === 'active-success' ? 'em-bg-green-500' : ''}
                    {status === 'active-error' ? 'em-bg-red-500' : ''}
                    {status === 'inactive' ? 'em-bg-slate-500' : ''}
                  "></span>
                  <span class="em-text-slate-200">{api.name}</span>
                </div>
                <span class="em-text-xs em-text-slate-500 em-opacity-0 group-hover:em-opacity-100">
                  {api.method}
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</aside>
```

**Step 2: Commit**

```bash
git add packages/ui/src/components/ApiList.svelte
git commit -m "feat(ui): add API list component with grouping and status"
```

---

### Task 8.6: Create Rule Editor Component

**Files:**
- Create: `packages/ui/src/components/RuleEditor.svelte`

**Step 1: Create RuleEditor.svelte**

```svelte
<!-- packages/ui/src/components/RuleEditor.svelte -->
<script lang="ts">
  import type { MockRule } from '@error-mock/core';
  import { createEventDispatcher } from 'svelte';

  export let rule: MockRule;

  const dispatch = createEventDispatcher<{ change: MockRule }>();

  function update<K extends keyof MockRule>(key: K, value: MockRule[K]) {
    rule = { ...rule, [key]: value };
    dispatch('change', rule);
  }

  function updateNetwork<K extends keyof MockRule['network']>(key: K, value: MockRule['network'][K]) {
    rule = { ...rule, network: { ...rule.network, [key]: value } };
    dispatch('change', rule);
  }

  function updateBusiness<K extends keyof MockRule['business']>(key: K, value: MockRule['business'][K]) {
    rule = { ...rule, business: { ...rule.business, [key]: value } };
    dispatch('change', rule);
  }

  function updateFieldOmit<K extends keyof MockRule['fieldOmit']>(key: K, value: MockRule['fieldOmit'][K]) {
    rule = { ...rule, fieldOmit: { ...rule.fieldOmit, [key]: value } };
    dispatch('change', rule);
  }

  function updateFieldOmitRandom<K extends keyof MockRule['fieldOmit']['random']>(
    key: K,
    value: MockRule['fieldOmit']['random'][K]
  ) {
    rule = {
      ...rule,
      fieldOmit: {
        ...rule.fieldOmit,
        random: { ...rule.fieldOmit.random, [key]: value },
      },
    };
    dispatch('change', rule);
  }
</script>

<main class="em-flex em-flex-1 em-flex-col em-overflow-hidden">
  <!-- Header -->
  <header class="em-flex em-h-12 em-items-center em-justify-between em-border-b em-border-slate-700 em-px-4 em-bg-slate-800/30">
    <h2 class="em-font-mono em-text-sm em-text-indigo-400">
      {rule.method} {rule.url}
    </h2>
    <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
      <span class="em-text-sm em-text-slate-400">Enable Mock</span>
      <button
        class="em-relative em-h-5 em-w-9 em-rounded-full em-transition-colors
               {rule.enabled ? 'em-bg-green-600' : 'em-bg-slate-600'}"
        on:click={() => update('enabled', !rule.enabled)}
      >
        <span
          class="em-absolute em-top-1 em-h-3 em-w-3 em-rounded-full em-bg-white em-transition-transform
                 {rule.enabled ? 'em-translate-x-5' : 'em-translate-x-1'}"
        ></span>
      </button>
    </label>
  </header>

  <!-- Content -->
  <div class="em-flex-1 em-overflow-y-auto em-p-6 em-space-y-6">
    <!-- Mock Type -->
    <section>
      <h3 class="em-mb-3 em-text-xs em-font-bold em-uppercase em-tracking-wider em-text-slate-500">
        Mock Type
      </h3>
      <div class="em-flex em-gap-1 em-rounded em-bg-slate-800 em-p-1">
        {#each ['none', 'success', 'businessError', 'networkError'] as type}
          <button
            class="em-flex-1 em-rounded em-py-1 em-text-xs em-font-medium em-transition-colors
                   {rule.mockType === type
                     ? 'em-bg-indigo-600 em-text-white em-shadow-sm'
                     : 'em-text-slate-400 hover:em-bg-slate-700'}"
            on:click={() => update('mockType', type)}
          >
            {type === 'none' ? 'Pass' : type === 'businessError' ? 'Biz Error' : type === 'networkError' ? 'Net Error' : 'Success'}
          </button>
        {/each}
      </div>
    </section>

    <!-- Network Settings -->
    <section class="em-space-y-3">
      <h3 class="em-text-xs em-font-bold em-uppercase em-tracking-wider em-text-slate-500">
        Network Simulation
      </h3>
      <div class="em-grid em-grid-cols-2 em-gap-4">
        <label class="em-block">
          <span class="em-text-xs em-text-slate-400">Delay (ms)</span>
          <input
            type="number"
            value={rule.network.delay}
            on:input={(e) => updateNetwork('delay', parseInt(e.currentTarget.value) || 0)}
            class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
          />
        </label>
        <label class="em-block">
          <span class="em-text-xs em-text-slate-400">Random Fail (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            value={rule.network.failRate}
            on:input={(e) => updateNetwork('failRate', parseInt(e.currentTarget.value) || 0)}
            class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
          />
        </label>
      </div>
      <div class="em-flex em-gap-4">
        <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
          <input
            type="checkbox"
            checked={rule.network.timeout}
            on:change={(e) => updateNetwork('timeout', e.currentTarget.checked)}
            class="em-rounded em-border-slate-600 em-bg-slate-700"
          />
          <span class="em-text-sm em-text-slate-300">Timeout</span>
        </label>
        <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
          <input
            type="checkbox"
            checked={rule.network.offline}
            on:change={(e) => updateNetwork('offline', e.currentTarget.checked)}
            class="em-rounded em-border-slate-600 em-bg-slate-700"
          />
          <span class="em-text-sm em-text-slate-300">Offline</span>
        </label>
      </div>
    </section>

    <!-- Business Error (conditional) -->
    {#if rule.mockType === 'businessError'}
      <section class="em-space-y-3">
        <h3 class="em-text-xs em-font-bold em-uppercase em-tracking-wider em-text-slate-500">
          Business Error
        </h3>
        <div class="em-grid em-grid-cols-2 em-gap-4">
          <label class="em-block">
            <span class="em-text-xs em-text-slate-400">err_no</span>
            <input
              type="number"
              value={rule.business.errNo}
              on:input={(e) => updateBusiness('errNo', parseInt(e.currentTarget.value) || 0)}
              class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
            />
          </label>
          <label class="em-block">
            <span class="em-text-xs em-text-slate-400">err_msg</span>
            <input
              type="text"
              value={rule.business.errMsg}
              on:input={(e) => updateBusiness('errMsg', e.currentTarget.value)}
              class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
            />
          </label>
        </div>
        <label class="em-block">
          <span class="em-text-xs em-text-slate-400">detail_err_msg</span>
          <input
            type="text"
            value={rule.business.detailErrMsg}
            on:input={(e) => updateBusiness('detailErrMsg', e.currentTarget.value)}
            class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
          />
        </label>
      </section>
    {/if}

    <!-- Field Omission -->
    <section class="em-space-y-3">
      <h3 class="em-text-xs em-font-bold em-uppercase em-tracking-wider em-text-slate-500">
        Field Omission
      </h3>
      <div class="em-flex em-gap-1 em-rounded em-bg-slate-800 em-p-1">
        <button
          class="em-flex-1 em-rounded em-py-1 em-text-xs em-font-medium
                 {!rule.fieldOmit.enabled ? 'em-bg-indigo-600 em-text-white' : 'em-text-slate-400 hover:em-bg-slate-700'}"
          on:click={() => updateFieldOmit('enabled', false)}
        >
          Off
        </button>
        <button
          class="em-flex-1 em-rounded em-py-1 em-text-xs em-font-medium
                 {rule.fieldOmit.enabled && rule.fieldOmit.mode === 'manual'
                   ? 'em-bg-indigo-600 em-text-white'
                   : 'em-text-slate-400 hover:em-bg-slate-700'}"
          on:click={() => { updateFieldOmit('enabled', true); updateFieldOmit('mode', 'manual'); }}
        >
          Manual
        </button>
        <button
          class="em-flex-1 em-rounded em-py-1 em-text-xs em-font-medium
                 {rule.fieldOmit.enabled && rule.fieldOmit.mode === 'random'
                   ? 'em-bg-indigo-600 em-text-white'
                   : 'em-text-slate-400 hover:em-bg-slate-700'}"
          on:click={() => { updateFieldOmit('enabled', true); updateFieldOmit('mode', 'random'); }}
        >
          Random
        </button>
      </div>

      {#if rule.fieldOmit.enabled && rule.fieldOmit.mode === 'random'}
        <div class="em-grid em-grid-cols-2 em-gap-4">
          <label class="em-block">
            <span class="em-text-xs em-text-slate-400">Probability (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={rule.fieldOmit.random.probability}
              on:input={(e) => updateFieldOmitRandom('probability', parseInt(e.currentTarget.value) || 0)}
              class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
            />
          </label>
          <label class="em-block">
            <span class="em-text-xs em-text-slate-400">Max Omit Count</span>
            <input
              type="number"
              min="0"
              value={rule.fieldOmit.random.maxOmitCount}
              on:input={(e) => updateFieldOmitRandom('maxOmitCount', parseInt(e.currentTarget.value) || 0)}
              class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
            />
          </label>
        </div>
        <label class="em-block">
          <span class="em-text-xs em-text-slate-400">Protected Fields (comma-separated)</span>
          <input
            type="text"
            value={rule.fieldOmit.random.excludeFields.join(', ')}
            on:input={(e) => updateFieldOmitRandom('excludeFields', e.currentTarget.value.split(',').map(s => s.trim()).filter(Boolean))}
            class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
          />
        </label>
        <label class="em-block">
          <span class="em-text-xs em-text-slate-400">Omit Mode</span>
          <select
            value={rule.fieldOmit.random.omitMode}
            on:change={(e) => updateFieldOmitRandom('omitMode', e.currentTarget.value as 'delete' | 'undefined' | 'null')}
            class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
          >
            <option value="delete">Delete</option>
            <option value="undefined">Set Undefined</option>
            <option value="null">Set Null</option>
          </select>
        </label>
      {/if}

      {#if rule.fieldOmit.enabled && rule.fieldOmit.mode === 'manual'}
        <label class="em-block">
          <span class="em-text-xs em-text-slate-400">Fields to Omit (comma-separated paths)</span>
          <input
            type="text"
            value={rule.fieldOmit.fields.join(', ')}
            on:input={(e) => updateFieldOmit('fields', e.currentTarget.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="result.name, result.list[0].id"
            class="em-mt-1 em-w-full em-rounded em-border em-border-slate-600 em-bg-slate-800 em-px-2 em-py-1 em-text-sm"
          />
        </label>
      {/if}
    </section>
  </div>
</main>
```

**Step 2: Commit**

```bash
git add packages/ui/src/components/RuleEditor.svelte
git commit -m "feat(ui): add rule editor component with all settings"
```

---

### Task 8.7: Create Main App Component

**Files:**
- Create: `packages/ui/src/App.svelte`
- Create: `packages/ui/src/index.ts`

**Step 1: Create App.svelte**

```svelte
<!-- packages/ui/src/App.svelte -->
<script lang="ts">
  import './styles/main.css';
  import FloatButton from './components/FloatButton.svelte';
  import Modal from './components/Modal.svelte';
  import ApiList from './components/ApiList.svelte';
  import RuleEditor from './components/RuleEditor.svelte';
  import {
    apiMetas,
    mockRules,
    selectedIds,
    getRuleForApi,
    createDefaultRule,
  } from './stores/rules';
  import { isModalOpen } from './stores/config';
  import type { ApiMeta, MockRule } from '@error-mock/core';
  import { RuleStorage, updateRules as updateInterceptorRules } from '@error-mock/core';

  export let metas: ApiMeta[] = [];

  const storage = new RuleStorage();

  // Initialize
  $: {
    apiMetas.set(metas);
    const savedRules = storage.getRules();
    const initialRules = metas.map((meta) => {
      const saved = savedRules.find((r) => r.url === meta.url && r.method === meta.method);
      return saved || createDefaultRule(meta);
    });
    mockRules.set(initialRules);
    updateInterceptorRules(initialRules);
  }

  // Get selected rule for editing
  $: selectedRule = (() => {
    const selectedArray = Array.from($selectedIds);
    if (selectedArray.length !== 1) return null;
    const [module, name] = selectedArray[0].split('-');
    const meta = $apiMetas.find((m) => m.module === module && m.name === name);
    if (!meta) return null;
    return getRuleForApi(meta, $mockRules) || createDefaultRule(meta);
  })();

  function handleRuleChange(e: CustomEvent<MockRule>) {
    const updatedRule = e.detail;
    mockRules.update((rules) =>
      rules.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    );
    storage.saveRules($mockRules);
    updateInterceptorRules($mockRules);
  }
</script>

<FloatButton />

<Modal>
  <ApiList />
  {#if selectedRule}
    <RuleEditor rule={selectedRule} on:change={handleRuleChange} />
  {:else}
    <div class="em-flex em-flex-1 em-items-center em-justify-center em-text-slate-500">
      {#if $selectedIds.size === 0}
        Select an API to configure
      {:else}
        {$selectedIds.size} APIs selected - batch editing coming soon
      {/if}
    </div>
  {/if}
</Modal>
```

**Step 2: Create index.ts**

```typescript
// packages/ui/src/index.ts
import App from './App.svelte';
import type { ApiMeta } from '@error-mock/core';

export function mount(target: HTMLElement, metas: ApiMeta[]) {
  return new App({
    target,
    props: { metas },
  });
}

export { App };
```

**Step 3: Build and verify**

Run: `cd packages/ui && pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add packages/ui/src/App.svelte packages/ui/src/index.ts
git commit -m "feat(ui): add main App component and mount function"
```

---

## Phase 9: Build Plugins

### Task 9.1: Create Webpack Plugin

**Files:**
- Create: `packages/webpack-plugin/package.json`
- Create: `packages/webpack-plugin/tsconfig.json`
- Create: `packages/webpack-plugin/src/index.ts`

**Step 1: Create packages/webpack-plugin/package.json**

```json
{
  "name": "@error-mock/webpack-plugin",
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
    "@error-mock/parser": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "webpack": "^5.89.0"
  },
  "peerDependencies": {
    "webpack": "^5.0.0"
  }
}
```

**Step 2: Create packages/webpack-plugin/src/index.ts**

```typescript
// packages/webpack-plugin/src/index.ts
import type { Compiler } from 'webpack';
import { createDefaultAdapter } from '@error-mock/parser';
import type { ApiAdapter, ApiMeta } from '@error-mock/parser';
import * as path from 'path';

export interface ErrorMockPluginOptions {
  apiDir?: string;
  adapter?: ApiAdapter;
}

export class ErrorMockWebpackPlugin {
  private options: Required<ErrorMockPluginOptions>;

  constructor(options: ErrorMockPluginOptions = {}) {
    this.options = {
      apiDir: options.apiDir || 'src/api',
      adapter: options.adapter || createDefaultAdapter(),
    };
  }

  apply(compiler: Compiler) {
    // Only apply in development mode
    if (compiler.options.mode !== 'development') {
      return;
    }

    const pluginName = 'ErrorMockPlugin';

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const apiDir = path.resolve(compiler.context, this.options.apiDir);
      const metas = this.options.adapter.parse(apiDir);

      // Inject API metas as global variable
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const code = this.generateRuntimeCode(metas);
          compilation.emitAsset(
            'error-mock-runtime.js',
            new compiler.webpack.sources.RawSource(code)
          );
        }
      );
    });

    // Add runtime script to HTML
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const HtmlPlugin = compiler.options.plugins?.find(
        (p) => p?.constructor.name === 'HtmlWebpackPlugin'
      );

      if (HtmlPlugin) {
        const hooks = (HtmlPlugin.constructor as any).getHooks(compilation);
        hooks.alterAssetTagGroups.tap(pluginName, (data: any) => {
          data.bodyTags.unshift({
            tagName: 'script',
            voidTag: false,
            attributes: { src: 'error-mock-runtime.js' },
          });
          return data;
        });
      }
    });
  }

  private generateRuntimeCode(metas: ApiMeta[]): string {
    return `
(function() {
  if (typeof window === 'undefined') return;

  window.__ERROR_MOCK_API_METAS__ = ${JSON.stringify(metas)};

  // Dynamic import UI and core
  Promise.all([
    import('@error-mock/core'),
    import('@error-mock/ui'),
  ]).then(([core, ui]) => {
    const container = document.createElement('div');
    container.id = 'error-mock-root';
    document.body.appendChild(container);

    core.install([]);
    ui.mount(container, window.__ERROR_MOCK_API_METAS__);
  }).catch(console.error);
})();
`;
  }
}

export default ErrorMockWebpackPlugin;
```

**Step 3: Install dependencies**

Run: `cd packages/webpack-plugin && pnpm install`
Expected: Dependencies installed

**Step 4: Build**

Run: `cd packages/webpack-plugin && pnpm build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add packages/webpack-plugin
git commit -m "feat: add webpack plugin"
```

---

### Task 9.2: Create Vite Plugin

**Files:**
- Create: `packages/vite-plugin/package.json`
- Create: `packages/vite-plugin/tsconfig.json`
- Create: `packages/vite-plugin/src/index.ts`

**Step 1: Create packages/vite-plugin/package.json**

```json
{
  "name": "@error-mock/vite-plugin",
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
    "@error-mock/parser": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vite": "^5.0.0"
  },
  "peerDependencies": {
    "vite": "^5.0.0"
  }
}
```

**Step 2: Create packages/vite-plugin/src/index.ts**

```typescript
// packages/vite-plugin/src/index.ts
import type { Plugin, ResolvedConfig } from 'vite';
import { createDefaultAdapter } from '@error-mock/parser';
import type { ApiAdapter, ApiMeta } from '@error-mock/parser';
import * as path from 'path';

export interface ErrorMockPluginOptions {
  apiDir?: string;
  adapter?: ApiAdapter;
}

export function errorMockVitePlugin(options: ErrorMockPluginOptions = {}): Plugin {
  const apiDir = options.apiDir || 'src/api';
  const adapter = options.adapter || createDefaultAdapter();
  let config: ResolvedConfig;
  let metas: ApiMeta[] = [];

  return {
    name: 'error-mock-plugin',
    apply: 'serve', // Only apply in dev server

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      const fullApiDir = path.resolve(config.root, apiDir);
      metas = adapter.parse(fullApiDir);
    },

    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: generateInlineScript(metas),
            injectTo: 'body',
          },
        ],
      };
    },
  };
}

function generateInlineScript(metas: ApiMeta[]): string {
  return `
import { install } from '@error-mock/core';
import { mount } from '@error-mock/ui';

const metas = ${JSON.stringify(metas)};

const container = document.createElement('div');
container.id = 'error-mock-root';
document.body.appendChild(container);

install([]);
mount(container, metas);
`;
}

export default errorMockVitePlugin;
```

**Step 3: Install dependencies**

Run: `cd packages/vite-plugin && pnpm install`
Expected: Dependencies installed

**Step 4: Build**

Run: `cd packages/vite-plugin && pnpm build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add packages/vite-plugin
git commit -m "feat: add vite plugin"
```

---

## Phase 10: Testing & Coverage

### Task 10.1: Configure Vitest with Coverage

**Files:**
- Create: `vitest.config.ts` (root)
- Update: `package.json` scripts

**Step 1: Create vitest.config.ts**

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

**Step 2: Run coverage**

Run: `pnpm test:coverage`
Expected: Coverage report generated, may initially be below 90%

**Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: configure vitest with 90% coverage thresholds"
```

---

### Task 10.2: Add Missing Tests to Reach 90% Coverage

**Files:**
- Add tests as needed to reach coverage targets

**Step 1: Run coverage and identify gaps**

Run: `pnpm test:coverage`
Expected: Report shows which lines/branches need coverage

**Step 2: Add tests for uncovered code**

(This step is iterative - add tests until 90% is reached)

**Step 3: Commit when coverage is met**

```bash
git add packages/*/src/__tests__
git commit -m "test: achieve 90% coverage across core and parser"
```

---

## Phase 11: Example Projects

### Task 11.1: Create Vite Example Project

**Files:**
- Create: `examples/vite-example/package.json`
- Create: `examples/vite-example/vite.config.ts`
- Create: `examples/vite-example/src/api/user/index.ts`
- Create: `examples/vite-example/src/api/user/_interface.ts`
- Create: `examples/vite-example/index.html`
- Create: `examples/vite-example/src/main.ts`

**Step 1: Create example structure**

```json
// examples/vite-example/package.json
{
  "name": "vite-example",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@error-mock/core": "workspace:*",
    "@error-mock/ui": "workspace:*",
    "@error-mock/vite-plugin": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
// examples/vite-example/vite.config.ts
import { defineConfig } from 'vite';
import errorMockPlugin from '@error-mock/vite-plugin';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
});
```

**Step 3: Create sample API files**

```typescript
// examples/vite-example/src/api/user/_interface.ts
export interface GetUserResponse {
  id: number;
  name: string;
  email: string;
}

export interface GetUserRequest {
  id: number;
}
```

```typescript
// examples/vite-example/src/api/user/index.ts
import type { GetUserResponse, GetUserRequest } from './_interface';

// Mock createRequest for demo
function createRequest<TRes, TReq>(config: { url: string; method?: string }) {
  return async (params: TReq): Promise<TRes> => {
    const response = await fetch(config.url, {
      method: config.method || 'GET',
      body: JSON.stringify(params),
    });
    return response.json();
  };
}

export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
});
```

**Step 4: Create index.html and main.ts**

```html
<!-- examples/vite-example/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Error Mock Example</title>
</head>
<body>
  <h1>Error Mock Plugin Demo</h1>
  <button id="fetch-btn">Fetch User</button>
  <pre id="result"></pre>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

```typescript
// examples/vite-example/src/main.ts
import { getUser } from './api/user';

document.getElementById('fetch-btn')?.addEventListener('click', async () => {
  try {
    const result = await getUser({ id: 1 });
    document.getElementById('result')!.textContent = JSON.stringify(result, null, 2);
  } catch (e) {
    document.getElementById('result')!.textContent = `Error: ${e}`;
  }
});
```

**Step 5: Install and test**

Run: `cd examples/vite-example && pnpm install && pnpm dev`
Expected: Dev server starts, plugin injects UI

**Step 6: Commit**

```bash
git add examples/vite-example
git commit -m "docs: add vite example project"
```

---

## Final Task: Build All Packages

**Step 1: Build all packages**

Run: `pnpm build`
Expected: All packages build successfully

**Step 2: Run all tests**

Run: `pnpm test:coverage`
Expected: All tests pass with 90%+ coverage

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: finalize error-mock-plugin v0.0.1"
```

---

## Summary

This implementation plan covers:

1. **Project Setup** - Monorepo structure with pnpm
2. **Core Package** - Types, matcher, response generator, field omission, interceptors, storage
3. **Parser Package** - API file parsing with default adapter
4. **UI Package** - Svelte + Tailwind components
5. **Build Plugins** - Webpack and Vite plugins
6. **Testing** - 90% coverage requirement
7. **Examples** - Vite example project

Each task follows TDD principles with failing tests first, minimal implementation, and frequent commits.
