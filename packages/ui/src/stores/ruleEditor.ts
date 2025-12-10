import { writable, derived } from 'svelte/store';
import type { MockRule } from '@error-mock/core';
import fastDeepEqual from 'fast-deep-equal';
import { MIXED, type MixedValue } from './rules';

// Recursive partial type for deep updates
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<unknown>
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

// Draft type that supports MIXED values for batch editing
export type RuleDraft = Omit<
  MockRule,
  'enabled' | 'mockType' | 'network' | 'business' | 'response' | 'fieldOmit'
> & {
  enabled: MixedValue<boolean>;
  mockType: MixedValue<MockRule['mockType']>;
  network: {
    delay: MixedValue<number>;
    timeout: MixedValue<boolean>;
    offline: MixedValue<boolean>;
    failRate: MixedValue<number>;
  };
  business: {
    errNo: MixedValue<number>;
    errMsg: MixedValue<string>;
    detailErrMsg: MixedValue<string>;
  };
  response: {
    useDefault: MixedValue<boolean>;
    customResult: MixedValue<unknown>;
  };
  fieldOmit: {
    enabled: MixedValue<boolean>;
    mode: MixedValue<MockRule['fieldOmit']['mode']>;
    fields: MixedValue<string[]>;
    random: {
      probability: MixedValue<number>;
      maxOmitCount: MixedValue<number>;
      excludeFields: MixedValue<string[]>;
      depthLimit: MixedValue<number>;
      omitMode: MixedValue<MockRule['fieldOmit']['random']['omitMode']>;
      seed?: MixedValue<number | undefined>;
    };
  };
};

// 当前编辑的草稿（深拷贝，避免直接修改原始数据）
export const activeRuleDraft = writable<RuleDraft | null>(null);

// 原始rule引用（用于检测变更）
let originalRule: RuleDraft | null = null;

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

// Helper: Check if a value is MIXED
export function isMixed<T>(value: MixedValue<T>): value is typeof MIXED {
  return value === MIXED;
}

