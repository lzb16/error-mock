import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import ResponseTab from '../ResponseTab.svelte';
import { initEditor, activeRuleDraft, editorUiState, resetEditor } from '../../../../stores/ruleEditor';
import { createDefaultRule } from '../../../../stores/rules';

describe('ResponseTab.svelte', () => {
  const mockRule = createDefaultRule({
    module: 'test',
    name: 'api',
    url: '/test',
    method: 'GET'
  });

  beforeEach(() => {
    resetEditor();
  });

  it('should show Business Error form when mockType is businessError', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    expect(getByLabelText('Error Code')).toBeInTheDocument();
    expect(getByLabelText('Error Message')).toBeInTheDocument();
  });

  it('should show Success info card when mockType is success', () => {
    mockRule.mockType = 'success';
    initEditor(mockRule, false);

    const { getByText } = render(ResponseTab);
    expect(getByText(/Success Mode/i)).toBeInTheDocument();
    expect(getByText(/returns the default successful response/i)).toBeInTheDocument();
  });

  it('should show Network Error info card when mockType is networkError', () => {
    mockRule.mockType = 'networkError';
    initEditor(mockRule, false);

    const { getByText } = render(ResponseTab);
    expect(getByText(/Network Error Mode/i)).toBeInTheDocument();
  });

  it('should update errNo and mark field dirty', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    const input = getByLabelText('Error Code');

    fireEvent.input(input, { target: { value: '404' } });

    const draft = get(activeRuleDraft);
    expect(draft?.business.errNo).toBe(404);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('business.errNo')).toBe(true);
  });

  it('should update errMsg and mark field dirty', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    const input = getByLabelText('Error Message');

    fireEvent.input(input, { target: { value: 'Not Found' } });

    const draft = get(activeRuleDraft);
    expect(draft?.business.errMsg).toBe('Not Found');

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('business.errMsg')).toBe(true);
  });

  it('should update detailErrMsg and mark field dirty', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    const textarea = getByLabelText('Detail Error Message');

    fireEvent.input(textarea, { target: { value: 'Resource not found in database' } });

    const draft = get(activeRuleDraft);
    expect(draft?.business.detailErrMsg).toBe('Resource not found in database');

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('business.detailErrMsg')).toBe(true);
  });
});
