import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import RuleEditor from '../RuleEditor.svelte';
import {
  activeRuleDraft,
  editorUiState,
  initEditor,
  resetEditor,
  setActiveTab
} from '../../../stores/ruleEditor';
import type { MockRule } from '@error-mock/core';

describe('RuleEditor Container', () => {
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

  beforeEach(() => {
    resetEditor();
  });

  describe('Component Rendering', () => {
    it('renders without crashing with null draft', () => {
      render(RuleEditor);
      // Component should handle null draft gracefully
      expect(document.body).toBeTruthy();
    });

    it('renders with initialized draft', () => {
      initEditor(mockRule, false);
      render(RuleEditor);
      expect(document.body).toBeTruthy();
    });
  });

  describe('Control Bar Switching', () => {
    it('renders RuleControlBar in single mode', () => {
      initEditor(mockRule, false);
      render(RuleEditor);

      // Check for RuleControlBar specific elements
      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByText('Response')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('renders BatchControlBar in batch mode', () => {
      initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]);
      render(RuleEditor);

      // Check for BatchControlBar specific elements
      expect(screen.getByText('Batch Editing')).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it('switches control bar when mode changes', async () => {
      initEditor(mockRule, false);
      const { rerender } = render(RuleEditor);

      // Should show RuleControlBar
      expect(screen.getByText('Network')).toBeInTheDocument();

      // Switch to batch mode
      editorUiState.update(state => ({ ...state, isBatchMode: true, selectedCount: 2 }));
      await rerender({});

      // Should show BatchControlBar
      expect(screen.getByText('Batch Editing')).toBeInTheDocument();
    });
  });

  describe('Tab Content Rendering', () => {
    it('renders network tab content by default', () => {
      initEditor(mockRule, false);
      render(RuleEditor);

      // Default tab should be network
      expect(get(editorUiState).activeTab).toBe('network');
      expect(screen.getByText('Network Tab Content')).toBeInTheDocument();
    });

    it('renders response tab content when switched', async () => {
      initEditor(mockRule, false);
      const { rerender } = render(RuleEditor);

      setActiveTab('response');
      await rerender({});

      expect(get(editorUiState).activeTab).toBe('response');
      expect(screen.getByText('Response Tab Content')).toBeInTheDocument();
    });

    it('renders advanced tab content when switched', async () => {
      initEditor(mockRule, false);
      const { rerender } = render(RuleEditor);

      setActiveTab('advanced');
      await rerender({});

      expect(get(editorUiState).activeTab).toBe('advanced');
      expect(screen.getByText('Advanced Tab Content')).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('binds to activeRuleDraft store', () => {
      resetEditor(); // Ensure clean state
      initEditor(mockRule, false);
      render(RuleEditor);

      const draft = get(activeRuleDraft);
      expect(draft).not.toBeNull();
      expect(draft?.id).toBe('test-api');
    });

    it('binds to editorUiState store', () => {
      resetEditor(); // Ensure clean state
      initEditor(mockRule, false);
      render(RuleEditor);

      const uiState = get(editorUiState);
      expect(uiState.isBatchMode).toBe(false);
      expect(uiState.activeTab).toBe('network');
    });

    it('responds to store updates', async () => {
      initEditor(mockRule, false);
      const { rerender } = render(RuleEditor);

      // Update tab via store
      setActiveTab('response');
      await rerender({});

      expect(screen.getByText('Response Tab Content')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('emits cancelBatch event from BatchControlBar', async () => {
      initEditor(mockRule, true, 3, [mockRule1, mockRule2, mockRule3]);
      const { component } = render(RuleEditor);

      const mockHandler = vi.fn();
      component.$on('cancelBatch', mockHandler);

      // Click cancel batch button
      const cancelBtn = screen.getByText('Cancel Batch');
      await cancelBtn.click();

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Layout Structure', () => {
    it('has correct container structure', () => {
      initEditor(mockRule, false);
      const { container } = render(RuleEditor);

      // Should have main container
      const mainDiv = container.querySelector('.em-flex.em-flex-col.em-h-full');
      expect(mainDiv).toBeTruthy();
    });

    it('maintains flex layout for scrolling', () => {
      initEditor(mockRule, false);
      const { container } = render(RuleEditor);

      // Should have overflow-auto content area
      const contentArea = container.querySelector('.em-flex-1.em-overflow-auto');
      expect(contentArea).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles null draft gracefully', () => {
      // Don't initialize editor
      expect(() => render(RuleEditor)).not.toThrow();
    });

    it('handles rapid tab switching', async () => {
      initEditor(mockRule, false);
      const { rerender } = render(RuleEditor);

      setActiveTab('response');
      await rerender({});
      setActiveTab('advanced');
      await rerender({});
      setActiveTab('network');
      await rerender({});

      expect(get(editorUiState).activeTab).toBe('network');
      expect(screen.getByText('Network Tab Content')).toBeInTheDocument();
    });

    it('handles mode switching with tab preservation', async () => {
      initEditor(mockRule, false);
      const { rerender } = render(RuleEditor);

      setActiveTab('response');
      await rerender({});

      // Switch to batch mode
      editorUiState.update(state => ({ ...state, isBatchMode: true, selectedCount: 2 }));
      await rerender({});

      // Tab should remain on response
      expect(get(editorUiState).activeTab).toBe('response');
    });
  });
});
