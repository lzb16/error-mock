// {{RIPER-10 Action}}
// Role: LD | Task_ID: 7b9ed8c9-2a23-4cfb-af6a-a14da5171dee | Time: 2025-12-21T02:56:15+08:00
// Principle: SOLID-O (开闭原则)
// Taste: 用“模板 patch（errNo+result）”替代整份 ResponseConfig 预设，并统一做字符串规范化与深拷贝

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ResponseConfig } from '@error-mock/core';

export interface BusinessResponseTemplatePatchInput {
  errNo: number;
  errMsg?: string;
  detailErrMsg?: string;
  /**
   * Optional: when present, applying the template also updates `response.result`.
   * Allow explicit `null`.
   */
  result?: unknown;
}

export interface BusinessResponseTemplatePatch {
  errNo: number;
  errMsg: string;
  detailErrMsg: string;
  result?: unknown;
}

export interface ApiBusinessResponseTemplate {
  id: string;
  name: string;
  patch: BusinessResponseTemplatePatch;
  createdAt: number;
  updatedAt: number;
}

interface ResponseTemplatesState {
  templatesByRuleId: Record<string, ApiBusinessResponseTemplate[]>;
  getTemplates: (ruleId: string) => ApiBusinessResponseTemplate[];
  getTemplate: (
    ruleId: string,
    templateId: string
  ) => ApiBusinessResponseTemplate | undefined;
  addTemplate: (
    ruleId: string,
    template: Pick<ApiBusinessResponseTemplate, 'name'> & {
      patch: BusinessResponseTemplatePatchInput;
    }
  ) => ApiBusinessResponseTemplate;
  updateTemplate: (
    ruleId: string,
    templateId: string,
    patch: BusinessResponseTemplatePatchInput
  ) => void;
  renameTemplate: (ruleId: string, templateId: string, name: string) => void;
  deleteTemplate: (ruleId: string, templateId: string) => void;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `preset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeMessage(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, 60);
}

function normalizePatch(input: BusinessResponseTemplatePatchInput): BusinessResponseTemplatePatch {
  const normalized: BusinessResponseTemplatePatch = {
    errNo: input.errNo,
    errMsg: normalizeMessage(input.errMsg),
    detailErrMsg: normalizeMessage(input.detailErrMsg),
  };

  if ('result' in input) {
    normalized.result = cloneJson(input.result);
  }

  return normalized;
}

function patchFromResponseConfig(response: ResponseConfig): BusinessResponseTemplatePatch {
  return normalizePatch({
    errNo: response.errNo,
    errMsg: response.errMsg,
    detailErrMsg: response.detailErrMsg,
    result: response.result,
  });
}

export const useResponseTemplatesStore = create<ResponseTemplatesState>()(
  persist(
    (set, get) => ({
      templatesByRuleId: {},

      getTemplates: (ruleId) => get().templatesByRuleId[ruleId] ?? [],

      getTemplate: (ruleId, templateId) =>
        get().templatesByRuleId[ruleId]?.find((t) => t.id === templateId),

      addTemplate: (ruleId, template) => {
        const nextTemplate: ApiBusinessResponseTemplate = {
          id: createId(),
          name: sanitizeName(template.name) || 'Template',
          patch: normalizePatch(template.patch),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const currentList = state.templatesByRuleId[ruleId] ?? [];
          return {
            templatesByRuleId: {
              ...state.templatesByRuleId,
              [ruleId]: [...currentList, nextTemplate],
            },
          };
        });

        return nextTemplate;
      },

      updateTemplate: (ruleId, templateId, patch) =>
        set((state) => {
          const currentList = state.templatesByRuleId[ruleId] ?? [];
          const nextList = currentList.map((templateEntry) =>
            templateEntry.id === templateId
              ? {
                  ...templateEntry,
                  patch: normalizePatch(patch),
                  updatedAt: Date.now(),
                }
              : templateEntry
          );
          return {
            templatesByRuleId: {
              ...state.templatesByRuleId,
              [ruleId]: nextList,
            },
          };
        }),

      renameTemplate: (ruleId, templateId, name) =>
        set((state) => {
          const nextName = sanitizeName(name);
          if (!nextName) return state;

          const currentList = state.templatesByRuleId[ruleId] ?? [];
          const nextList = currentList.map((templateEntry) =>
            templateEntry.id === templateId
              ? { ...templateEntry, name: nextName, updatedAt: Date.now() }
              : templateEntry
          );
          return {
            templatesByRuleId: {
              ...state.templatesByRuleId,
              [ruleId]: nextList,
            },
          };
        }),

      deleteTemplate: (ruleId, templateId) =>
        set((state) => {
          const currentList = state.templatesByRuleId[ruleId] ?? [];
          const nextList = currentList.filter((templateEntry) => templateEntry.id !== templateId);
          const nextMap = { ...state.templatesByRuleId };
          if (nextList.length === 0) {
            delete nextMap[ruleId];
          } else {
            nextMap[ruleId] = nextList;
          }
          return { templatesByRuleId: nextMap };
        }),
    }),
    {
      name: 'error-mock-response-presets',
      version: 2,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      migrate: (persistedState: unknown) => {
        const state = (persistedState || {}) as Partial<{
          templatesByRuleId?: Record<string, ApiBusinessResponseTemplate[]>;
          presetsByRuleId?: Record<
            string,
            Array<{
              id: string;
              name: string;
              response: ResponseConfig;
              createdAt: number;
              updatedAt: number;
            }>
          >;
        }>;

        if (state.templatesByRuleId && typeof state.templatesByRuleId === 'object') {
          return { templatesByRuleId: state.templatesByRuleId };
        }

        const presetsByRuleId = state.presetsByRuleId ?? {};
        const templatesByRuleId: Record<string, ApiBusinessResponseTemplate[]> = {};
        for (const [ruleId, presets] of Object.entries(presetsByRuleId)) {
          if (!Array.isArray(presets)) continue;
          templatesByRuleId[ruleId] = presets.map((preset) => ({
            id: preset.id,
            name: sanitizeName(preset.name) || 'Template',
            patch: patchFromResponseConfig(preset.response),
            createdAt: preset.createdAt ?? Date.now(),
            updatedAt: preset.updatedAt ?? Date.now(),
          }));
        }

        return {
          templatesByRuleId,
        };
      },
    }
  )
);

/**
 * Backward-compatible alias (store was originally named "presets").
 */
export const useResponsePresetsStore = useResponseTemplatesStore;
