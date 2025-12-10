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
  setActiveTab
} from '../ruleEditor';
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
    initEditor(mockRule, true);
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
    initEditor(mockRule, true, 3);
    const state = get(editorUiState);
    expect(state.isBatchMode).toBe(true);
    expect(state.selectedCount).toBe(3);
  });

  it('maintains separate dirty fields for different fields', () => {
    initEditor(mockRule, true);
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

    updateDraft({ mockType: 'error' });

    expect(get(activeRuleDraft)).toBeNull();
  });
});
