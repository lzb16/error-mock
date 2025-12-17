import { useEffect, useRef } from 'react';
import { install, updateRules, uninstall } from '@error-mock/core';
import { useRulesStore } from '@/stores/useRulesStore';
import { useConfigStore } from '@/stores/useConfigStore';

/**
 * Manages interceptor lifecycle and synchronization with rule changes.
 *
 * Handles:
 * - Initial interceptor installation on mount
 * - Rule updates when appliedRules change (via updateRules)
 * - HMR scenarios where interceptors persist across store resets
 * - Cleanup on unmount
 *
 * Design notes:
 * - install() is idempotent but does NOT update rules if already installed
 * - updateRules() must be used for subsequent rule changes
 * - Two separate effects: one for sync, one for unmount cleanup
 * - Skip installation when rules are empty to avoid unnecessary fetch/XHR patching
 */
export function useInterceptor() {
  const appliedRules = useRulesStore((state) => state.appliedRules);
  const globalConfig = useConfigStore((state) => state.globalConfig);
  const isInstalled = useRef(false);

  // Sync rules and config whenever they change
  useEffect(() => {
    const rules = Array.from(appliedRules.values());
    const enabledRules = rules.filter((rule) => rule.enabled);

    // Keep the environment clean: if there are no enabled rules, don't patch fetch/XHR.
    if (enabledRules.length === 0) {
      if (isInstalled.current) {
        uninstall();
        isInstalled.current = false;
      }
      return;
    }

    // If already installed, reinstall to update both rules and config
    // because updateRules() doesn't support config updates.
    if (isInstalled.current) {
      uninstall();
      isInstalled.current = false;
    }

    // Install with enabled rules only.
    install(enabledRules, globalConfig);
    isInstalled.current = true;

    // Note: We don't uninstall here because we want interceptors
    // to persist across rule updates (only unmount should uninstall)
  }, [appliedRules, globalConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInstalled.current) {
        uninstall();
        isInstalled.current = false;
      }
    };
  }, []);
}
