import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { tick } from 'svelte';
import BatchControlBar from '../BatchControlBar.svelte';
import {
  activeRuleDraft,
  editorUiState,
  resetEditor,
  initEditor,
  MIXED
} from '../../../../stores/ruleEditor';
import type { MockRule } from '@error-mock/core';

describe('BatchControlBar', () => {
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

  const mockRule1: MockRule = {
    id: 'test-module-test-api-1',
    url: '/api/test/1',
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
    id: 'test-module-test-api-2',
    url: '/api/test/2',
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
    id: 'test-module-test-api-3',
    url: '/api/test/3',
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
    initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]); // Initialize in batch mode with 3 selected items
  });

  describe('Batch Context Display', () => {
    it('renders batch editing title', () => {
      render(BatchControlBar);

      expect(screen.getByText('Batch Editing')).toBeInTheDocument();
    });

    it('displays stack icon', () => {
      const { container } = render(BatchControlBar);

      // Check for the icon container
      const iconContainer = container.querySelector('.em-rounded-full.em-bg-white');
      expect(iconContainer).toBeInTheDocument();

      // Check for SVG icon
      const svg = iconContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows selected items count', () => {
      render(BatchControlBar);

      expect(screen.getByText(/Modifying/)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/selected items/)).toBeInTheDocument();
    });

    it('updates count when store changes', async () => {
      render(BatchControlBar);

      // Update store
      editorUiState.update(state => ({ ...state, selectedCount: 5 }));
      await tick();

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Enable All Toggle', () => {
    it('renders Enable All toggle switch', () => {
      render(BatchControlBar);

      const toggle = screen.getByRole('checkbox');
      expect(toggle).toBeInTheDocument();
    });

    it('displays Enable All label', () => {
      render(BatchControlBar);

      expect(screen.getByText('Enable All')).toBeInTheDocument();
    });

    it('reflects current enabled state', () => {
      render(BatchControlBar);

      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });

    it('updates draft when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(BatchControlBar);

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      const draft = get(activeRuleDraft);
      expect(draft?.enabled).toBe(false);
    });

    it('marks enabled field as dirty when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(BatchControlBar);

      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);

      const uiState = get(editorUiState);
      expect(uiState.dirtyFields.has('enabled')).toBe(true);
    });

    it('syncs toggle state with store', async () => {
      render(BatchControlBar);

      // Update store directly
      activeRuleDraft.update(draft => draft ? { ...draft, enabled: false } : draft);
      await tick();

      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });

    it('should default MIXED to true when toggling', () => {
      // Initialize with MIXED value
      initEditor(mockRule, true, 2, [mockRule1, mockRule2]);

      // Set enabled to MIXED manually
      activeRuleDraft.update(draft => {
        if (!draft) return draft;
        return { ...draft, enabled: MIXED };
      });

      const { getByRole } = render(BatchControlBar);
      const toggle = getByRole('checkbox');

      // Toggle should set to true (not false) when value is MIXED
      fireEvent.click(toggle);

      const draft = get(activeRuleDraft);
      expect(draft?.enabled).toBe(true);

      // Dirty field should be marked
      const ui = get(editorUiState);
      expect(ui.dirtyFields.has('enabled')).toBe(true);
    });
  });

  describe('Cancel Batch Button', () => {
    it('renders Cancel Batch button', () => {
      render(BatchControlBar);

      const cancelButton = screen.getByText('Cancel Batch');
      expect(cancelButton).toBeInTheDocument();
    });

    it('has red color styling', () => {
      render(BatchControlBar);

      const cancelButton = screen.getByText('Cancel Batch');
      expect(cancelButton).toHaveClass('em-text-[#CF222E]');
    });

    it('has aria-label for accessibility', () => {
      render(BatchControlBar);

      const cancelButton = screen.getByLabelText('Cancel batch selection');
      expect(cancelButton).toBeInTheDocument();
    });

    it('emits cancelBatch event when clicked', async () => {
      const user = userEvent.setup();
      const { component } = render(BatchControlBar);

      const mockHandler = vi.fn();
      component.$on('cancelBatch', mockHandler);

      const cancelButton = screen.getByText('Cancel Batch');
      await user.click(cancelButton);

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Layout and Styling', () => {
    it('renders with sticky positioning', () => {
      const { container } = render(BatchControlBar);

      const bar = container.querySelector('.em-sticky.em-top-0');
      expect(bar).toBeInTheDocument();
    });

    it('has blue background styling', () => {
      const { container } = render(BatchControlBar);

      const bar = container.querySelector('.em-bg-blue-50');
      expect(bar).toBeInTheDocument();
    });

    it('has blue border styling', () => {
      const { container } = render(BatchControlBar);

      const bar = container.querySelector('.em-border-blue-200');
      expect(bar).toBeInTheDocument();
    });

    it('has proper z-index for stacking', () => {
      const { container } = render(BatchControlBar);

      const bar = container.querySelector('.em-z-10');
      expect(bar).toBeInTheDocument();
    });

    it('has shadow for depth', () => {
      const { container } = render(BatchControlBar);

      const bar = container.querySelector('.em-shadow-sm');
      expect(bar).toBeInTheDocument();
    });
  });

  describe('Interactive Elements Layout', () => {
    it('renders batch info on the left', () => {
      const { container } = render(BatchControlBar);

      const batchInfo = container.querySelector('.em-flex.em-items-center.em-gap-3');
      expect(batchInfo).toBeInTheDocument();

      // Should contain icon and text
      expect(batchInfo?.querySelector('svg')).toBeInTheDocument();
      expect(batchInfo?.textContent).toContain('Batch Editing');
    });

    it('renders actions on the right', () => {
      render(BatchControlBar);

      const toggle = screen.getByRole('checkbox');
      const cancelButton = screen.getByText('Cancel Batch');

      expect(toggle).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles for interactive elements', () => {
      render(BatchControlBar);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel batch selection')).toBeInTheDocument();
    });

    it('toggle is keyboard accessible', () => {
      render(BatchControlBar);

      const toggle = screen.getByRole('checkbox');
      expect(toggle).toBeInTheDocument();
      expect(toggle.tagName).toBe('INPUT');
    });

    it('cancel button is keyboard accessible', () => {
      render(BatchControlBar);

      const cancelButton = screen.getByText('Cancel Batch').closest('button');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton?.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('handles null draft gracefully', () => {
      resetEditor();

      expect(() => render(BatchControlBar)).not.toThrow();
    });

    it('handles zero selected count', () => {
      editorUiState.update(state => ({ ...state, selectedCount: 0 }));

      render(BatchControlBar);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles large selected count', () => {
      editorUiState.update(state => ({ ...state, selectedCount: 999 }));

      render(BatchControlBar);

      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('updates when store changes externally', async () => {
      render(BatchControlBar);

      // Simulate external update
      activeRuleDraft.update(draft => draft ? { ...draft, enabled: false } : draft);
      await tick();

      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });
  });

  describe('Visual Indicators', () => {
    it('displays blue accent color for selected count', () => {
      render(BatchControlBar);

      const countElement = screen.getByText('3');
      expect(countElement).toHaveClass('em-font-bold');
      expect(countElement).toHaveClass('em-text-[#0969DA]');
    });

    it('icon has blue color', () => {
      const { container } = render(BatchControlBar);

      const iconContainer = container.querySelector('.em-rounded-full.em-bg-white');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('em-text-[#0969DA]');
    });
  });
});
