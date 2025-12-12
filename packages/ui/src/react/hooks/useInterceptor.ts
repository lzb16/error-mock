import { useEffect, useRef } from 'react';
import { install, updateRules, uninstall } from '@error-mock/core';
import { useRulesStore } from '@/stores/useRulesStore';

/**
 * Manages interceptor lifecycle and synchronization with rule changes.
 *
 * Handles:
 * - Initial interceptor installation on mount
 * - Rule updates when mockRules change (via updateRules)
 * - HMR scenarios where interceptors persist across store resets
 * - Cleanup on unmount
 *
 * Design notes:
 * - install() is idempotent but does NOT update rules if already installed
 * - updateRules() must be used for subsequent rule changes
 * - Two separate effects: one for sync, one for unmount cleanup
 */
export function useInterceptor() {
  const mockRules = useRulesStore((state) => state.mockRules);
  const isInstalled = useRef(false);

  // Sync rules whenever mockRules Map changes
  useEffect(() => {
    const rules = Array.from(mockRules.values());

    // Always update rules first (handles HMR/store reset scenarios where
    // interceptors may already be installed but store was reset)
    updateRules(rules);

    if (!isInstalled.current) {
      // Initial installation: install() may no-op if already installed,
      // but rules are already updated above
      install(rules);
      isInstalled.current = true;
    }

    // Note: We don't uninstall here because we want interceptors
    // to persist across rule updates (only unmount should uninstall)
  }, [mockRules]);

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
