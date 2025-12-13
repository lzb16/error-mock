import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { ApiMeta, MockRule } from '@error-mock/core';
import { RuleStorage, DEFAULT_RESPONSE_CONFIG, DEFAULT_NETWORK_CONFIG, DEFAULT_FIELD_OMIT_CONFIG } from '@error-mock/core';

// Enable Map/Set support in Immer
enableMapSet();

// Lazy storage creation for SSR safety
let storage: RuleStorage | null = null;
const getStorage = () => {
  if (!storage && typeof window !== 'undefined') {
    storage = new RuleStorage();
  }
  return storage;
};

type RulesState = {
  apiMetas: ApiMeta[];
  mockRules: Map<string, MockRule>;
  appliedRules: Map<string, MockRule>;
  selectedId: string | null;
  searchQuery: string;
  setApiMetas: (metas: ApiMeta[]) => void;
  setSelectedId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  loadRules: () => void;
  createRule: (meta: ApiMeta) => MockRule;
  updateRule: (rule: MockRule) => void;
  applyRule: (rule: MockRule) => void;
  getRuleForApi: (meta: ApiMeta) => MockRule;
  activeMockCount: () => number;
  filteredMetas: () => ApiMeta[];
  groupedMetas: () => Map<string, ApiMeta[]>;
};

const VALID_METHODS: MockRule['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

function normalizeMethod(method: string): MockRule['method'] {
  const upper = method.toUpperCase();
  return VALID_METHODS.includes(upper as MockRule['method'])
    ? (upper as MockRule['method'])
    : 'GET';
}

function createDefaultRule(meta: ApiMeta): MockRule {
  const id = `${meta.module}-${meta.name}`;
  return {
    id,
    url: meta.url,
    method: normalizeMethod(meta.method),
    enabled: false,
    response: { ...DEFAULT_RESPONSE_CONFIG },
    network: { ...DEFAULT_NETWORK_CONFIG },
    fieldOmit: { ...DEFAULT_FIELD_OMIT_CONFIG },
  };
}

export const useRulesStore = create<RulesState>()(
  immer((set, get) => ({
    apiMetas: [],
    mockRules: new Map<string, MockRule>(),
    appliedRules: new Map<string, MockRule>(),
    selectedId: null,
    searchQuery: '',

    setApiMetas: (metas) => set({ apiMetas: metas }),
    setSelectedId: (id) => set({ selectedId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    loadRules: () => {
      const store = getStorage();
      if (!store) return;
      const saved = store.getRules();
      const map = new Map<string, MockRule>();
      for (const rule of saved) map.set(rule.id, rule);
      set({ mockRules: map, appliedRules: new Map(map) });
      // Interceptor lifecycle is now managed by useInterceptor hook
    },

    createRule: (meta) => {
      const rule = createDefaultRule(meta);
      set((state) => {
        // Immer automatically proxies Map mutations with enableMapSet()
        state.mockRules.set(rule.id, rule);
        state.appliedRules.set(rule.id, rule);
        state.selectedId = rule.id;
      });
      // Persist to storage; interceptor updates handled by useInterceptor hook
      const allRules = Array.from(get().appliedRules.values());
      const store = getStorage();
      if (store) store.saveRules(allRules);
      return rule;
    },

    updateRule: (rule) =>
      set((state) => {
        // Immer automatically proxies Map mutations with enableMapSet()
        state.mockRules.set(rule.id, rule);
      }),

    applyRule: (rule) => {
      set((state) => {
        // Immer automatically proxies Map mutations with enableMapSet()
        state.mockRules.set(rule.id, rule);
        state.appliedRules.set(rule.id, rule);
      });
      // Persist to storage; interceptor updates handled by useInterceptor hook
      const allRules = Array.from(get().appliedRules.values());
      const store = getStorage();
      if (store) store.saveRules(allRules);
    },

    getRuleForApi: (meta) => {
      const id = `${meta.module}-${meta.name}`;
      return get().mockRules.get(id) ?? createDefaultRule(meta);
    },

    activeMockCount: () => {
      let count = 0;
      // Count from appliedRules to match interceptor state
      for (const rule of Array.from(get().appliedRules.values())) {
        if (rule.enabled) count++;
      }
      return count;
    },

    filteredMetas: () => {
      const { apiMetas, searchQuery } = get();
      if (!searchQuery.trim()) return apiMetas;
      const q = searchQuery.toLowerCase();
      return apiMetas.filter(
        (meta) =>
          meta.name.toLowerCase().includes(q) ||
          meta.url.toLowerCase().includes(q) ||
          meta.module.toLowerCase().includes(q)
      );
    },

    groupedMetas: () => {
      const groups = new Map<string, ApiMeta[]>();
      for (const meta of get().filteredMetas()) {
        const list = groups.get(meta.module) ?? [];
        list.push(meta);
        groups.set(meta.module, list);
      }
      return groups;
    },
  }))
);
