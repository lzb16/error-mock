import { useEffect } from 'react';
import type { ApiMeta } from '@error-mock/core';
import { FloatButton } from '@/components/FloatButton';
import { Modal } from '@/components/Modal';
import { useRulesStore } from '@/stores/useRulesStore';
import { useToastStore } from '@/stores/useToastStore';

export interface AppProps {
  metas: ApiMeta[];
}

export function App({ metas }: AppProps) {
  const { setApiMetas, loadRules } = useRulesStore();

  // Initialize stores on mount
  useEffect(() => {
    setApiMetas(metas);
    loadRules();
    // Zustand actions are stable references, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metas]);

  // Cleanup toasts on unmount to prevent timer leaks
  useEffect(() => {
    return () => {
      useToastStore.getState().clearToasts();
    };
  }, []);

  return (
    <>
      <FloatButton />
      <Modal />
    </>
  );
}
