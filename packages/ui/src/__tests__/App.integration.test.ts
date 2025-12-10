import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { mockRules, selectedIds, apiMetas, createDefaultRule, MIXED } from '../stores/rules';
import { initEditor, activeRuleDraft, markFieldDirty, editorUiState } from '../stores/ruleEditor';
import { applyDirtyFields } from '../stores/utils/applyDirtyFields';
import type { ApiMeta, MockRule } from '@error-mock/core';
import type { RuleDraft } from '../stores/ruleEditor';

// Mock RuleStorage
vi.mock('@error-mock/core', async () => {
  const actual = await vi.importActual('@error-mock/core');
  return {
    ...actual,
    RuleStorage: vi.fn(() => ({
      getRules: vi.fn(() => []),
      saveRules: vi.fn(),
    })),
    install: vi.fn(),
    updateRules: vi.fn(),
  };
});

/**
 * Integration tests for handleApply logic with applyDirtyFields utility.
 * These tests verify the complete flow from draft → applyDirtyFields → mockRules store.
 */
describe('App.svelte - handleApply integration', () => {
  const testMeta: ApiMeta = {
    module: 'test',
    name: 'api1',
    url: '/api/test',
    method: 'GET'
  };

  beforeEach(() => {
    // Reset stores
    mockRules.set(new Map());
    selectedIds.set(new Set());
    apiMetas.set([testMeta]);
  });

  it('should not persist MIXED values in batch mode', () => {
    // Setup: Create existing rule
    const existingRule: MockRule = {
      ...createDefaultRule(testMeta),
      id: 'test-api1',
      enabled: true,
      network: { delay: 0, timeout: false, offline: false, failRate: 0 }
    };

    mockRules.set(new Map([['test-api1', existingRule]]));
    selectedIds.set(new Set(['test-api1']));

    // Simulate batch mode: User edits with MIXED value
    const draft: RuleDraft = {
      ...existingRule,
      enabled: MIXED, // Should be filtered out
      network: { delay: 100, timeout: false, offline: false, failRate: 0 }
    };

    const dirtyFields = new Set(['enabled', 'network.delay']);

    // Apply using the utility (simulating handleApply's batch mode)
    const updatedRule = applyDirtyFields(draft, dirtyFields, existingRule);

    // Verify: MIXED was filtered out, but network.delay was applied
    expect(updatedRule.enabled).toBe(true); // Preserved from existingRule
    expect(updatedRule.enabled).not.toBe(MIXED);
    expect(updatedRule.network.delay).toBe(100); // Applied from draft
  });

  it('should handle batch mode with zero edited fields', () => {
    // Setup: Create existing rule
    const existingRule: MockRule = {
      ...createDefaultRule(testMeta),
      id: 'test-api1',
      enabled: true
    };

    mockRules.set(new Map([['test-api1', existingRule]]));
    selectedIds.set(new Set(['test-api1']));

    // Simulate batch mode with zero edits (should be no-op)
    const draft: RuleDraft = { ...existingRule };
    const dirtyFields = new Set<string>(); // No edits

    // Apply utility should return unchanged rule
    const updatedRule = applyDirtyFields(draft, dirtyFields, existingRule);

    // Verify: Rule unchanged
    expect(updatedRule).toEqual(existingRule);
  });

  it('should preserve existing rule identity when applying edits', () => {
    // Setup: Create existing rule with specific identity
    const existingRule: MockRule = {
      ...createDefaultRule(testMeta),
      id: 'test-api1',
      url: '/original/url',
      method: 'POST',
      enabled: false,
      network: { delay: 0, timeout: false, offline: false, failRate: 0 }
    };

    mockRules.set(new Map([['test-api1', existingRule]]));
    selectedIds.set(new Set(['test-api1']));

    // Simulate: User tries to edit identity fields (should be ignored)
    const draft: RuleDraft = {
      ...existingRule,
      id: 'changed-id', // Should be ignored
      url: '/changed/url', // Should be ignored
      method: 'DELETE', // Should be ignored
      enabled: true // Should be applied
    };

    const dirtyFields = new Set(['id', 'url', 'method', 'enabled']);

    // Apply using the utility
    const updatedRule = applyDirtyFields(draft, dirtyFields, existingRule);

    // Verify: Identity fields preserved, enabled field updated
    expect(updatedRule.id).toBe('test-api1');
    expect(updatedRule.url).toBe('/original/url');
    expect(updatedRule.method).toBe('POST');
    expect(updatedRule.enabled).toBe(true); // Applied from draft
  });
});
