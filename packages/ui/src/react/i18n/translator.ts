import type { Locale, TranslationValues, Translations } from './types';

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

function formatValue(value: TranslationValues[string]): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function normalizeLocaleInput(locale: string): string {
  return locale.trim().toLowerCase().replace(/_/g, '-');
}

export function createTranslator(
  translationsByLocale: Record<Locale, Translations>,
  defaultLocale: Locale = 'zh'
) {
  const resolveLocale = (locale: string): Locale => {
    const normalized = normalizeLocaleInput(locale);
    const base = normalized.split('-')[0];

    if (base === 'zh') return 'zh';
    if (base === 'en') return 'en';
    return defaultLocale;
  };

  const translate = (
    locale: Locale,
    key: string,
    values?: TranslationValues
  ): string => {
    const current = translationsByLocale[locale]?.[key];
    const fallback = translationsByLocale[defaultLocale]?.[key];
    const raw = current ?? fallback ?? key;

    if (!values) return raw;

    return raw.replace(PLACEHOLDER_REGEX, (_match, name: string) => {
      return formatValue(values[name]);
    });
  };

  return {
    defaultLocale,
    resolveLocale,
    translate,
  };
}
