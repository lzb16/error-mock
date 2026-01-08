// {{RIPER-10 Action}}
// Role: QA | Task_ID: 8477c882-f723-4ecf-aa8d-e8071e9096a0 | Time: 2025-12-21T02:56:15+08:00
// Principle: SOLID-O (开闭原则)
// Taste: 用小而清晰的 store 单测固定“模板 patch + 规范化 + 深拷贝”契约

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useResponseTemplatesStore } from '../useResponsePresetsStore';

describe('useResponseTemplatesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useResponseTemplatesStore.setState({ templatesByRuleId: {} });
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('adds template with name sanitization and err message normalization', () => {
    const { addTemplate, getTemplates } = useResponseTemplatesStore.getState();

    const ruleId = 'rule-1';
    const originalResult = { nested: { v: 1 } };
    const patch = {
      errNo: 0,
      errMsg: '   ',
      detailErrMsg: undefined,
      result: originalResult,
    };

    const created = addTemplate(ruleId, { name: '  My Template  ', patch });

    expect(created.name).toBe('My Template');
    expect(created.patch.errNo).toBe(0);
    expect(created.patch.errMsg).toBe('');
    expect(created.patch.detailErrMsg).toBe('');
    expect(created.patch.result).toEqual({ nested: { v: 1 } });

    // Deep clone: mutating original input should not affect stored template
    originalResult.nested.v = 2;
    const stored = getTemplates(ruleId)[0];
    expect(stored.patch.result).toEqual({ nested: { v: 1 } });
  });

  it('gets templates and template by id', () => {
    const { addTemplate, getTemplates, getTemplate } = useResponseTemplatesStore.getState();

    const ruleId = 'rule-2';
    expect(getTemplates(ruleId)).toEqual([]);
    expect(getTemplate(ruleId, 'missing')).toBeUndefined();

    const created = addTemplate(ruleId, {
      name: 'A',
      patch: { errNo: 1, errMsg: 'x', detailErrMsg: 'y', result: { ok: true } },
    });

    expect(getTemplates(ruleId)).toHaveLength(1);
    expect(getTemplate(ruleId, created.id)?.name).toBe('A');
  });

  it('updates template patch and updatedAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const { addTemplate, updateTemplate, getTemplate } = useResponseTemplatesStore.getState();
    const ruleId = 'rule-3';
    const created = addTemplate(ruleId, {
      name: 'A',
      patch: { errNo: 0, errMsg: '', detailErrMsg: '', result: { v: 1 } },
    });

    vi.setSystemTime(new Date('2025-01-01T00:00:01Z'));
    updateTemplate(ruleId, created.id, {
      errNo: 2,
      errMsg: ' ok ',
      detailErrMsg: '  ',
      result: { v: 2 },
    });

    const updated = getTemplate(ruleId, created.id)!;
    expect(updated.patch.errNo).toBe(2);
    expect(updated.patch.errMsg).toBe('ok');
    expect(updated.patch.detailErrMsg).toBe('');
    expect(updated.patch.result).toEqual({ v: 2 });
    expect(updated.updatedAt).toBeGreaterThan(created.updatedAt);
  });

  it('renames template and ignores blank names', () => {
    const { addTemplate, renameTemplate, getTemplate } = useResponseTemplatesStore.getState();

    const ruleId = 'rule-4';
    const created = addTemplate(ruleId, {
      name: 'Old',
      patch: { errNo: 0, errMsg: '', detailErrMsg: '', result: {} },
    });

    renameTemplate(ruleId, created.id, '   ');
    expect(getTemplate(ruleId, created.id)?.name).toBe('Old');

    renameTemplate(ruleId, created.id, ' New ');
    expect(getTemplate(ruleId, created.id)?.name).toBe('New');
  });

  it('deletes template and removes ruleId key when empty', () => {
    const { addTemplate, deleteTemplate } = useResponseTemplatesStore.getState();

    const ruleId = 'rule-5';
    const created = addTemplate(ruleId, {
      name: 'A',
      patch: { errNo: 0, errMsg: '', detailErrMsg: '', result: {} },
    });

    deleteTemplate(ruleId, created.id);
    expect(useResponseTemplatesStore.getState().templatesByRuleId[ruleId]).toBeUndefined();
  });

  it('migrates legacy presetsByRuleId state to templatesByRuleId', () => {
    const { migrate } = (useResponseTemplatesStore as any).persist.getOptions();

    const legacy = {
      presetsByRuleId: {
        'rule-legacy': [
          {
            id: 'preset-1',
            name: 'Legacy Preset',
            response: {
              status: 200,
              errNo: 7,
              errMsg: 'legacy',
              detailErrMsg: '',
              result: { v: 1 },
              errorBody: undefined,
            },
            createdAt: 1,
            updatedAt: 2,
          },
        ],
      },
    };

    const migrated = migrate(legacy);
    expect(migrated.templatesByRuleId['rule-legacy']).toHaveLength(1);
    expect(migrated.templatesByRuleId['rule-legacy'][0]).toMatchObject({
      id: 'preset-1',
      name: 'Legacy Preset',
      patch: {
        errNo: 7,
        errMsg: 'legacy',
        detailErrMsg: '',
        result: { v: 1 },
      },
      createdAt: 1,
      updatedAt: 2,
    });
  });
});

