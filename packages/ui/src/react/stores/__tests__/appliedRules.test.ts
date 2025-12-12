import { describe, it, expect, beforeEach } from 'vitest';
import { useRulesStore } from '../useRulesStore';
import type { ApiMeta, MockRule } from '@error-mock/core';

describe('appliedRules separation', () => {
  const mockApiMeta: ApiMeta = {
    module: 'test',
    name: 'getUser',
    url: '/api/user',
    method: 'GET',
  };

  beforeEach(() => {
    useRulesStore.setState({
      apiMetas: [],
      mockRules: new Map(),
      appliedRules: new Map(),
      selectedId: null,
      searchQuery: '',
    });
  });

  it('should keep mockRules and appliedRules separate on updateRule', () => {
    const { createRule, updateRule, getRuleForApi } = useRulesStore.getState();

    // Create a rule (auto-applied)
    const rule = createRule(mockApiMeta);

    // Verify both maps have the rule
    expect(useRulesStore.getState().mockRules.get(rule.id)).toEqual(rule);
    expect(useRulesStore.getState().appliedRules.get(rule.id)).toEqual(rule);

    // Update rule (draft edit)
    const draftRule: MockRule = { ...rule, enabled: true, mockType: 'networkError' };
    updateRule(draftRule);

    // mockRules should have the draft
    expect(useRulesStore.getState().mockRules.get(rule.id)?.enabled).toBe(true);
    expect(useRulesStore.getState().mockRules.get(rule.id)?.mockType).toBe('networkError');

    // appliedRules should still have the original
    expect(useRulesStore.getState().appliedRules.get(rule.id)?.enabled).toBe(false);
    expect(useRulesStore.getState().appliedRules.get(rule.id)?.mockType).toBe('none');
  });

  it('should sync both maps on applyRule', () => {
    const { createRule, updateRule, applyRule } = useRulesStore.getState();

    // Create a rule
    const rule = createRule(mockApiMeta);

    // Update rule (draft)
    const draftRule: MockRule = { ...rule, enabled: true, mockType: 'networkError' };
    updateRule(draftRule);

    // Apply the draft
    applyRule(draftRule);

    // Both maps should now have the applied version
    expect(useRulesStore.getState().mockRules.get(rule.id)?.enabled).toBe(true);
    expect(useRulesStore.getState().appliedRules.get(rule.id)?.enabled).toBe(true);
    expect(useRulesStore.getState().mockRules.get(rule.id)?.mockType).toBe('networkError');
    expect(useRulesStore.getState().appliedRules.get(rule.id)?.mockType).toBe('networkError');
  });

  it('should sync both maps on createRule', () => {
    const { createRule } = useRulesStore.getState();

    // Create a rule
    const rule = createRule(mockApiMeta);

    // Both maps should have the new rule
    expect(useRulesStore.getState().mockRules.get(rule.id)).toEqual(rule);
    expect(useRulesStore.getState().appliedRules.get(rule.id)).toEqual(rule);
  });

  it('should load rules into both maps', () => {
    const { loadRules, setApiMetas } = useRulesStore.getState();

    // Mock localStorage with a saved rule
    const savedRule: MockRule = {
      id: 'test-getUser',
      url: '/api/user',
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
        random: {
          probability: 0,
          maxOmitCount: 0,
          excludeFields: [],
          depthLimit: 5,
          omitMode: 'delete',
        },
      },
    };

    localStorage.setItem('error-mock:rules', JSON.stringify([savedRule]));

    // Load rules
    loadRules();

    // Both maps should have the loaded rule
    expect(useRulesStore.getState().mockRules.get(savedRule.id)).toEqual(savedRule);
    expect(useRulesStore.getState().appliedRules.get(savedRule.id)).toEqual(savedRule);

    // Cleanup
    localStorage.removeItem('error-mock:rules');
  });

  it('should count active mocks from appliedRules, not mockRules', () => {
    const { createRule, updateRule, applyRule, activeMockCount } = useRulesStore.getState();

    // Create a rule (disabled)
    const rule = createRule(mockApiMeta);
    expect(activeMockCount()).toBe(0);

    // Update to enable (draft only)
    const draftRule: MockRule = { ...rule, enabled: true, mockType: 'networkError' };
    updateRule(draftRule);

    // Active count should NOT include draft edits (only reflects appliedRules)
    expect(activeMockCount()).toBe(0);

    // Apply the draft
    applyRule(draftRule);

    // Now count should include it
    expect(activeMockCount()).toBe(1);
  });
});
