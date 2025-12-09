import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type { ApiMeta, MockRule } from '@error-mock/core';

// Symbol to represent mixed state in batch operations
export const MIXED: unique symbol = Symbol('MIXED');
export type MixedValue<T> = T | typeof MIXED;

// API metadata store
export const apiMetas: Writable<ApiMeta[]> = writable([]);

// Mock rules store (keyed by rule ID: module-name)
export const mockRules: Writable<Map<string, MockRule>> = writable(new Map());

// Selected rule IDs for batch operations
export const selectedIds: Writable<Set<string>> = writable(new Set());

// Search query for filtering APIs
export const searchQuery: Writable<string> = writable('');

// Derived store: count of active mocks
export const activeMockCount: Readable<number> = derived(mockRules, ($rules) => {
  let count = 0;
  for (const rule of $rules.values()) {
    if (rule.enabled && rule.mockType !== 'none') {
      count++;
    }
  }
  return count;
});

// Derived store: filtered API metadata based on search query
export const filteredMetas: Readable<ApiMeta[]> = derived(
  [apiMetas, searchQuery],
  ([$metas, $query]) => {
    if (!$query.trim()) {
      return $metas;
    }

    const lowerQuery = $query.toLowerCase();
    return $metas.filter(
      (meta) =>
        meta.name.toLowerCase().includes(lowerQuery) ||
        meta.url.toLowerCase().includes(lowerQuery) ||
        meta.module.toLowerCase().includes(lowerQuery)
    );
  }
);

// Derived store: grouped API metadata by module
export const groupedMetas: Readable<Map<string, ApiMeta[]>> = derived(
  filteredMetas,
  ($metas) => {
    const groups = new Map<string, ApiMeta[]>();
    for (const meta of $metas) {
      const existing = groups.get(meta.module) || [];
      existing.push(meta);
      groups.set(meta.module, existing);
    }
    return groups;
  }
);

// Batch state interface
export interface BatchState {
  enabled: MixedValue<boolean>;
  mockType: MixedValue<MockRule['mockType']>;
  delay: MixedValue<number>;
  timeout: MixedValue<boolean>;
  offline: MixedValue<boolean>;
  failRate: MixedValue<number>;
  errNo: MixedValue<number>;
  errMsg: MixedValue<string>;
  detailErrMsg: MixedValue<string>;
}

// Helper to compare values (returns MIXED if different, otherwise the common value)
function compareValues<T>(values: T[]): MixedValue<T> {
  if (values.length === 0) return MIXED as MixedValue<T>;
  const first = values[0];
  const allSame = values.every((v) => v === first);
  return allSame ? first : (MIXED as MixedValue<T>);
}

// Derived store: batch state for selected rules
export const batchState: Readable<BatchState | null> = derived(
  [mockRules, selectedIds],
  ([$rules, $selectedIds]): BatchState | null => {
    if ($selectedIds.size === 0) {
      return null;
    }

    const selectedRules: MockRule[] = [];
    for (const id of $selectedIds) {
      const rule = $rules.get(id);
      if (rule) {
        selectedRules.push(rule);
      }
    }

    if (selectedRules.length === 0) {
      return null;
    }

    return {
      enabled: compareValues(selectedRules.map((r) => r.enabled)),
      mockType: compareValues(selectedRules.map((r) => r.mockType)),
      delay: compareValues(selectedRules.map((r) => r.network.delay)),
      timeout: compareValues(selectedRules.map((r) => r.network.timeout)),
      offline: compareValues(selectedRules.map((r) => r.network.offline)),
      failRate: compareValues(selectedRules.map((r) => r.network.failRate)),
      errNo: compareValues(selectedRules.map((r) => r.business.errNo)),
      errMsg: compareValues(selectedRules.map((r) => r.business.errMsg)),
      detailErrMsg: compareValues(selectedRules.map((r) => r.business.detailErrMsg)),
    };
  }
);

// Helper: Get rule for a specific API (returns existing or default)
export function getRuleForApi(meta: ApiMeta, $rules: Map<string, MockRule>): MockRule {
  const id = `${meta.module}-${meta.name}`;
  const existing = $rules.get(id);
  if (existing) {
    return existing;
  }
  return createDefaultRule(meta);
}

// Helper: Create a default rule for an API
export function createDefaultRule(meta: ApiMeta): MockRule {
  const id = `${meta.module}-${meta.name}`;

  // Validate and normalize HTTP method
  const validMethods: MockRule['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const method = validMethods.includes(meta.method.toUpperCase() as MockRule['method'])
    ? (meta.method.toUpperCase() as MockRule['method'])
    : 'GET';

  return {
    id,
    url: meta.url,
    method,
    enabled: false,
    mockType: 'none',
    network: {
      delay: 0,
      timeout: false,
      offline: false,
      failRate: 0,
    },
    business: {
      errNo: 0,
      errMsg: '',
      detailErrMsg: '',
    },
    response: {
      useDefault: true,
      customResult: null,
    },
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
  };
}
