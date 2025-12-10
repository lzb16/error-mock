import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Footer from '../Footer.svelte';
import {
  initEditor,
  updateDraft,
  resetEditor,
  markFieldDirty
} from '../../../stores/ruleEditor';
import type { MockRule } from '@error-mock/core';

describe('Modal Footer', () => {
  const mockRule: MockRule = {
    id: 'test-api',
    url: '/test',
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

  const mockRule1: MockRule = {
    id: 'test-api-1',
    url: '/test/1',
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

  const mockRule2: MockRule = {
    id: 'test-api-2',
    url: '/test/2',
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

  const mockRule3: MockRule = {
    id: 'test-api-3',
    url: '/test/3',
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

  it('does not render when hasUnsavedChanges is false', () => {
    resetEditor();

    const { container } = render(Footer);

    expect(container.querySelector('footer')).not.toBeInTheDocument();
  });

  it('renders when hasUnsavedChanges is true (single mode)', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } }); // Create unsaved changes

    render(Footer);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays warning message for unsaved changes in single mode', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } });

    render(Footer);

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('displays Cancel and Apply buttons', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } });

    render(Footer);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('emits cancel event when Cancel button clicked', async () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } });

    const { component } = render(Footer);
    const mockHandler = vi.fn();
    component.$on('cancel', mockHandler);

    const user = userEvent.setup();
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(mockHandler).toHaveBeenCalledOnce();
  });

  it('emits apply event when Apply button clicked', async () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } });

    const { component } = render(Footer);
    const mockHandler = vi.fn();
    component.$on('apply', mockHandler);

    const user = userEvent.setup();
    const applyBtn = screen.getByRole('button', { name: /apply/i });
    await user.click(applyBtn);

    expect(mockHandler).toHaveBeenCalledOnce();
  });

  it('displays correct text in single mode', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } });

    render(Footer);

    expect(screen.getByRole('button', { name: /apply changes/i })).toBeInTheDocument();
  });

  it('displays correct text in batch mode', () => {
    initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]);
    markFieldDirty('delay');

    render(Footer);

    expect(screen.getByText(/pending changes for 3 items/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply to 3 selected/i })).toBeInTheDocument();
  });

  it('displays warning icon in single mode', () => {
    initEditor(mockRule, false);
    updateDraft({ network: { delay: 200, timeout: false, offline: false, failRate: 0 } });

    const { container } = render(Footer);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders when hasUnsavedChanges is true (batch mode)', () => {
    initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]);
    markFieldDirty('delay'); // Create dirty field

    render(Footer);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays blue dot indicator in batch mode', () => {
    initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]);
    markFieldDirty('delay');

    const { container } = render(Footer);

    const blueDot = container.querySelector('.em-bg-\\[\\#0969DA\\]');
    expect(blueDot).toBeInTheDocument();
  });

  it('appears when enabled field is marked dirty in batch mode', () => {
    initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]);
    markFieldDirty('enabled');

    render(Footer);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(/pending changes for 3 items/i)).toBeInTheDocument();
  });
});
