import { writable, derived } from 'svelte/store';
import type { MockRule } from '@error-mock/core';
import fastDeepEqual from 'fast-deep-equal';

// 当前编辑的草稿（深拷贝，避免直接修改原始数据）
export const activeRuleDraft = writable<MockRule | null>(null);

// 原始rule引用（用于检测变更）
let originalRule: MockRule | null = null;

// UI状态
export interface EditorUiState {
  activeTab: 'network' | 'response' | 'advanced';
  isBatchMode: boolean;
  selectedCount: number;
  dirtyFields: Set<string>;
}

export const editorUiState = writable<EditorUiState>({
  activeTab: 'network',
  isBatchMode: false,
  selectedCount: 0,
  dirtyFields: new Set()
});

// 派生Store: 检测未保存的变更
export const hasUnsavedChanges = derived(
  [editorUiState, activeRuleDraft],
  ([$ui, $draft]) => {
    if (!$draft) return false;

    // 批量模式：只要有dirtyFields就算有变更
    if ($ui.isBatchMode) {
      return $ui.dirtyFields.size > 0;
    }

    // 单选模式：深度对比
    return !fastDeepEqual($draft, originalRule);
  }
);

// 初始化Editor
export function initEditor(rule: MockRule, isBatch: boolean, selectedCount = 0) {
  // 深拷贝rule
  const draft = JSON.parse(JSON.stringify(rule));

  activeRuleDraft.set(draft);
  originalRule = JSON.parse(JSON.stringify(rule));

  editorUiState.update(state => ({
    ...state,
    isBatchMode: isBatch,
    selectedCount,
    dirtyFields: new Set()
  }));
}

// 更新草稿
export function updateDraft(updates: Partial<MockRule>) {
  activeRuleDraft.update(draft => {
    if (!draft) return draft;
    return { ...draft, ...updates };
  });
}

// 标记字段为dirty（批量模式使用）
export function markFieldDirty(field: string) {
  editorUiState.update(state => {
    const newDirtyFields = new Set(state.dirtyFields);
    newDirtyFields.add(field);
    return { ...state, dirtyFields: newDirtyFields };
  });
}

// 重置Editor
export function resetEditor() {
  activeRuleDraft.set(null);
  originalRule = null;
  editorUiState.set({
    activeTab: 'network',
    isBatchMode: false,
    selectedCount: 0,
    dirtyFields: new Set()
  });
}

// 切换Tab
export function setActiveTab(tab: EditorUiState['activeTab']) {
  editorUiState.update(state => ({ ...state, activeTab: tab }));
}
