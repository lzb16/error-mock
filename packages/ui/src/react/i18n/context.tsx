import React, { createContext, useContext, useMemo } from 'react';
import type { Locale, TranslationValues } from './types';
import { zh } from './locales/zh';
import { en } from './locales/en';
import { createTranslator } from './translator';
import { useLocaleStore } from './store';

type TFunction = (key: string, values?: TranslationValues) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const translator = createTranslator({ zh, en }, 'zh');

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      setLocale,
      t: (key, values) => translator.translate(locale, key, values),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within <I18nProvider>');
  }
  return ctx;
}

export const resolveLocale = translator.resolveLocale;

