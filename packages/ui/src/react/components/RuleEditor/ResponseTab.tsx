// {{RIPER-10 Action}}
// Role: LD | Task_ID: 7b9ed8c9-2a23-4cfb-af6a-a14da5171dee | Time: 2025-12-21T02:56:15+08:00
// Principle: SOLID-O (开闭原则)
// Taste: 用“模板 patch（errNo+result）”统一内置模板与 API 模板，避免重复 UI 分支与状态不同步

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileJson, BookOpen, Plus, PencilLine, Trash2, Braces, GripVertical } from 'lucide-react';
import type { MockRule } from '@error-mock/core';
import { useI18n } from '@/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useResponseTemplatesStore, type BusinessResponseTemplatePatchInput } from '@/stores/useResponsePresetsStore';
import { useToastStore } from '@/stores/useToastStore';

interface ResponseTabProps {
  rule: MockRule;
  onChange: (field: string, value: unknown) => void;
}

type TemplateSource = 'builtin' | 'api';
type TemplateKey = `${TemplateSource}:${string}`;

interface TemplateItem {
  key: TemplateKey;
  source: TemplateSource;
  id: string;
  name: string;
  patch: BusinessResponseTemplatePatchInput;
  readonly: boolean;
}

function makeTemplateKey(source: TemplateSource, id: string): TemplateKey {
  return `${source}:${id}`;
}

function normalizeMessage(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed ? trimmed : '';
}

function cloneJson<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (typeof value !== 'object' || value === null) return value;

  const record = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = sortJson(record[key]);
  }
  return sorted;
}

function stableJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(sortJson(value));
  } catch {
    return '';
  }
}

function isJsonEqual(a: unknown, b: unknown): boolean {
  return stableJsonStringify(a) === stableJsonStringify(b);
}

