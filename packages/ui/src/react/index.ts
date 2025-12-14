export { mount, unmount, isMounted, type MountOptions } from './mount';
export { ShadowRootProvider, useShadowRoot, usePortalContainer } from './context/ShadowRootContext';

import { useLocaleStore, DEFAULT_LOCALE, type Locale } from './i18n';

export { useLocaleStore, DEFAULT_LOCALE, type Locale };

export function setLocale(locale: Locale): void {
  useLocaleStore.getState().setLocale(locale);
}

export function getLocale(): Locale {
  return useLocaleStore.getState().locale;
}
