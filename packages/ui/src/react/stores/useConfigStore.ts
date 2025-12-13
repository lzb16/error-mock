import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_GLOBAL_CONFIG, type GlobalConfig } from '@error-mock/core';

interface ConfigState {
  globalConfig: GlobalConfig;
  isModalOpen: boolean;
  isMinimized: boolean;
  updateGlobalConfig: (config: Partial<GlobalConfig>) => void;
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
      updateGlobalConfig: (config) =>
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
      migrate: (persistedState: unknown) => {
        const state = (persistedState || {}) as Partial<ConfigState>;
        const persistedConfig = state.globalConfig;

        if (!persistedConfig) {
          return {
            globalConfig: DEFAULT_GLOBAL_CONFIG,
            isModalOpen: false,
            isMinimized: false,
          };
        }

        // Simply merge persisted config with defaults, removing any legacy fields
        const migratedConfig: GlobalConfig = {
          ...DEFAULT_GLOBAL_CONFIG,
          ...persistedConfig,
        };

        return {
          globalConfig: migratedConfig,
          isModalOpen: state.isModalOpen ?? false,
          isMinimized: state.isMinimized ?? false,
        };
      },
    }
  )
);
