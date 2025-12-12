import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useConfigStore } from '../useConfigStore';
import { DEFAULT_GLOBAL_CONFIG, DEFAULT_RULE_DEFAULTS } from '@error-mock/core';

describe('useConfigStore migration', () => {
  const STORAGE_KEY = 'error-mock-config';

  beforeEach(() => {
    localStorage.clear();
    // Reset store to default
    useConfigStore.setState({
      globalConfig: DEFAULT_GLOBAL_CONFIG,
      isModalOpen: false,
      isMinimized: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should migrate legacy defaultDelay to defaults.delay', () => {
    // Simulate legacy config in localStorage
    const legacyConfig = {
      state: {
        globalConfig: {
          enabled: true,
          defaultDelay: 500,
          position: 'top-left',
          theme: 'dark',
          keyboardShortcuts: false,
        },
        isModalOpen: false,
        isMinimized: false,
      },
      version: 0,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyConfig));

    // Force rehydration by creating a new store instance
    // We can't truly test this without remounting, but we can verify the migrate function
    const { migrate } = (useConfigStore as any).persist.getOptions();

    const migrated = migrate(legacyConfig.state, 0);

    expect(migrated.globalConfig.defaults.delay).toBe(500);
    expect(migrated.globalConfig.enabled).toBe(true);
    expect(migrated.globalConfig.position).toBe('top-left');
    expect(migrated.globalConfig.theme).toBe('dark');
    expect(migrated.globalConfig.keyboardShortcuts).toBe(false);
    expect((migrated.globalConfig as any).defaultDelay).toBeUndefined();
  });

  it('should handle missing legacy config gracefully', () => {
    const { migrate } = (useConfigStore as any).persist.getOptions();

    const migrated = migrate(null, 0);

    expect(migrated.globalConfig).toEqual(DEFAULT_GLOBAL_CONFIG);
    expect(migrated.isModalOpen).toBe(false);
    expect(migrated.isMinimized).toBe(false);
  });

  it('should merge partial persisted defaults with DEFAULT_RULE_DEFAULTS', () => {
    const partialConfig = {
      state: {
        globalConfig: {
          enabled: true,
          position: 'bottom-right',
          theme: 'system',
          keyboardShortcuts: true,
          defaults: {
            delay: 100,
            // Missing: mockType, failRate, timeout, offline, business
          },
        },
      },
      version: 0,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(partialConfig.state, 0);

    expect(migrated.globalConfig.defaults.delay).toBe(100);
    expect(migrated.globalConfig.defaults.mockType).toBe(DEFAULT_RULE_DEFAULTS.mockType);
    expect(migrated.globalConfig.defaults.failRate).toBe(DEFAULT_RULE_DEFAULTS.failRate);
    expect(migrated.globalConfig.defaults.timeout).toBe(DEFAULT_RULE_DEFAULTS.timeout);
    expect(migrated.globalConfig.defaults.offline).toBe(DEFAULT_RULE_DEFAULTS.offline);
    expect(migrated.globalConfig.defaults.business).toEqual(DEFAULT_RULE_DEFAULTS.business);
  });

  it('should prefer legacy defaultDelay over partial defaults.delay', () => {
    const conflictingConfig = {
      state: {
        globalConfig: {
          enabled: true,
          defaultDelay: 500,
          position: 'bottom-right',
          theme: 'system',
          keyboardShortcuts: true,
          defaults: {
            delay: 100, // This should be ignored in favor of defaultDelay
          },
        },
      },
      version: 0,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(conflictingConfig.state, 0);

    expect(migrated.globalConfig.defaults.delay).toBe(500); // Legacy wins
  });

  it('should handle NaN and invalid delay values', () => {
    const invalidConfig = {
      state: {
        globalConfig: {
          enabled: true,
          defaultDelay: NaN,
          position: 'bottom-right',
          theme: 'system',
          keyboardShortcuts: true,
        },
      },
      version: 0,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(invalidConfig.state, 0);

    expect(migrated.globalConfig.defaults.delay).toBe(DEFAULT_RULE_DEFAULTS.delay);
  });

  it('should fully populate business config even when partial', () => {
    const partialBusinessConfig = {
      state: {
        globalConfig: {
          enabled: true,
          position: 'bottom-right',
          theme: 'system',
          keyboardShortcuts: true,
          defaults: {
            delay: 0,
            mockType: 'none',
            failRate: 0,
            timeout: false,
            offline: false,
            business: {
              errNo: 404,
              // Missing: errMsg, detailErrMsg
            },
          },
        },
      },
      version: 0,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(partialBusinessConfig.state, 0);

    expect(migrated.globalConfig.defaults.business.errNo).toBe(404);
    expect(migrated.globalConfig.defaults.business.errMsg).toBe(DEFAULT_RULE_DEFAULTS.business.errMsg);
    expect(migrated.globalConfig.defaults.business.detailErrMsg).toBe(DEFAULT_RULE_DEFAULTS.business.detailErrMsg);
  });

  it('should preserve existing non-deprecated fields', () => {
    const config = {
      state: {
        globalConfig: {
          enabled: false,
          position: 'top-right',
          theme: 'light',
          keyboardShortcuts: false,
          defaults: {
            delay: 200,
            mockType: 'businessError',
            failRate: 50,
            timeout: true,
            offline: true,
            business: {
              errNo: 500,
              errMsg: 'Test error',
              detailErrMsg: 'Detailed test error',
            },
          },
        },
        isModalOpen: true,
        isMinimized: true,
      },
      version: 1,
    };

    const { migrate } = (useConfigStore as any).persist.getOptions();
    const migrated = migrate(config.state, 1);

    expect(migrated.globalConfig).toEqual(config.state.globalConfig);
  });
});
