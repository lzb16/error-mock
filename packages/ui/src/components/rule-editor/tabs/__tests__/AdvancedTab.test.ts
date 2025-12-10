import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import AdvancedTab from '../AdvancedTab.svelte';
import { initEditor, activeRuleDraft, editorUiState, resetEditor } from '../../../../stores/ruleEditor';
import { createDefaultRule } from '../../../../stores/rules';

describe('AdvancedTab.svelte', () => {
  const mockRule = createDefaultRule({
    module: 'test',
    name: 'api',
    url: '/test',
    method: 'GET'
  });

  beforeEach(() => {
    resetEditor();
  });

  it('should render Field Omission toggle with current value', () => {
    mockRule.fieldOmit.enabled = true;
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const toggle = getByLabelText('Enable Field Omission') as HTMLInputElement;

    expect(toggle.checked).toBe(true);
  });

  it('should update draft and mark field dirty when Field Omission toggle changes', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const toggle = getByLabelText('Enable Field Omission');

    // For checkbox, we need to fire a change event with the checked state
    fireEvent.click(toggle);
    fireEvent.change(toggle, { target: { checked: true } });

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.enabled).toBe(true);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.enabled')).toBe(true);
  });

  it('should render mode selector with current value', () => {
    mockRule.fieldOmit.mode = 'random';
    initEditor(mockRule, false);

    const { getByText } = render(AdvancedTab);
    // The active button should have active styling
    expect(getByText('Random')).toBeInTheDocument();
    expect(getByText('Manual')).toBeInTheDocument();
  });

  it('should update draft and mark field dirty when mode changes', () => {
    mockRule.fieldOmit.mode = 'manual';
    initEditor(mockRule, false);

    const { getByText } = render(AdvancedTab);
    const randomButton = getByText('Random');

    fireEvent.click(randomButton);

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.mode).toBe('random');

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.mode')).toBe(true);
  });

  it('should render manual fields input when mode is manual', () => {
    mockRule.fieldOmit.mode = 'manual';
    mockRule.fieldOmit.fields = ['user.password', 'meta.internal_id'];
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Fields to Omit') as HTMLInputElement;

    expect(input.value).toBe('user.password, meta.internal_id');
  });

  it('should update draft and mark field dirty when manual fields change', () => {
    mockRule.fieldOmit.mode = 'manual';
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Fields to Omit');

    fireEvent.input(input, { target: { value: 'user.email, user.phone' } });

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.fields).toEqual(['user.email', 'user.phone']);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.fields')).toBe(true);
  });

  it('should render random mode probability slider when mode is random', () => {
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.probability = 0.3;
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const slider = getByLabelText('Omission Probability') as HTMLInputElement;

    expect(slider.value).toBe('0.3');
  });

  it('should update draft and mark field dirty when probability changes', () => {
    mockRule.fieldOmit.mode = 'random';
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const slider = getByLabelText('Omission Probability');

    fireEvent.input(slider, { target: { value: '0.5' } });

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.random.probability).toBe(0.5);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.random.probability')).toBe(true);
  });

  it('should render random mode maxOmitCount input', () => {
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.maxOmitCount = 5;
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Max Omit Count') as HTMLInputElement;

    expect(input.value).toBe('5');
  });

  it('should update draft and mark field dirty when maxOmitCount changes', () => {
    mockRule.fieldOmit.mode = 'random';
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Max Omit Count');

    fireEvent.input(input, { target: { value: '10' } });

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.random.maxOmitCount).toBe(10);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.random.maxOmitCount')).toBe(true);
  });

  it('should render random mode excludeFields textarea', () => {
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.excludeFields = ['id', 'created_at'];
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const textarea = getByLabelText('Exclude Fields') as HTMLTextAreaElement;

    expect(textarea.value).toBe('id, created_at');
  });

  it('should update draft and mark field dirty when excludeFields changes', () => {
    mockRule.fieldOmit.mode = 'random';
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const textarea = getByLabelText('Exclude Fields');

    fireEvent.input(textarea, { target: { value: 'id, timestamp, version' } });

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.random.excludeFields).toEqual(['id', 'timestamp', 'version']);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.random.excludeFields')).toBe(true);
  });

  it('should render random mode depthLimit input', () => {
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.depthLimit = 3;
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Depth Limit') as HTMLInputElement;

    expect(input.value).toBe('3');
  });

  it('should update draft and mark field dirty when depthLimit changes', () => {
    mockRule.fieldOmit.mode = 'random';
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Depth Limit');

    fireEvent.input(input, { target: { value: '5' } });

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.random.depthLimit).toBe(5);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.random.depthLimit')).toBe(true);
  });

  it('should render random mode omitMode selector', () => {
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.omitMode = 'delete';
    initEditor(mockRule, false);

    const { getByText } = render(AdvancedTab);
    expect(getByText('Delete')).toBeInTheDocument();
    expect(getByText('Null')).toBeInTheDocument();
  });

  it('should update draft and mark field dirty when omitMode changes', () => {
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.omitMode = 'delete';
    initEditor(mockRule, false);

    const { getByText } = render(AdvancedTab);
    const nullButton = getByText('Null');

    fireEvent.click(nullButton);

    const draft = get(activeRuleDraft);
    expect(draft?.fieldOmit.random.omitMode).toBe('null');

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('fieldOmit.random.omitMode')).toBe(true);
  });

  it('should handle MIXED values in batch mode', () => {
    const rule1 = createDefaultRule({ module: 'test', name: 'api1', url: '/api1', method: 'GET' });
    rule1.fieldOmit.enabled = true;
    const rule2 = createDefaultRule({ module: 'test', name: 'api2', url: '/api2', method: 'GET' });
    rule2.fieldOmit.enabled = false;

    initEditor(rule1, true, 2, [rule1, rule2]);

    const { getByLabelText } = render(AdvancedTab);
    const toggle = getByLabelText('Enable Field Omission') as HTMLInputElement;

    // MIXED value should show as unchecked
    expect(toggle.checked).toBe(false);
  });

  it('should display disabled info card when Field Omission is disabled', () => {
    mockRule.fieldOmit.enabled = false;
    initEditor(mockRule, false);

    const { getByText } = render(AdvancedTab);
    expect(getByText('Field Omission Disabled')).toBeInTheDocument();
    expect(getByText(/Enable Field Omission to simulate missing or incomplete response data/i)).toBeInTheDocument();
  });

  it('should not display mode selector when Field Omission is disabled', () => {
    mockRule.fieldOmit.enabled = false;
    initEditor(mockRule, false);

    const { queryByText } = render(AdvancedTab);
    expect(queryByText('Manual')).not.toBeInTheDocument();
    expect(queryByText('Random')).not.toBeInTheDocument();
  });

  it('should handle empty manual fields string', () => {
    mockRule.fieldOmit.enabled = true;
    mockRule.fieldOmit.mode = 'manual';
    mockRule.fieldOmit.fields = [];
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const input = getByLabelText('Fields to Omit') as HTMLInputElement;

    expect(input.value).toBe('');
  });

  it('should handle empty excludeFields string', () => {
    mockRule.fieldOmit.enabled = true;
    mockRule.fieldOmit.mode = 'random';
    mockRule.fieldOmit.random.excludeFields = [];
    initEditor(mockRule, false);

    const { getByLabelText } = render(AdvancedTab);
    const textarea = getByLabelText('Exclude Fields') as HTMLTextAreaElement;

    expect(textarea.value).toBe('');
  });
});
