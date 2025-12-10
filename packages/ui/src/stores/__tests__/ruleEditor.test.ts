import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  activeRuleDraft,
  editorUiState,
  hasUnsavedChanges,
  resetEditor,
  initEditor,
  updateDraft,
  markFieldDirty,
  setActiveTab,
  isMixed
} from '../ruleEditor';
import { MIXED } from '../rules';
import type { MockRule } from '@error-mock/core';

describe('ruleEditor Store', () => {
  const mockRule: MockRule = {
    id: 'test-module-test-api',
    url: '/api/test',
    method: 'GET',
    enabled: true,
    mockType: 'success',
    network: {
      delay: 100,
      timeout: false,
      offline: false,
      failRate: 0
    },
    business: {
      errNo: 0,
      errMsg: '',
      detailErrMsg: ''
    },
    response: {
      useDefault: true,
      customResult: null
    },
    fieldOmit: {
      enabled: false,
      mode: 'manual',
      fields: [],
      random: {
        probability: 0,
        maxOmitCount: 0,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete'
      }
    }
  };

  beforeEach(() => {
    resetEditor();
  });

  it('initializes with null draft', () => {
    expect(get(activeRuleDraft)).toBeNull();
  });

  it('initializes UI state correctly', () => {
    const state = get(editorUiState);
    expect(state.activeTab).toBe('network');
    expect(state.isBatchMode).toBe(false);
    expect(state.selectedCount).toBe(0);
    expect(state.dirtyFields.size).toBe(0);
  });

  it('initializes draft from rule', () => {
    initEditor(mockRule, false);
    const draft = get(activeRuleDraft);
    expect(draft).toEqual(mockRule);
    expect(draft).not.toBe(mockRule); // deep clone
  });

  it('updates draft field', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { ...mockRule.network, delay: 200 } });
    expect(get(activeRuleDraft)?.network.delay).toBe(200);
  });

  it('marks field as dirty', () => {
    initEditor(mockRule, false);
    markFieldDirty('network.delay');
    const state = get(editorUiState);
    expect(state.dirtyFields.has('network.delay')).toBe(true);
  });

  it('detects unsaved changes in single mode', () => {
    initEditor(mockRule, false);
    expect(get(hasUnsavedChanges)).toBe(false);

    updateDraft({ network: { ...mockRule.network, delay: 200 } });
    expect(get(hasUnsavedChanges)).toBe(true);
  });

  it('detects unsaved changes in batch mode', () => {
    initEditor(mockRule, true, 1, [mockRule]);
    expect(get(hasUnsavedChanges)).toBe(false);

    markFieldDirty('network.delay');
    expect(get(hasUnsavedChanges)).toBe(true);
  });

  it('resets editor clears all state', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { ...mockRule.network, delay: 200 } });
    markFieldDirty('network.delay');

    resetEditor();

    expect(get(activeRuleDraft)).toBeNull();
    expect(get(editorUiState).dirtyFields.size).toBe(0);
  });

  it('handles batch mode with selectedCount', () => {
    initEditor(mockRule, true, 3, [mockRule, mockRule, mockRule]);
    const state = get(editorUiState);
    expect(state.isBatchMode).toBe(true);
    expect(state.selectedCount).toBe(3);
  });

  it('maintains separate dirty fields for different fields', () => {
    initEditor(mockRule, true, 1, [mockRule]);
    markFieldDirty('network.delay');
    markFieldDirty('mockType');

    const state = get(editorUiState);
    expect(state.dirtyFields.size).toBe(2);
    expect(state.dirtyFields.has('network.delay')).toBe(true);
    expect(state.dirtyFields.has('mockType')).toBe(true);
  });

  it('does not detect changes when draft equals original', () => {
    initEditor(mockRule, false);

    // Update and then restore to original value
    updateDraft({ network: { ...mockRule.network, delay: 200 } });
    expect(get(hasUnsavedChanges)).toBe(true);

    updateDraft({ network: { ...mockRule.network, delay: 100 } });
    expect(get(hasUnsavedChanges)).toBe(false);
  });

  it('switches active tab', () => {
    const state = get(editorUiState);
    expect(state.activeTab).toBe('network');

    setActiveTab('response');
    expect(get(editorUiState).activeTab).toBe('response');

    setActiveTab('advanced');
    expect(get(editorUiState).activeTab).toBe('advanced');
  });

  it('hasUnsavedChanges returns false when draft is null', () => {
    resetEditor();
    expect(get(activeRuleDraft)).toBeNull();
    expect(get(hasUnsavedChanges)).toBe(false);
  });

  it('updateDraft returns draft unchanged when draft is null', () => {
    resetEditor();
    expect(get(activeRuleDraft)).toBeNull();

    updateDraft({ mockType: 'networkError' });

    expect(get(activeRuleDraft)).toBeNull();
  });

  describe('MIXED value support', () => {
    const mockRule2: MockRule = {
      id: 'test-module-test-api2',
      url: '/api/test2',
      method: 'POST',
      enabled: false,
      mockType: 'businessError',
      network: {
        delay: 200,
        timeout: true,
        offline: false,
        failRate: 10
      },
      business: {
        errNo: 500,
        errMsg: 'Error',
        detailErrMsg: 'Detail error'
      },
      response: {
        useDefault: false,
        customResult: { data: 'custom' }
      },
      fieldOmit: {
        enabled: true,
        mode: 'random',
        fields: ['field1'],
        random: {
          probability: 0.5,
          maxOmitCount: 3,
          excludeFields: ['exclude1'],
          depthLimit: 10,
          omitMode: 'null'
        }
      }
    };

    it('detects MIXED values in batch mode with different enabled states', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(draft).not.toBeNull();
      expect(isMixed(draft!.enabled)).toBe(true);
    });

    it('detects MIXED values for different mockType', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.mockType)).toBe(true);
    });

    it('detects MIXED values for different network settings', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.network.delay)).toBe(true);
      expect(isMixed(draft!.network.timeout)).toBe(true);
      expect(isMixed(draft!.network.failRate)).toBe(true);
    });

    it('preserves common values when all rules have same value', () => {
      // Both rules have offline: false
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.network.offline)).toBe(false);
      expect(draft!.network.offline).toBe(false);
    });

    it('detects MIXED values for business config', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.business.errNo)).toBe(true);
      expect(isMixed(draft!.business.errMsg)).toBe(true);
      expect(isMixed(draft!.business.detailErrMsg)).toBe(true);
    });

    it('detects MIXED values for response config', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.response.useDefault)).toBe(true);
      expect(isMixed(draft!.response.customResult)).toBe(true);
    });

    it('detects MIXED values for fieldOmit config', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.fieldOmit.enabled)).toBe(true);
      expect(isMixed(draft!.fieldOmit.mode)).toBe(true);
      expect(isMixed(draft!.fieldOmit.fields)).toBe(true);
    });

    it('detects MIXED values for fieldOmit.random settings', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.fieldOmit.random.probability)).toBe(true);
      expect(isMixed(draft!.fieldOmit.random.maxOmitCount)).toBe(true);
      expect(isMixed(draft!.fieldOmit.random.excludeFields)).toBe(true);
      expect(isMixed(draft!.fieldOmit.random.depthLimit)).toBe(true);
      expect(isMixed(draft!.fieldOmit.random.omitMode)).toBe(true);
    });

    it('handles batch mode with identical rules (no MIXED values)', () => {
      const mockRule3 = JSON.parse(JSON.stringify(mockRule));
      initEditor(mockRule, true, 2, [mockRule, mockRule3]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.enabled)).toBe(false);
      expect(isMixed(draft!.mockType)).toBe(false);
      expect(isMixed(draft!.network.delay)).toBe(false);
      expect(draft!.enabled).toBe(true);
      expect(draft!.mockType).toBe('success');
      expect(draft!.network.delay).toBe(100);
    });

    it('allows updating MIXED value to concrete value', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);
      const draft = get(activeRuleDraft);

      expect(isMixed(draft!.enabled)).toBe(true);

      updateDraft({ enabled: true });
      const updatedDraft = get(activeRuleDraft);

      expect(isMixed(updatedDraft!.enabled)).toBe(false);
      expect(updatedDraft!.enabled).toBe(true);
    });

    it('isMixed returns false for concrete values', () => {
      expect(isMixed(true)).toBe(false);
      expect(isMixed(false)).toBe(false);
      expect(isMixed(100)).toBe(false);
      expect(isMixed('test')).toBe(false);
      expect(isMixed(null)).toBe(false);
      expect(isMixed(undefined)).toBe(false);
      expect(isMixed({ key: 'value' })).toBe(false);
    });

    it('isMixed returns true for MIXED symbol', () => {
      expect(isMixed(MIXED)).toBe(true);
    });

    it('handles empty batchRules array by resetting editor', () => {
      initEditor(mockRule, true, 0, []);

      expect(get(activeRuleDraft)).toBeNull();
      expect(get(editorUiState).isBatchMode).toBe(false);
      expect(get(editorUiState).selectedCount).toBe(0);
    });

    it('handles single rule in batch mode', () => {
      initEditor(mockRule, true, 1, [mockRule]);
      const draft = get(activeRuleDraft);

      // Single rule should have no MIXED values
      expect(isMixed(draft!.enabled)).toBe(false);
      expect(isMixed(draft!.mockType)).toBe(false);
      expect(draft!.enabled).toBe(true);
      expect(draft!.mockType).toBe('success');
    });

    it('deep clones rule values to prevent mutation', () => {
      const rule1 = { ...mockRule };
      const rule2 = { ...mockRule2 };

      initEditor(rule1, true, 2, [rule1, rule2]);

      const draft = get(activeRuleDraft);
      updateDraft({ network: { delay: 999, timeout: false, offline: false, failRate: 0 } });

      // Original rules should not be modified
      expect(rule1.network.delay).toBe(100);
      expect(rule2.network.delay).toBe(200);
    });

    it('sets originalRule to null in batch mode', () => {
      initEditor(mockRule, true, 2, [mockRule, mockRule2]);

      // In batch mode, originalRule should be null since we use dirtyFields
      // We can verify this indirectly: hasUnsavedChanges should only depend on dirtyFields
      expect(get(hasUnsavedChanges)).toBe(false);

      // Update draft but don't mark field as dirty
      updateDraft({ enabled: false });

      // Still no unsaved changes in batch mode without dirtyFields
      expect(get(hasUnsavedChanges)).toBe(false);

      // Now mark field as dirty
      markFieldDirty('enabled');
      expect(get(hasUnsavedChanges)).toBe(true);
    });
  });
});
