import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { tick } from 'svelte';
import RuleControlBar from '../RuleControlBar.svelte';
import {
  activeRuleDraft,
  editorUiState,
  resetEditor,
  initEditor
} from '../../../../stores/ruleEditor';
import type { MockRule } from '@error-mock/core';

describe('RuleControlBar', () => {
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
    initEditor(mockRule, false);
  });

  describe('Tab Navigation', () => {
    it('renders all three tabs', () => {
      render(RuleControlBar);

      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByText('Response')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('highlights Network tab by default', () => {
      render(RuleControlBar);

      const networkTab = screen.getByText('Network').closest('button');
      expect(networkTab).toHaveClass('em-bg-[#F6F8FA]');
      expect(networkTab).toHaveClass('em-text-[#1F2328]');
    });

    it('switches active tab when clicked', async () => {
      render(RuleControlBar);

      const responseTab = screen.getByText('Response');
      await fireEvent.click(responseTab);

      const state = get(editorUiState);
      expect(state.activeTab).toBe('response');
    });

    it('highlights active tab correctly', async () => {
      render(RuleControlBar);

      const advancedTab = screen.getByText('Advanced');
      await fireEvent.click(advancedTab);

      const advancedButton = advancedTab.closest('button');
      expect(advancedButton).toHaveClass('em-bg-[#F6F8FA]');
      expect(advancedButton).toHaveClass('em-text-[#1F2328]');
    });
  });

  describe('Mock Type Dropdown', () => {
    it('renders mock type dropdown', () => {
      render(RuleControlBar);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
    });

    it('displays current mockType value', () => {
      render(RuleControlBar);

      const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
      expect(dropdown.value).toBe('success');
    });

    it('shows all mock type options', () => {
      render(RuleControlBar);

      const networkErrorOption = screen.getByRole('option', { name: 'Network Error' }) as HTMLOptionElement;
      const businessErrorOption = screen.getByRole('option', { name: 'Business Error' }) as HTMLOptionElement;
      const successOption = screen.getByRole('option', { name: 'Success' }) as HTMLOptionElement;
      const noneOption = screen.getByRole('option', { name: 'None' }) as HTMLOptionElement;

      expect(networkErrorOption.value).toBe('networkError');
      expect(businessErrorOption.value).toBe('businessError');
      expect(successOption.value).toBe('success');
      expect(noneOption.value).toBe('none');
    });

    it('updates draft when mockType changes', async () => {
      render(RuleControlBar);

      const dropdown = screen.getByRole('combobox');
      await fireEvent.change(dropdown, { target: { value: 'businessError' } });

      const draft = get(activeRuleDraft);
      expect(draft?.mockType).toBe('businessError');
    });
  });

  describe('Enable Toggle', () => {
    it('renders enable toggle switch', () => {
      render(RuleControlBar);

      const toggle = screen.getByRole('checkbox');
      expect(toggle).toBeInTheDocument();
    });

    it('displays Enable label', () => {
      render(RuleControlBar);

      expect(screen.getByText('Enable')).toBeInTheDocument();
    });

    it('reflects current enabled state', () => {
      render(RuleControlBar);

      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });

    it('updates draft when toggle is clicked', async () => {
      render(RuleControlBar);

      const toggle = screen.getByRole('checkbox');
      await fireEvent.click(toggle);

      const draft = get(activeRuleDraft);
      expect(draft?.enabled).toBe(false);
    });

    it('syncs toggle state with store', async () => {
      const { component } = render(RuleControlBar);

      // Update store directly
      activeRuleDraft.update(draft => draft ? { ...draft, enabled: false } : draft);
      await tick();

      const toggle = screen.getByRole('checkbox') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });
  });

  describe('Layout', () => {
    it('renders control bar with correct structure', () => {
      const { container } = render(RuleControlBar);

      const controlBar = container.querySelector('.em-shrink-0.em-border-b.em-bg-white');
      expect(controlBar).toBeInTheDocument();
    });

    it('has tabs on the left side', () => {
      const { container } = render(RuleControlBar);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav?.children.length).toBe(3);
    });

    it('has controls on the right side', () => {
      render(RuleControlBar);

      const dropdown = screen.getByRole('combobox');
      const toggle = screen.getByRole('checkbox');

      expect(dropdown).toBeInTheDocument();
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles for interactive elements', () => {
      render(RuleControlBar);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('tab buttons are keyboard accessible', async () => {
      render(RuleControlBar);

      const networkTab = screen.getByText('Network').closest('button');
      expect(networkTab).toBeInTheDocument();
      expect(networkTab?.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('handles null draft gracefully', () => {
      resetEditor();

      expect(() => render(RuleControlBar)).not.toThrow();
    });

    it('updates when store changes externally', async () => {
      render(RuleControlBar);

      // Simulate external update
      activeRuleDraft.update(draft => draft ? { ...draft, mockType: 'networkError' } : draft);
      await tick();

      const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
      expect(dropdown.value).toBe('networkError');
    });
  });
});
