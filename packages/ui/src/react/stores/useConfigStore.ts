import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_GLOBAL_CONFIG, DEFAULT_RULE_DEFAULTS, type GlobalConfig } from '@error-mock/core';

interface ConfigState {
  globalConfig: GlobalConfig;
  isModalOpen: boolean;
  isMinimized: boolean;
  setConfig: (config: Partial<GlobalConfig>) => void;
  toggleModal: () => void;
  setModalOpen: (isOpen: boolean) => void;
  setMinimized: (isMinimized: boolean) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      globalConfig: DEFAULT_GLOBAL_CONFIG,
      isModalOpen: false,
      isMinimized: false,
      setConfig: (config) =>
        set((state) => ({ globalConfig: { ...state.globalConfig, ...config } })),
      toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
      setMinimized: (isMinimized) => set({ isMinimized }),
    }),
    {
      name: 'error-mock-config',
      version: 1,
      partialize: (state) => ({ globalConfig: state.globalConfig }),
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      migrate: (persistedState: unknown): ConfigState | undefined => {
        const state = (persistedState || {}) as Partial<ConfigState>;
        const persistedConfig = state.globalConfig as (Partial<GlobalConfig> & { defaultDelay?: number }) | undefined;

        if (!persistedConfig) {
          return {
            globalConfig: DEFAULT_GLOBAL_CONFIG,
            isModalOpen: false,
            isMinimized: false,
          };
        }

        // Handle legacy defaultDelay field
        const persistedDefaults = (persistedConfig as any).defaults as Partial<GlobalConfig['defaults']> | undefined;
        const legacyDelay = (persistedConfig as any).defaultDelay;

        const mergedDefaults = {
          ...DEFAULT_RULE_DEFAULTS,
          ...(persistedDefaults || {}),
          delay:
            typeof legacyDelay === 'number' && !Number.isNaN(legacyDelay)
              ? legacyDelay
              : typeof persistedDefaults?.delay === 'number' && !Number.isNaN(persistedDefaults.delay)
                ? persistedDefaults.delay
                : DEFAULT_RULE_DEFAULTS.delay,
          business: {
            ...DEFAULT_RULE_DEFAULTS.business,
            ...(persistedDefaults?.business ?? {}),
          },
        };

        const migratedConfig: GlobalConfig = {
          ...DEFAULT_GLOBAL_CONFIG,
          ...persistedConfig,
          defaults: mergedDefaults,
        };

        // Remove legacy field
        delete (migratedConfig as any).defaultDelay;

        return {
          ...state,
          globalConfig: migratedConfig,
          isModalOpen: false,
          isMinimized: false,
        };
      },
    }
  )
);