// Helper: Deep clone a value
function deepCloneValue<T>(value: T): T {
  const cloneFn = (globalThis as any).structuredClone;
  if (typeof cloneFn === 'function') {
    try {
      return cloneFn(value);
    } catch {
      // Fall back to JSON clone
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

// Helper: Compute mixed value from multiple rules
function computeMixedValue<T>(rules: MockRule[], selector: (rule: MockRule) => T): MixedValue<T> {
  if (rules.length === 0) {
    return MIXED as MixedValue<T>;
  }

  const first = selector(rules[0]);
  const allSame = rules.every(rule => fastDeepEqual(selector(rule), first));

  return allSame ? (deepCloneValue(first) as MixedValue<T>) : (MIXED as MixedValue<T>);
}

// Helper: Build draft for batch mode with MIXED detection
function buildBatchDraft(rules: MockRule[]): RuleDraft {
  const baseline = rules[0];

  return {
    id: baseline.id,
    url: baseline.url,
    method: baseline.method,
    enabled: computeMixedValue(rules, rule => rule.enabled),
    mockType: computeMixedValue(rules, rule => rule.mockType),
    network: {
      delay: computeMixedValue(rules, rule => rule.network.delay),
      timeout: computeMixedValue(rules, rule => rule.network.timeout),
      offline: computeMixedValue(rules, rule => rule.network.offline),
      failRate: computeMixedValue(rules, rule => rule.network.failRate)
    },
    business: {
      errNo: computeMixedValue(rules, rule => rule.business.errNo),
      errMsg: computeMixedValue(rules, rule => rule.business.errMsg),
      detailErrMsg: computeMixedValue(rules, rule => rule.business.detailErrMsg)
    },
    response: {
      useDefault: computeMixedValue(rules, rule => rule.response.useDefault),
      customResult: computeMixedValue(rules, rule => rule.response.customResult)
    },
    fieldOmit: {
      enabled: computeMixedValue(rules, rule => rule.fieldOmit.enabled),
      mode: computeMixedValue(rules, rule => rule.fieldOmit.mode),
      fields: computeMixedValue(rules, rule => rule.fieldOmit.fields),
      random: {
        probability: computeMixedValue(rules, rule => rule.fieldOmit.random.probability),
        maxOmitCount: computeMixedValue(rules, rule => rule.fieldOmit.random.maxOmitCount),
        excludeFields: computeMixedValue(rules, rule => rule.fieldOmit.random.excludeFields),
        depthLimit: computeMixedValue(rules, rule => rule.fieldOmit.random.depthLimit),
        omitMode: computeMixedValue(rules, rule => rule.fieldOmit.random.omitMode),
        seed: computeMixedValue(rules, rule => rule.fieldOmit.random.seed)
      }
    }
  };
}

// Helper: Clone a single rule to draft format
function cloneRule(rule: MockRule): RuleDraft {
  return deepCloneValue(rule) as RuleDraft;
}

// Helper: Resolve value for deep merge, handling MIXED and undefined
function resolveValue<T>(original: T, updated: T | undefined | typeof MIXED): T {
  // If update is undefined, keep original
  if (updated === undefined) return original;
  // If update is MIXED (batch mode), keep original variance
  if (updated === MIXED) return original;
  // Otherwise use updated value
  return updated;
}

// Deep merge helpers for nested objects
function mergeNetwork(
  current: RuleDraft['network'],
  updates?: DeepPartial<RuleDraft['network']>
): RuleDraft['network'] {
  if (!updates) return current;
  return {
    delay: resolveValue(current.delay, updates.delay),
    timeout: resolveValue(current.timeout, updates.timeout),
    offline: resolveValue(current.offline, updates.offline),
    failRate: resolveValue(current.failRate, updates.failRate)
  };
}

function mergeBusiness(
  current: RuleDraft['business'],
  updates?: DeepPartial<RuleDraft['business']>
): RuleDraft['business'] {
  if (!updates) return current;
  return {
    errNo: resolveValue(current.errNo, updates.errNo),
    errMsg: resolveValue(current.errMsg, updates.errMsg),
    detailErrMsg: resolveValue(current.detailErrMsg, updates.detailErrMsg)
  };
}

function mergeResponse(
  current: RuleDraft['response'],
  updates?: DeepPartial<RuleDraft['response']>
): RuleDraft['response'] {
  if (!updates) return current;
  return {
    useDefault: resolveValue(current.useDefault, updates.useDefault),
    customResult: resolveValue(current.customResult, updates.customResult)
  };
}

function mergeFieldOmitRandom(
  current: RuleDraft['fieldOmit']['random'],
  updates?: DeepPartial<RuleDraft['fieldOmit']['random']>
): RuleDraft['fieldOmit']['random'] {
  if (!updates) return current;
  return {
    probability: resolveValue(current.probability, updates.probability),
    maxOmitCount: resolveValue(current.maxOmitCount, updates.maxOmitCount),
    excludeFields: resolveValue(current.excludeFields, updates.excludeFields),
    depthLimit: resolveValue(current.depthLimit, updates.depthLimit),
    omitMode: resolveValue(current.omitMode, updates.omitMode),
    seed: resolveValue(current.seed, updates.seed)
  };
}

function mergeFieldOmit(
  current: RuleDraft['fieldOmit'],
  updates?: DeepPartial<RuleDraft['fieldOmit']>
): RuleDraft['fieldOmit'] {
  if (!updates) return current;
  return {
    enabled: resolveValue(current.enabled, updates.enabled),
    mode: resolveValue(current.mode, updates.mode),
    fields: resolveValue(current.fields, updates.fields),
    random: mergeFieldOmitRandom(current.random, updates.random)
  };
}

// Deep merge draft with updates
function mergeRuleDraft(current: RuleDraft, updates: DeepPartial<RuleDraft>): RuleDraft {
  return {
    id: resolveValue(current.id, updates.id),
    url: resolveValue(current.url, updates.url),
    method: resolveValue(current.method, updates.method),
    enabled: resolveValue(current.enabled, updates.enabled),
    mockType: resolveValue(current.mockType, updates.mockType),
    network: mergeNetwork(current.network, updates.network),
    business: mergeBusiness(current.business, updates.business),
    response: mergeResponse(current.response, updates.response),
    fieldOmit: mergeFieldOmit(current.fieldOmit, updates.fieldOmit)
  };
}

// 初始化Editor
export function initEditor(rule: MockRule, isBatch: boolean, selectedCount = 0, batchRules?: MockRule[]) {
  // 批量模式下传入所有选中的规则以检测MIXED值
  const rulesForDraft = isBatch && batchRules?.length ? batchRules : (isBatch ? [] : [rule]);
  if (rulesForDraft.length === 0) {
    resetEditor();
    return;
  }

  const draft = isBatch ? buildBatchDraft(rulesForDraft) : cloneRule(rule);

  activeRuleDraft.set(draft);
  // 单选模式下用于深度对比；批量模式依赖dirtyFields
  originalRule = isBatch ? null : cloneRule(rule);

  editorUiState.update(state => ({
    ...state,
    isBatchMode: isBatch,
    selectedCount: selectedCount || rulesForDraft.length,
    dirtyFields: new Set()
  }));
}

// 更新草稿
export function updateDraft(updates: DeepPartial<RuleDraft>) {
  activeRuleDraft.update(draft => {
    if (!draft) return draft;
    return mergeRuleDraft(draft, updates);
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
