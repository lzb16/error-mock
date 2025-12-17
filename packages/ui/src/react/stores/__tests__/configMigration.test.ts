import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DEFAULT_GLOBAL_CONFIG } from '@error-mock/core';

// Setup localStorage mock BEFORE importing store (critical!)
// This must run before useConfigStore module is evaluated
const localStorageData: Record<string, string> = {};
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: (key: string) => localStorageData[key] ?? null,
    setItem: (key: string, value: string) => { localStorageData[key] = value; },
    removeItem: (key: string) => { delete localStorageData[key]; },
    clear: () => { Object.keys(localStorageData).forEach(key => delete localStorageData[key]); },
    key: (index: number) => Object.keys(localStorageData)[index] ?? null,
    get length() { return Object.keys(localStorageData).length; },
  } as Storage;
}

// NOW import store (after localStorage is available)
import { useConfigStore } from '../useConfigStore';

describe('useConfigStore migration', () => {
  const STORAGE_KEY = 'error-mock-config';

  beforeEach(() => {
    localStorage.clear();
    // Reset store to default
    useConfigStore.setState({
      globalConfig: DEFAULT_GLOBAL_CONFIG,
      runtimeConfig: {},
      isModalOpen: false,
      isMinimized: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should merge persisted config with defaults', () => {
    const persistedConfig = {
      state: {
        globalConfig: {
          enabled: false,
          position: 'top-left' as const,
          theme: 'dark' as const,
          keyboardShortcuts: false,
          networkProfile: 'fast4g' as const,
        },
        isModalOpen: false,
        isMinimized: false,
      },
      version: 1,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedConfig));

    // Verify the migrate function
    const { migrate } = (useConfigStore as any).persist.getOptions();

    const migrated = migrate(persistedConfig.state, 1);

    expect(migrated.globalConfig.enabled).toBe(false);
    expect(migrated.globalConfig.position).toBe('top-left');
    expect(migrated.globalConfig.theme).toBe('dark');
    expect(migrated.globalConfig.keyboardShortcuts).toBe(false);
    expect(migrated.globalConfig.networkProfile).toBe('fast4g');
  });

  it('should handle missing config gracefully', () => {
    const { migrate } = (useConfigStore as any).persist.getOptions();

    const migrated = migrate(null, 0);

    expect(migrated.globalConfig).toEqual(DEFAULT_GLOBAL_CONFIG);
    expect(migrated.isModalOpen).toBe(false);
    expect(migrated.isMinimized).toBe(false);
  });

  it('should use defaults for missing fields in persisted config', () => {
    const partialConfig = {
      state: {
        globalConfig: {
          enabled: true,
          position: 'bottom-right' as const,
          // Missing: theme, keyboardShortcuts, networkProfile
        },
      },
      version: 1,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(partialConfig.state, 1);

    expect(migrated.globalConfig.enabled).toBe(true);
    expect(migrated.globalConfig.position).toBe('bottom-right');
    expect(migrated.globalConfig.theme).toBe(DEFAULT_GLOBAL_CONFIG.theme);
    expect(migrated.globalConfig.keyboardShortcuts).toBe(DEFAULT_GLOBAL_CONFIG.keyboardShortcuts);
    expect(migrated.globalConfig.networkProfile).toBe(DEFAULT_GLOBAL_CONFIG.networkProfile);
  });

  it('should preserve all current fields', () => {
    const config = {
      state: {
        globalConfig: {
          enabled: false,
          position: 'top-right' as const,
          theme: 'light' as const,
          keyboardShortcuts: false,
          networkProfile: 'slow3g' as const,
        },
        isModalOpen: true,
        isMinimized: true,
      },
      version: 1,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(config.state, 1);

    expect(migrated.globalConfig).toEqual({
      ...DEFAULT_GLOBAL_CONFIG,
      ...config.state.globalConfig,
    });
    expect(migrated.isModalOpen).toBe(true);
    expect(migrated.isMinimized).toBe(true);
  });
});