export function ResponseTab({ rule, onChange }: ResponseTabProps) {
  const { t } = useI18n();
  const templatesByRuleId = useResponseTemplatesStore((state) => state.templatesByRuleId);
  const addTemplate = useResponseTemplatesStore((state) => state.addTemplate);
  const updateTemplate = useResponseTemplatesStore((state) => state.updateTemplate);
  const renameTemplate = useResponseTemplatesStore((state) => state.renameTemplate);
  const deleteTemplate = useResponseTemplatesStore((state) => state.deleteTemplate);
  const addToast = useToastStore((state) => state.addToast);
  const [resultJsonError, setResultJsonError] = useState<string | null>(null);
  const [errorBodyJsonError, setErrorBodyJsonError] = useState<string | null>(null);
  const [resultDraft, setResultDraft] = useState<string | null>(null);
  const [errorBodyDraft, setErrorBodyDraft] = useState<string | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<TemplateKey | null>(null);
  const [hoveredTemplateKey, setHoveredTemplateKey] = useState<TemplateKey | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createTemplateName, setCreateTemplateName] = useState<string>('');
  const [createIncludeResult, setCreateIncludeResult] = useState(true);
  const [createNameTouched, setCreateNameTouched] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<TemplateItem | null>(null);
  const [renameDraftName, setRenameDraftName] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateItem | null>(null);

  const handleStatusChange = (status: number) => {
    onChange('response.status', status);
  };

  useEffect(() => {
    setSelectedTemplateKey(null);
    setHoveredTemplateKey(null);
    setCreateDialogOpen(false);
    setCreateTemplateName('');
    setCreateIncludeResult(true);
    setCreateNameTouched(false);
    setRenameDialogOpen(false);
    setRenameTarget(null);
    setRenameDraftName('');
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    setResultDraft(null);
    setResultJsonError(null);
    setErrorBodyDraft(null);
    setErrorBodyJsonError(null);
  }, [rule.id]);

  const isTemplateActive = (patch: BusinessResponseTemplatePatchInput): boolean => {
    if (rule.response.errNo !== patch.errNo) return false;
    if (rule.response.errMsg !== normalizeMessage(patch.errMsg)) return false;
    if (rule.response.detailErrMsg !== normalizeMessage(patch.detailErrMsg)) return false;
    if ('result' in patch) {
      return isJsonEqual(rule.response.result, patch.result);
    }
    return true;
  };

  const applyTemplatePatch = (patch: BusinessResponseTemplatePatchInput) => {
    onChange('response.errNo', patch.errNo);
    onChange('response.errMsg', normalizeMessage(patch.errMsg));
    onChange('response.detailErrMsg', normalizeMessage(patch.detailErrMsg));

    if ('result' in patch) {
      onChange('response.result', cloneJson(patch.result));
      setResultDraft(null);
      setResultJsonError(null);
    }
  };

  const handleResultChange = (value: string) => {
    setResultDraft(value);
    const trimmed = value.trim();
    if (!trimmed) {
      onChange('response.result', undefined);
      setResultJsonError(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      onChange('response.result', parsed);
      setResultJsonError(null);
    } catch (err) {
      setResultJsonError(t('responseTab.json.invalid'));
      // Don't save invalid JSON - keep as draft only
    }
  };

  const handleErrorBodyChange = (value: string) => {
    setErrorBodyDraft(value);
    const trimmed = value.trim();
    if (!trimmed) {
      onChange('response.errorBody', undefined);
      setErrorBodyJsonError(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      onChange('response.errorBody', parsed);
      setErrorBodyJsonError(null);
    } catch (err) {
      setErrorBodyJsonError(t('responseTab.json.invalid'));
      // Don't save invalid JSON - keep as draft only
    }
  };

  const formatJsonText = (
    text: string
  ): { ok: true; parsed: unknown; formatted: string } | { ok: false; error: string } => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { ok: true, parsed: undefined, formatted: '' };
    }

    try {
      const parsed = JSON.parse(text);
      return { ok: true, parsed, formatted: JSON.stringify(parsed, null, 2) };
    } catch {
      return { ok: false, error: t('responseTab.json.invalid') };
    }
  };

  const formatResultForSave = (): { ok: true; parsed: unknown } | { ok: false } => {
    if (resultDraft === null) {
      return { ok: true, parsed: rule.response.result };
    }

    const formatted = formatJsonText(resultDraft);
    if (!formatted.ok) {
      setResultJsonError(formatted.error);
      addToast(formatted.error, 'warning', 2500);
      return { ok: false };
    }

    onChange('response.result', formatted.parsed);
    setResultDraft(formatted.formatted);
    setResultJsonError(null);
    return { ok: true, parsed: formatted.parsed };
  };

  const handleFormatResult = () => {
    const sourceText =
      resultDraft ??
      (rule.response.result === null || rule.response.result === undefined
        ? ''
        : JSON.stringify(rule.response.result, null, 2));

    const formatted = formatJsonText(sourceText);
    if (!formatted.ok) {
      setResultJsonError(formatted.error);
      addToast(formatted.error, 'warning', 2500);
      return;
    }

    onChange('response.result', formatted.parsed);
    setResultDraft(formatted.formatted);
    setResultJsonError(null);
  };

  // Format result for display in textarea
  const getResultValue = (): string => {
    // When user has started editing, keep their raw input to avoid cursor jumps.
    if (resultDraft !== null) return resultDraft;

    const { result } = rule.response;

    // If it's null or undefined, return empty string
    if (result === null || result === undefined) {
      return '';
    }

    // Otherwise, stringify with formatting
    return JSON.stringify(result, null, 2);
  };

  // Format errorBody for display in textarea
  const getErrorBodyValue = (): string => {
    // When user has started editing, keep their raw input to avoid cursor jumps.
    if (errorBodyDraft !== null) return errorBodyDraft;

    const { errorBody } = rule.response;

    // If it's null or undefined, return empty string
    if (errorBody === null || errorBody === undefined) {
      return '';
    }

    // Otherwise, stringify with formatting
    return JSON.stringify(errorBody, null, 2);
  };

  // Check if we're in business response mode (2xx-3xx)
  const isBusinessMode = rule.response.status >= 200 && rule.response.status < 400;
  const apiTemplates = templatesByRuleId[rule.id] ?? [];
  const builtinTemplates: TemplateItem[] = useMemo(
    () => [
      {
        key: makeTemplateKey('builtin', 'success'),
        source: 'builtin',
        id: 'success',
        name: t('responseTab.templates.builtin.success'),
        patch: { errNo: 0, errMsg: '', detailErrMsg: '', result: undefined },
        readonly: true,
      },
      {
        key: makeTemplateKey('builtin', 'mock-error'),
        source: 'builtin',
        id: 'mock-error',
        name: t('responseTab.templates.builtin.mockError'),
        patch: {
          errNo: 999,
          errMsg: t('responseTab.templates.builtin.mockError.errMsg'),
          detailErrMsg: t('responseTab.templates.builtin.mockError.detailErrMsg'),
          result: undefined,
        },
        readonly: true,
      },
    ],
    [t]
  );

  const apiTemplateItems: TemplateItem[] = useMemo(
    () =>
      apiTemplates.map((template) => ({
        key: makeTemplateKey('api', template.id),
        source: 'api' as const,
        id: template.id,
        name: template.name,
        patch: template.patch,
        readonly: false,
      })),
    [apiTemplates]
  );

  const templateItems: TemplateItem[] = useMemo(
    () => [...builtinTemplates, ...apiTemplateItems],
    [builtinTemplates, apiTemplateItems]
  );

  const currentTemplatePatch: BusinessResponseTemplatePatchInput = useMemo(
    () => ({
      errNo: rule.response.errNo,
      errMsg: rule.response.errMsg,
      detailErrMsg: rule.response.detailErrMsg,
      result: rule.response.result,
    }),
    [rule.response.detailErrMsg, rule.response.errMsg, rule.response.errNo, rule.response.result]
  );

  const openCreateDialog = (options?: { name?: string; includeResult?: boolean }) => {
    setCreateTemplateName(options?.name ?? '');
    setCreateIncludeResult(options?.includeResult ?? true);
    setCreateNameTouched(false);
    setCreateDialogOpen(true);
  };

  const getCurrentPatch = (includeResult: boolean): BusinessResponseTemplatePatchInput => {
    if (includeResult) return currentTemplatePatch;
    return {
      errNo: rule.response.errNo,
      errMsg: rule.response.errMsg,
      detailErrMsg: rule.response.detailErrMsg,
    };
  };

  const handleCreateTemplate = () => {
    const name = createTemplateName.trim();
    if (!name) {
      setCreateNameTouched(true);
      addToast(t('responseTab.templates.toast.nameRequired'), 'warning', 2500);
      return;
    }

    const patch = createIncludeResult
      ? (() => {
          const formatted = formatResultForSave();
          if (!formatted.ok) return null;
          return {
            errNo: rule.response.errNo,
            errMsg: rule.response.errMsg,
            detailErrMsg: rule.response.detailErrMsg,
            result: formatted.parsed,
          } satisfies BusinessResponseTemplatePatchInput;
        })()
      : getCurrentPatch(false);

    if (!patch) return;

    const created = addTemplate(rule.id, { name, patch });
    setSelectedTemplateKey(makeTemplateKey('api', created.id));
    setCreateDialogOpen(false);
    setCreateTemplateName('');
    setCreateNameTouched(false);
    addToast(t('responseTab.templates.toast.created', { name: created.name }), 'success', 2500);
  };

  const handleUpdateSelectedTemplate = (template: TemplateItem) => {
    if (template.source !== 'api') return;
    const shouldIncludeResult = 'result' in template.patch;
    const patch = shouldIncludeResult
      ? (() => {
          const formatted = formatResultForSave();
          if (!formatted.ok) return null;
          return {
            errNo: rule.response.errNo,
            errMsg: rule.response.errMsg,
            detailErrMsg: rule.response.detailErrMsg,
            result: formatted.parsed,
          } satisfies BusinessResponseTemplatePatchInput;
        })()
      : getCurrentPatch(false);

    if (!patch) return;
    updateTemplate(rule.id, template.id, patch);
    addToast(t('responseTab.templates.toast.updated', { name: template.name }), 'success', 2000);
  };

  const openRenameDialog = (template: TemplateItem) => {
    if (template.source !== 'api') return;
    setRenameTarget(template);
    setRenameDraftName(template.name);
    setRenameDialogOpen(true);
  };

  const handleRenameTemplate = () => {
    if (!renameTarget) return;
    const nextName = renameDraftName.trim();
    if (!nextName) return;
    renameTemplate(rule.id, renameTarget.id, nextName);
    setRenameDialogOpen(false);
    addToast(t('responseTab.templates.toast.renamed', { name: nextName }), 'success', 2000);
  };

  const openDeleteDialog = (template: TemplateItem) => {
    if (template.source !== 'api') return;
    setDeleteTarget(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = () => {
    if (!deleteTarget) return;
    deleteTemplate(rule.id, deleteTarget.id);
    if (selectedTemplateKey === makeTemplateKey('api', deleteTarget.id)) {
      setSelectedTemplateKey(null);
    }
    setDeleteDialogOpen(false);
    addToast(t('responseTab.templates.toast.deleted', { name: deleteTarget.name }), 'warning', 2500);
  };

  const selectedTemplateItem = useMemo(
    () => (selectedTemplateKey ? templateItems.find((item) => item.key === selectedTemplateKey) : undefined),
    [selectedTemplateKey, templateItems]
  );

  const selectedApiTemplateItem = selectedTemplateItem?.source === 'api' ? selectedTemplateItem : undefined;
  const selectedApiTemplateDirty = !!(selectedApiTemplateItem && !isTemplateActive(selectedApiTemplateItem.patch));

  const activeTemplateKey: TemplateKey | null = useMemo(() => {
    const matching = templateItems.filter((item) => isTemplateActive(item.patch));

    if (selectedTemplateItem && isTemplateActive(selectedTemplateItem.patch)) {
      return selectedTemplateItem.key;
    }

    const matchingApi = matching.filter((item) => item.source === 'api');
    if (matchingApi.length > 0) {
      const withResult = matchingApi.find((item) => 'result' in item.patch);
      return (withResult ?? matchingApi[0]).key;
    }

    const matchingBuiltin = matching.filter((item) => item.source === 'builtin');
    return matchingBuiltin[0]?.key ?? null;
  }, [selectedTemplateItem, templateItems]);

  return (
    <div className="em:flex em:gap-3 em:h-full">
      {/* Left: Main Editor */}
      <div
        className={`em:flex-1 em:flex em:flex-col em:gap-3 em:min-w-0 ${
          isBusinessMode
            ? 'em:max-w-[calc(12rem+0.75rem+20rem)]'
            : 'em:max-w-4xl'
        }`}
      >
        {/* Status Bar */}
        <div className="em:flex em:items-center em:gap-2 em:p-3 em:bg-white em:rounded-lg em:border em:border-gray-200">
          <span className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide">
            Status
          </span>
          <Select
            value={String(rule.response.status)}
            onValueChange={(value) => handleStatusChange(parseInt(value))}
          >
            <SelectTrigger className="em:w-52 em:h-8 em:font-mono em:text-sm em:whitespace-nowrap">
              <SelectValue className="em:truncate" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t('responseTab.status.group.success')}</SelectLabel>
                <SelectItem value="200">200 OK</SelectItem>
                <SelectItem value="201">201 Created</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>{t('responseTab.status.group.clientError')}</SelectLabel>
                <SelectItem value="400">400 Bad Request</SelectItem>
                <SelectItem value="401">401 Unauthorized</SelectItem>
                <SelectItem value="403">403 Forbidden</SelectItem>
                <SelectItem value="404">404 Not Found</SelectItem>
                <SelectItem value="409">409 Conflict</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>{t('responseTab.status.group.serverError')}</SelectLabel>
                <SelectItem value="500">500 Internal Server Error</SelectItem>
                <SelectItem value="502">502 Bad Gateway</SelectItem>
                <SelectItem value="503">503 Service Unavailable</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Business Mode: Two Column Layout (Error Fields + JSON Editor) */}
        {isBusinessMode && (
          <div className="em:flex-1 em:flex em:gap-3 em:min-h-0">
            {/* Left Column: Business Error Fields (Vertical) */}
            <div className="em:w-48 em:shrink-0 em:flex em:flex-col em:gap-2 em:p-3 em:bg-white em:rounded-lg em:border em:border-gray-200">
              <div className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide">
                {t('responseTab.businessError.title')}
              </div>
              <div className="em:space-y-2">
                <div>
                  <Label htmlFor="errNo" className="em:text-[11px] em:text-gray-500">
                    err_no
                  </Label>
                  <Input
                    id="errNo"
                    type="number"
                    value={rule.response.errNo}
                    onChange={(e) =>
                      onChange('response.errNo', parseInt(e.target.value) || 0)
                    }
                    className="em:h-8 em:font-mono em:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="errMsg" className="em:text-[11px] em:text-gray-500">
                    err_msg
                  </Label>
                  <Input
                    id="errMsg"
                    type="text"
                    value={rule.response.errMsg}
                    onChange={(e) => onChange('response.errMsg', e.target.value)}
                    className="em:h-8 em:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="detailErrMsg" className="em:text-[11px] em:text-gray-500">
                    detail_err_msg
                  </Label>
                  <Textarea
                    id="detailErrMsg"
                    value={rule.response.detailErrMsg}
                    onChange={(e) => onChange('response.detailErrMsg', e.target.value)}
                    className="em:text-sm em:min-h-[60px] em:resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: JSON Editor */}
            <div className="em:flex-1 em:max-w-xs em:flex em:flex-col em:bg-white em:rounded-lg em:border em:border-gray-200 em:overflow-hidden em:min-h-0">
              <div className="em:flex em:items-center em:justify-between em:gap-2 em:px-3 em:py-2 em:border-b em:border-gray-200 em:bg-gray-50/50">
                <div className="em:flex em:items-center em:gap-1.5 em:min-w-0">
                  <FileJson className="em:w-3.5 em:h-3.5 em:text-gray-500" />
                  <span className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide em:truncate">
                    {t('responseTab.result.title')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={handleFormatResult}
                  aria-label={t('responseTab.json.format')}
                  title={t('responseTab.json.format')}
                >
                  <Braces className="em:w-4 em:h-4" />
                </Button>
              </div>
              <Textarea
                id="result"
                value={getResultValue()}
                onChange={(e) => handleResultChange(e.target.value)}
                className="em:flex-1 em:font-mono em:text-xs em:border-0 em:rounded-none em:resize-none em:focus-visible:ring-0"
                placeholder="{}"
              />
              {resultJsonError && (
                <div className="em:px-3 em:py-1.5 em:border-t em:border-gray-200 em:bg-red-50">
                  <p className="em:text-xs em:text-destructive">{resultJsonError}</p>
                </div>
              )}
              <div className="em:px-3 em:py-1.5 em:border-t em:border-gray-200 em:bg-gray-50/50">
                <p className="em:text-xs em:text-gray-500">
                  {t('responseTab.result.finalReturn', {
                    shape: '{ err_no, err_msg, detail_err_msg, result, ... }',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* HTTP Error Mode */}
        {!isBusinessMode && (
          <>
            <Alert variant="warning">
              <AlertTriangle className="em:w-5 em:h-5" />
              <div>
                <AlertTitle>{t('responseTab.httpError.title')}</AlertTitle>
                <AlertDescription>
                  {t('responseTab.httpError.desc', { status: rule.response.status })}
                </AlertDescription>
              </div>
            </Alert>

            {/* JSON Editor for HTTP Error */}
            <div className="em:flex-1 em:flex em:flex-col em:bg-white em:rounded-lg em:border em:border-gray-200 em:overflow-hidden em:min-h-0">
              <div className="em:flex em:items-center em:gap-1.5 em:px-3 em:py-2 em:border-b em:border-gray-200 em:bg-gray-50/50">
                <FileJson className="em:w-3.5 em:h-3.5 em:text-gray-500" />
                <span className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide">
                  {t('responseTab.httpError.advanced')}
                </span>
              </div>
              <Textarea
                id="errorBody"
                value={getErrorBodyValue()}
                onChange={(e) => handleErrorBodyChange(e.target.value)}
                className="em:flex-1 em:font-mono em:text-xs em:border-0 em:rounded-none em:resize-none em:focus-visible:ring-0"
                placeholder='{"error": "Not Found", "message": "..."}'
              />
              {errorBodyJsonError && (
                <div className="em:px-3 em:py-1.5 em:border-t em:border-gray-200 em:bg-red-50">
                  <p className="em:text-xs em:text-destructive">{errorBodyJsonError}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Templates Sidebar (only for 2xx-3xx) */}
      {isBusinessMode && (
        <div className="em:w-80 em:flex em:flex-col em:bg-white em:rounded-lg em:border em:border-gray-200 em:overflow-hidden em:shrink-0">
          <div className="em:flex em:items-center em:justify-between em:gap-2 em:px-3 em:py-2 em:border-b em:border-gray-200 em:bg-gray-50/50">
            <div className="em:flex em:items-center em:gap-1.5 em:min-w-0">
              <BookOpen className="em:w-3.5 em:h-3.5 em:text-gray-500" />
              <h4 className="em:text-xs em:font-semibold em:text-gray-700 em:uppercase em:tracking-wide em:truncate">
                {t('responseTab.templates.title')}
              </h4>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={() => openCreateDialog()}
              aria-label={t('responseTab.templates.saveCurrent')}
              title={t('responseTab.templates.saveCurrent')}
            >
              <Plus className="em:w-4 em:h-4" />
            </Button>
          </div>
          <div className="em:flex-1 em:overflow-y-auto em:p-2 em:space-y-1.5">
            {templateItems.map((template) => {
              const isActive = activeTemplateKey === template.key;
              const isSelected = selectedTemplateKey === template.key;
              const isHovered = hoveredTemplateKey === template.key;
              const hasResult = 'result' in template.patch;
              const showActions = isSelected || isHovered;
              return (
                <div
                  key={template.key}
                  className="em:relative"
                  onMouseEnter={() => setHoveredTemplateKey(template.key)}
                  onMouseLeave={() => setHoveredTemplateKey(null)}
                  onFocusCapture={() => setHoveredTemplateKey(template.key)}
                  onBlurCapture={(e) => {
                    const nextFocused = e.relatedTarget as Node | null;
                    if (nextFocused && e.currentTarget.contains(nextFocused)) return;
                    setHoveredTemplateKey(null);
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedTemplateKey(template.key);
                      applyTemplatePatch(template.patch);
                    }}
                    className={`em:w-full em:p-2 em:pr-10 em:text-left em:rounded-md em:border em:transition-all ${
                      isSelected
                        ? 'em:border-blue-500 em:bg-blue-50'
                        : isActive
                          ? 'em:border-green-400 em:bg-green-50/50'
                          : 'em:border-gray-200 em:hover:border-blue-300 em:hover:bg-gray-50'
                    }`}
                    type="button"
                  >
                    <div className="em:flex em:items-start em:justify-between em:gap-2">
                      <span className="em:text-xs em:font-semibold em:text-gray-800 em:truncate">
                        {template.name}
                      </span>
                    </div>

                    <div className="em:mt-1 em:flex em:items-end em:gap-2">
                      <div className="em:flex-1 em:min-w-0">
                        {template.patch.errMsg ? (
                          <p className="em:text-[11px] em:text-gray-500 em:truncate">
                            {template.patch.errMsg}
                          </p>
                        ) : (
                          <div className="em:h-[14px]" />
                        )}
                      </div>

                      <div className="em:flex em:items-center em:gap-1 em:shrink-0">
                        {template.readonly && (
                          <span className="em:text-[10px] em:px-1.5 em:py-0.5 em:rounded em:font-medium em:bg-gray-100 em:text-gray-600 em:border em:border-gray-200">
                            {t('responseTab.templates.badge.builtin')}
                          </span>
                        )}
                        {hasResult && (
                          <span className="em:text-[10px] em:px-1.5 em:py-0.5 em:rounded em:font-medium em:bg-indigo-50 em:text-indigo-700 em:border em:border-indigo-200">
                            {t('responseTab.templates.badge.result')}
                          </span>
                        )}
                        <span
                          className={`em:text-[10px] em:px-1.5 em:py-0.5 em:rounded em:font-medium ${
                            template.patch.errNo === 0
                              ? 'em:bg-green-100 em:text-green-700'
                              : 'em:bg-red-100 em:text-red-700'
                          }`}
                        >
                          {template.patch.errNo}
                        </span>
                      </div>
                    </div>
                  </button>

                  {!template.readonly && (
                    <div
                      className={`em:absolute em:right-0 em:top-0 em:bottom-0 em:w-8 em:rounded-r-md em:overflow-hidden em:border-l em:border-black/5 em:transition-colors em:duration-150 ${
                        showActions ? 'em:bg-black/[0.02]' : 'em:bg-transparent'
                      }`}
                    >
                      <div
                        className={`em:absolute em:inset-0 em:flex em:items-center em:justify-center em:transition-all em:duration-150 em:ease-out ${
                          showActions ? 'em:opacity-0 em:scale-95 em:translate-x-1' : 'em:opacity-60 em:scale-100'
                        }`}
                        aria-hidden={showActions}
                      >
                        <GripVertical className="em:size-[13px] em:text-gray-400" />
                      </div>

                      <div
                        className={`em:relative em:flex em:flex-col em:h-full em:w-full em:transition-all em:duration-150 em:ease-out ${
                          showActions ? 'em:opacity-100 em:translate-x-0' : 'em:opacity-0 em:translate-x-2 em:pointer-events-none'
                        }`}
                        aria-hidden={!showActions}
                      >
                        <div className="em:flex-1 em:flex em:items-center em:justify-center">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            onClick={() => openRenameDialog(template)}
                            aria-label={t('responseTab.templates.action.rename')}
                            title={t('responseTab.templates.action.rename')}
                            tabIndex={showActions ? 0 : -1}
                            className="em:size-6 em:rounded-md em:bg-transparent em:text-gray-500 em:transition-all em:duration-150 em:ease-out em:hover:bg-blue-100 em:hover:text-blue-800 em:hover:shadow-sm em:hover:scale-105 em:active:scale-95"
                          >
                            <PencilLine className="em:size-[11px]" />
                          </Button>
                        </div>
                        <div className="em:h-px em:w-full em:bg-black/5" />
                        <div className="em:flex-1 em:flex em:items-center em:justify-center">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            onClick={() => openDeleteDialog(template)}
                            aria-label={t('responseTab.templates.action.delete')}
                            title={t('responseTab.templates.action.delete')}
                            tabIndex={showActions ? 0 : -1}
                            className="em:size-6 em:rounded-md em:bg-transparent em:text-gray-500 em:transition-all em:duration-150 em:ease-out em:hover:bg-destructive/15 em:hover:text-destructive em:hover:shadow-sm em:hover:scale-105 em:active:scale-95"
                          >
                            <Trash2 className="em:size-[11px]" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedApiTemplateItem && selectedApiTemplateDirty && (
            <div className="em:border-t em:border-gray-200 em:p-2">
              <div className="em:rounded-md em:border em:border-amber-200 em:bg-amber-50 em:p-2">
                <p className="em:text-[11px] em:text-amber-900/80 em:font-medium em:leading-snug">
                  {t('responseTab.templates.dirtyHint', { name: selectedApiTemplateItem.name })}
                </p>
                <div className="em:mt-2 em:flex em:gap-2">
                  <Button
                    size="sm"
                    className="em:flex-1"
                    type="button"
                    onClick={() => handleUpdateSelectedTemplate(selectedApiTemplateItem)}
                  >
                    {t('responseTab.templates.updateSelected')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="em:flex-1"
                    type="button"
                    onClick={() =>
                      openCreateDialog({
                        name: `${selectedApiTemplateItem.name}${t('responseTab.templates.copySuffix')}`,
                        includeResult: 'result' in selectedApiTemplateItem.patch,
                      })
                    }
                  >
                    {t('responseTab.templates.action.saveAsNew')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Create / Rename / Delete dialogs */}
          <Dialog
            open={createDialogOpen}
            onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) {
                setCreateTemplateName('');
                setCreateIncludeResult(true);
                setCreateNameTouched(false);
              }
            }}
          >
            <DialogContent className="em:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('responseTab.templates.saveCurrent')}</DialogTitle>
                <DialogDescription>{t('responseTab.templates.saveDesc')}</DialogDescription>
              </DialogHeader>
              <div className="em:space-y-4">
                <div className="em:space-y-1.5">
                  <Label htmlFor="create-template-name" className="em:text-xs em:text-gray-600">
                    {t('responseTab.templates.name.placeholder')}
                    <span className="em:text-destructive"> *</span>
                  </Label>
                  <Input
                    id="create-template-name"
                    value={createTemplateName}
                    onChange={(e) => setCreateTemplateName(e.target.value)}
                    onBlur={() => setCreateNameTouched(true)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      handleCreateTemplate();
                    }}
                    placeholder={t('responseTab.templates.name.placeholder')}
                    className="em:h-9"
                    required
                    aria-invalid={createNameTouched && !createTemplateName.trim()}
                  />
                  {createNameTouched && !createTemplateName.trim() && (
                    <p className="em:text-[11px] em:text-destructive">
                      {t('responseTab.templates.name.requiredError')}
                    </p>
                  )}
                </div>

                <div className="em:flex em:items-start em:gap-2">
                  <Checkbox
                    id="create-include-result"
                    checked={createIncludeResult}
                    onCheckedChange={(checked) => setCreateIncludeResult(Boolean(checked))}
                  />
                  <div className="em:space-y-0.5">
                    <Label htmlFor="create-include-result" className="em:text-xs em:text-gray-800">
                      {t('responseTab.templates.includeResult')}
                    </Label>
                    <p className="em:text-[11px] em:text-gray-500 em:leading-snug">
                      {t('responseTab.templates.includeResultHelp')}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setCreateDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="button" onClick={handleCreateTemplate} disabled={!createTemplateName.trim()}>
                  {t('responseTab.templates.action.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={renameDialogOpen}
            onOpenChange={(open) => {
              setRenameDialogOpen(open);
              if (!open) {
                setRenameTarget(null);
                setRenameDraftName('');
              }
            }}
          >
            <DialogContent className="em:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('responseTab.templates.renamePrompt')}</DialogTitle>
                <DialogDescription>{t('responseTab.templates.renameDesc')}</DialogDescription>
              </DialogHeader>
              <div className="em:space-y-1.5">
                <Label htmlFor="rename-template-name" className="em:text-xs em:text-gray-600">
                  {t('responseTab.templates.name.placeholder')}
                </Label>
                <Input
                  id="rename-template-name"
                  value={renameDraftName}
                  onChange={(e) => setRenameDraftName(e.target.value)}
                  placeholder={t('responseTab.templates.name.placeholder')}
                  className="em:h-9"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setRenameDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleRenameTemplate}
                  disabled={!renameTarget || !renameDraftName.trim()}
                >
                  {t('responseTab.templates.action.rename')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) {
                setDeleteTarget(null);
              }
            }}
          >
            <DialogContent className="em:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {deleteTarget
                    ? t('responseTab.templates.deleteConfirm', { name: deleteTarget.name })
                    : t('responseTab.templates.action.delete')}
                </DialogTitle>
                <DialogDescription>{t('responseTab.templates.deleteDesc')}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setDeleteDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" type="button" onClick={handleDeleteTemplate} disabled={!deleteTarget}>
                  {t('responseTab.templates.action.delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
