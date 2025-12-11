import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { ApiMeta, MockRule } from '@error-mock/core';
import { RuleStorage, install, updateRules as refreshInterceptors } from '@error-mock/core';

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
  selectedId: string | null;
  searchQuery: string;
  _interceptorsInstalled: boolean; // Private flag for interceptor lifecycle
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
    mockType: 'none',
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
  };
}

export const useRulesStore = create<RulesState>()(
  immer((set, get) => ({
    apiMetas: [],
    mockRules: new Map<string, MockRule>(),
    selectedId: null,
    searchQuery: '',
    _interceptorsInstalled: false,

    setApiMetas: (metas) => set({ apiMetas: metas }),
    setSelectedId: (id) => set({ selectedId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    loadRules: () => {
      const store = getStorage();
      if (!store) return;
      const saved = store.getRules();
      const map = new Map<string, MockRule>();
      for (const rule of saved) map.set(rule.id, rule);
      set({ mockRules: map });
      if (saved.length > 0) {
        // TODO: Consider moving interceptor logic to component useEffect
        // for better testability and separation of concerns
        // Always update rules first (install() may no-op if already installed)
        refreshInterceptors(saved);
        // Then try to install (will no-op if already installed)
        install(saved);
        set({ _interceptorsInstalled: true });
      }
    },

    createRule: (meta) => {
      const rule = createDefaultRule(meta);
      set((state) => {
        // Immer automatically proxies Map mutations with enableMapSet()
        state.mockRules.set(rule.id, rule);
        state.selectedId = rule.id;
      });
      // Save and refresh interceptors
      const allRules = Array.from(get().mockRules.values());
      const store = getStorage();
      if (store) store.saveRules(allRules);
      // TODO: Consider moving interceptor logic to component useEffect
      // for better testability and separation of concerns
      // Always update rules first (handles case where interceptors exist but store was reset)
      refreshInterceptors(allRules);
      if (!get()._interceptorsInstalled) {
        // Try to install (may no-op if already installed, but rules are already updated)
        install(allRules);
        set({ _interceptorsInstalled: true });
      }
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
      });
      // Save to storage and refresh interceptors
      const allRules = Array.from(get().mockRules.values());
      const store = getStorage();
      if (store) store.saveRules(allRules);
      // TODO: Consider moving interceptor logic to component useEffect
      // for better testability and separation of concerns
      // Always update rules first (handles case where interceptors exist but store was reset)
      refreshInterceptors(allRules);
      if (!get()._interceptorsInstalled) {
        // Try to install (may no-op if already installed, but rules are already updated)
        install(allRules);
        set({ _interceptorsInstalled: true });
      }
    },

    getRuleForApi: (meta) => {
      const id = `${meta.module}-${meta.name}`;
      return get().mockRules.get(id) ?? createDefaultRule(meta);
    },

    activeMockCount: () => {
      let count = 0;
      for (const rule of Array.from(get().mockRules.values())) {
        if (rule.enabled && rule.mockType !== 'none') count++;
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
