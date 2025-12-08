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
      defaultDelay: 0,
      position: 'bottom-right',
      theme: 'system',
      keyboardShortcuts: true,
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
});
