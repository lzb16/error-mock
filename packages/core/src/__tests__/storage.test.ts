import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuleStorage } from '../storage/local';
import type { MockRule } from '../types';
import {
  DEFAULT_FIELD_OMIT_CONFIG,
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_NETWORK_CONFIG,
  DEFAULT_RESPONSE_CONFIG,
  STORAGE_SCHEMA_VERSION,
} from '../constants';

describe('RuleStorage', () => {
  const storage = new RuleStorage('test-prefix');

  const createRule = (id: string): MockRule => ({
    id,
    url: `/api/${id}`,
    method: 'GET',
    enabled: true,
    response: { ...DEFAULT_RESPONSE_CONFIG },
    network: { ...DEFAULT_NETWORK_CONFIG },
    fieldOmit: { ...DEFAULT_FIELD_OMIT_CONFIG },
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
    storage.saveGlobalConfig({ enabled: false, networkProfile: 'slow3g' });

    const exported = storage.exportConfig();
    storage.clear();

    expect(storage.getRules()).toEqual([]);

    storage.importConfig(exported);
    expect(storage.getRules()).toEqual(rules);
    expect(storage.getGlobalConfig().enabled).toBe(false);
    expect(storage.getGlobalConfig().networkProfile).toBe('slow3g');
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
    expect(config).toEqual(DEFAULT_GLOBAL_CONFIG);
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
      JSON.stringify({ version: STORAGE_SCHEMA_VERSION, rules: [invalidRule] })
    );

    // getRules should normalize the invalid method to GET
    const retrieved = storage.getRules();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].method).toBe('GET');
  });

  it('clears rules when storage schema version is outdated', () => {
    localStorage.setItem('test-prefix:rules', JSON.stringify({ version: 999, rules: [createRule('test1')] }));
    expect(storage.getRules()).toEqual([]);
    expect(localStorage.getItem('test-prefix:rules')).toBeNull();
  });

  it('ignores unknown legacy fields in config', () => {
    localStorage.setItem(
      'test-prefix:config',
      JSON.stringify({
        enabled: false,
        position: 'top-left',
        theme: 'dark',
        keyboardShortcuts: false,
        defaultDelay: 500, // legacy field (ignored)
      })
    );

    const config = storage.getGlobalConfig();
    expect(config).toEqual({
      enabled: false,
      position: 'top-left',
      theme: 'dark',
      keyboardShortcuts: false,
      networkProfile: DEFAULT_GLOBAL_CONFIG.networkProfile,
    });
  });
});
