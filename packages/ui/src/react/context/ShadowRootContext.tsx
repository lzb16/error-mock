import { createContext, useContext, useMemo, type ReactNode } from 'react';

const ShadowRootContext = createContext<ShadowRoot | null>(null);

export interface ShadowRootProviderProps {
  shadowRoot: ShadowRoot;
  children: ReactNode;
}

export function ShadowRootProvider({ shadowRoot, children }: ShadowRootProviderProps) {
  return (
    <ShadowRootContext.Provider value={shadowRoot}>
      {children}
    </ShadowRootContext.Provider>
  );
}

export function useShadowRoot(): ShadowRoot {
  const ctx = useContext(ShadowRootContext);
  if (!ctx) {
    throw new Error('useShadowRoot must be used within a ShadowRootProvider');
  }
  return ctx;
}

export function usePortalContainer(): HTMLElement {
  const shadowRoot = useShadowRoot();

  return useMemo(() => {
    // Use dedicated portal container for overlays/dialogs
    const container = shadowRoot.getElementById('error-mock-portal');
    if (!container) {
      throw new Error('Portal container #error-mock-portal not found in Shadow Root');
    }
    return container;
  }, [shadowRoot]);
}
