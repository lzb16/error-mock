import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Locale } from './types';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const DEFAULT_LOCALE: Locale = 'zh';

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'error-mock-locale',
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({ locale: state.locale }),
      migrate: (persistedState: unknown) => {
        const state = (persistedState || {}) as Partial<LocaleState>;
        return {
          locale: state.locale === 'en' ? 'en' : DEFAULT_LOCALE,
        };
      },
    }
  )
);

