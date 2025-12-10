import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import NetworkTab from '../NetworkTab.svelte';
import { initEditor, activeRuleDraft, editorUiState, resetEditor } from '../../../../stores/ruleEditor';
import { createDefaultRule } from '../../../../stores/rules';

describe('NetworkTab.svelte', () => {
  const mockRule = createDefaultRule({
    module: 'test',
    name: 'api',
    url: '/test',
    method: 'GET'
  });

  beforeEach(() => {
    resetEditor();
  });

  it('should render delay input with current value', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const delayInput = getByLabelText('Delay') as HTMLInputElement;

    expect(delayInput.value).toBe('0');
  });

  it('should update draft and mark field dirty when delay changes', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const delayInput = getByLabelText('Delay');

    fireEvent.input(delayInput, { target: { value: '500' } });

    // Verify draft updated
    const draft = get(activeRuleDraft);
    expect(draft?.network.delay).toBe(500);

    // Verify field marked dirty
    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.delay')).toBe(true);
  });

  it('should render failure rate slider with current value', () => {
    mockRule.network.failRate = 0.3;
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const slider = getByLabelText('Failure Rate') as HTMLInputElement;

    expect(slider.value).toBe('0.3');
  });

  it('should update draft and mark field dirty when failure rate changes', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const slider = getByLabelText('Failure Rate');

    fireEvent.input(slider, { target: { value: '0.7' } });

    const draft = get(activeRuleDraft);
    expect(draft?.network.failRate).toBe(0.7);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.failRate')).toBe(true);
  });

  it('should display failure rate percentage in badge', () => {
    mockRule.network.failRate = 0.25;
    initEditor(mockRule, false);

    const { getByText } = render(NetworkTab);
    expect(getByText('25%')).toBeInTheDocument();
  });

  it('should render timeout checkbox with current value', () => {
    mockRule.network.timeout = true;
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Timeout') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });

  it('should update draft and mark field dirty when timeout toggles', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Timeout') as HTMLInputElement;

    // Manually set checked and fire change event
    checkbox.checked = true;
    fireEvent.change(checkbox);

    const draft = get(activeRuleDraft);
    expect(draft?.network.timeout).toBe(true);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.timeout')).toBe(true);
  });

  it('should render offline checkbox with current value', () => {
    mockRule.network.offline = true;
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Offline') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });

  it('should update draft and mark field dirty when offline toggles', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Offline') as HTMLInputElement;

    // Manually set checked and fire change event
    checkbox.checked = true;
    fireEvent.change(checkbox);

    const draft = get(activeRuleDraft);
    expect(draft?.network.offline).toBe(true);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.offline')).toBe(true);
  });

  it('should handle batch mode with MIXED values', () => {
    const rule1 = createDefaultRule({ module: 'test', name: 'api1', url: '/api1', method: 'GET' });
    const rule2 = { ...rule1, network: { ...rule1.network, delay: 200 } };

    initEditor(rule1, true, 2, [rule1, rule2]);

    const { getByLabelText } = render(NetworkTab);
    const delayInput = getByLabelText('Delay') as HTMLInputElement;

    // MIXED value should display as empty placeholder
    expect(delayInput.placeholder).toBe('(Mixed)');
  });
});
