import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore } from '../useConfigStore';
import { useRulesStore } from '../useRulesStore';
import { useToastStore } from '../useToastStore';
import { DEFAULT_GLOBAL_CONFIG, type ApiMeta } from '@error-mock/core';

describe('useConfigStore', () => {
  beforeEach(() => {
    useConfigStore.setState({
      globalConfig: DEFAULT_GLOBAL_CONFIG,
      isModalOpen: false,
      isMinimized: false,
    });
  });

  it('should have default config', () => {
    const { globalConfig } = useConfigStore.getState();
    expect(globalConfig.enabled).toBe(true);
    expect(globalConfig.position).toBe('bottom-right');
  });

  it('should toggle modal', () => {
    const { toggleModal } = useConfigStore.getState();
    expect(useConfigStore.getState().isModalOpen).toBe(false);
    toggleModal();
    expect(useConfigStore.getState().isModalOpen).toBe(true);
    toggleModal();
    expect(useConfigStore.getState().isModalOpen).toBe(false);
  });

  it('should update config', () => {
    const { setConfig } = useConfigStore.getState();
    setConfig({ theme: 'dark' });
    expect(useConfigStore.getState().globalConfig.theme).toBe('dark');
  });
});

describe('useRulesStore', () => {
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

  it('should create default rule', () => {
    const { getRuleForApi } = useRulesStore.getState();
    const rule = getRuleForApi(mockApiMeta);
    expect(rule.id).toBe('test-getUser');
    expect(rule.mockType).toBe('none');
    expect(rule.enabled).toBe(false);
  });

  it('should set selected ID', () => {
    const { setSelectedId } = useRulesStore.getState();
    setSelectedId('test-id');
    expect(useRulesStore.getState().selectedId).toBe('test-id');
  });

  it('should filter metas by search query', () => {
    const { setApiMetas, setSearchQuery, filteredMetas } = useRulesStore.getState();
    setApiMetas([
      mockApiMeta,
      { module: 'test', name: 'getProduct', url: '/api/product', method: 'GET' },
    ]);
    setSearchQuery('user');
    expect(filteredMetas()).toHaveLength(1);
    expect(filteredMetas()[0].name).toBe('getUser');
  });

  it('should count active mocks', () => {
    const { applyRule, activeMockCount, getRuleForApi } = useRulesStore.getState();
    const rule = getRuleForApi(mockApiMeta);
    // Apply the rule to sync to appliedRules
    applyRule({ ...rule, enabled: true, mockType: 'networkError' });
    expect(activeMockCount()).toBe(1);
  });
});

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('should add toast', () => {
    const { addToast } = useToastStore.getState();
    const id = addToast('Test message', 'success');
    expect(id).toBeTruthy();
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].message).toBe('Test message');
    expect(useToastStore.getState().toasts[0].type).toBe('success');
  });

  it('should dismiss toast', () => {
    const { addToast, dismissToast } = useToastStore.getState();
    const id = addToast('Test', 'info');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    dismissToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    const { addToast, clearToasts } = useToastStore.getState();
    addToast('Test 1', 'info');
    addToast('Test 2', 'error');
    expect(useToastStore.getState().toasts).toHaveLength(2);
    clearToasts();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
