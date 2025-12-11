import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GlobalConfig } from '@error-mock/core';

const DEFAULT_CONFIG: GlobalConfig = {
  enabled: true,
  defaultDelay: 0,
  position: 'bottom-right',
  theme: 'system',
  keyboardShortcuts: true,
};

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
      globalConfig: DEFAULT_CONFIG,
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
      partialize: (state) => ({ globalConfig: state.globalConfig }),
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
    }
  )
);
