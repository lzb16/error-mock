import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuleStorage } from '../storage/local';
import type { MockRule } from '../types';

describe('RuleStorage', () => {
  const storage = new RuleStorage('test-prefix');

  const createRule = (id: string): MockRule => ({
    id,
    url: `/api/${id}`,
    method: 'GET',
    enabled: true,
    mockType: 'success',
    network: { delay: 0, timeout: false, offline: false, failRate: 0 },
    business: { errNo: 0, errMsg: '', detailErrMsg: '' },
    response: { useDefault: true, customResult: null },
    fieldOmit: {
      enabled: false,
      mode: 'manual',
      fields: [],
      random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' },
    },
  });

  beforeEach(() => {
    storage.clear();
  });

  it('saves and retrieves rules', () => {
    const rules = [createRule('test1'), createRule('test2')];
    storage.saveRules(rules);

    const retrieved = storage.getRules();
    expect(retrieved).toEqual(rules);
  });

  it('updates single rule', () => {
    const rules = [createRule('test1')];
    storage.saveRules(rules);

    const updated = { ...rules[0], enabled: false };
    storage.updateRule(updated);

    const retrieved = storage.getRules();
    expect(retrieved[0].enabled).toBe(false);
  });

  it('returns empty array when no rules saved', () => {
    const retrieved = storage.getRules();
    expect(retrieved).toEqual([]);
  });

  it('exports and imports config', () => {
    const rules = [createRule('test1')];
    storage.saveRules(rules);
    storage.saveGlobalConfig({ enabled: false });

    const exported = storage.exportConfig();
    storage.clear();

    expect(storage.getRules()).toEqual([]);

    storage.importConfig(exported);
    expect(storage.getRules()).toEqual(rules);
    expect(storage.getGlobalConfig().enabled).toBe(false);
  });

  it('handles localStorage errors when saving rules', () => {
    const rules = [createRule('test1')];
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage.setItem to throw an error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw, but should log error
    expect(() => storage.saveRules(rules)).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[ErrorMock] Failed to save rules:',
      expect.any(Error)
    );

    // Restore
    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('handles localStorage errors when reading rules', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage.getItem to throw an error
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    // Should return empty array on error
    const result = storage.getRules();
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[ErrorMock] Failed to read rules:',
      expect.any(Error)
    );

    // Restore
    getItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('handles JSON parse errors when reading config', () => {
    // Store invalid JSON
    localStorage.setItem('test-prefix:config', 'invalid json {');

    // Should return default config on parse error
    const config = storage.getGlobalConfig();
    expect(config).toEqual({
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
          errNo: 0,
          errMsg: '',
          detailErrMsg: '',
        },
      },
    });
  });

  it('handles localStorage errors when saving config', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage.setItem to throw an error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    // Should not throw, but should log error
    expect(() => storage.saveGlobalConfig({ enabled: false })).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[ErrorMock] Failed to save config:',
      expect.any(Error)
    );

    // Restore
    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('handles JSON parse errors when importing config', () => {
    // Import invalid JSON
    const result = storage.importConfig('invalid json {');
    expect(result).toBe(false);
  });

  it('normalizes invalid HTTP methods to GET', () => {
    // Save a rule with an invalid method by manipulating localStorage directly
    const invalidRule = {
      ...createRule('test1'),
      method: 'INVALID' as any,
    };

    localStorage.setItem(
      'test-prefix:rules',
      JSON.stringify([invalidRule])
    );

    // getRules should normalize the invalid method to GET
    const retrieved = storage.getRules();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].method).toBe('GET');
  });

  it('migrates legacy GlobalConfig (defaultDelay) to new format', () => {
    // Store old format config with defaultDelay
    const legacyConfig = {
      enabled: false,
      defaultDelay: 500,
      position: 'top-left',
      theme: 'dark',
      keyboardShortcuts: false,
    };

    localStorage.setItem('test-prefix:config', JSON.stringify(legacyConfig));

    // getGlobalConfig should auto-migrate to new format
    const config = storage.getGlobalConfig();

    expect(config.enabled).toBe(false);
    expect(config.position).toBe('top-left');
    expect(config.theme).toBe('dark');
    expect(config.keyboardShortcuts).toBe(false);

    // Should have migrated defaultDelay to defaults.delay
    expect(config.defaults).toBeDefined();
    expect(config.defaults.delay).toBe(500);
    expect(config.defaults.mockType).toBe('none');
    expect(config.defaults.failRate).toBe(0);

    // Should have persisted migrated config (no more defaultDelay)
    const stored = JSON.parse(localStorage.getItem('test-prefix:config') || '{}');
    expect(stored.defaultDelay).toBeUndefined();
    expect(stored.defaults).toBeDefined();
    expect(stored.defaults.delay).toBe(500);
  });

  it('handles invalid defaultDelay during migration', () => {
    // Store config with invalid defaultDelay
    const legacyConfig = {
      enabled: true,
      defaultDelay: '300' as any, // Invalid: string instead of number
      position: 'bottom-right',
      theme: 'system',
      keyboardShortcuts: true,
    };

    localStorage.setItem('test-prefix:config', JSON.stringify(legacyConfig));

    // Should fallback to default delay (0)
    const config = storage.getGlobalConfig();
    expect(config.defaults.delay).toBe(0); // Falls back to DEFAULT_RULE_DEFAULTS.delay
  });

  it('removes defaultDelay from saved config', () => {
    // Save a config with legacy defaultDelay
    storage.saveGlobalConfig({ enabled: false, defaultDelay: 123 } as any);

    // Stored config should not have defaultDelay
    const stored = JSON.parse(localStorage.getItem('test-prefix:config') || '{}');
    expect(stored.defaultDelay).toBeUndefined();
    expect(stored.defaults.delay).toBe(123); // Migrated to defaults.delay
  });

  it('handles new GlobalConfig format correctly', () => {
    // Store new format config with defaults
    const newConfig = {
      enabled: true,
      position: 'bottom-left',
      theme: 'light',
      keyboardShortcuts: true,
      defaults: {
        delay: 1000,
        mockType: 'networkError',
        failRate: 50,
        timeout: true,
        offline: false,
        business: {
          errNo: 500,
          errMsg: 'Test error',
          detailErrMsg: 'Detailed test error',
        },
      },
    };

    localStorage.setItem('test-prefix:config', JSON.stringify(newConfig));

    // getGlobalConfig should return it as-is
    const config = storage.getGlobalConfig();

    expect(config.enabled).toBe(true);
    expect(config.position).toBe('bottom-left');
    expect(config.theme).toBe('light');
    expect(config.defaults.delay).toBe(1000);
    expect(config.defaults.mockType).toBe('networkError');
    expect(config.defaults.failRate).toBe(50);
    expect(config.defaults.timeout).toBe(true);
    expect(config.defaults.business.errNo).toBe(500);
  });
});
