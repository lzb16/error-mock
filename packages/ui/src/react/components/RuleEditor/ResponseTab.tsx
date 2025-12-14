import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MockRule } from '@error-mock/core';
import { useI18n } from '@/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ResponseTabProps {
  rule: MockRule;
  onChange: (field: string, value: unknown) => void;
}

interface BusinessTemplate {
  id: string;
  name: string;
  errNo: number;
  errMsg: string;
  detailErrMsg: string;
}

const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'success',
    name: '正常返回',
    errNo: 0,
    errMsg: '',
    detailErrMsg: '',
  },
  {
    id: 'insufficient-balance',
    name: '余额不足',
    errNo: 1001,
    errMsg: '余额不足',
    detailErrMsg: '当前余额不足以完成此操作',
  },
  {
    id: 'permission-denied',
    name: '权限被拒',
    errNo: 1002,
    errMsg: '权限不足',
    detailErrMsg: '您没有执行此操作的权限',
  },
  {
    id: 'duplicate-order',
    name: '订单重复',
    errNo: 1003,
    errMsg: '订单已存在',
    detailErrMsg: '该订单号已被使用',
  },
];

export function ResponseTab({ rule, onChange }: ResponseTabProps) {
  const { t } = useI18n();
  const [resultJsonError, setResultJsonError] = useState<string | null>(null);
  const [errorBodyJsonError, setErrorBodyJsonError] = useState<string | null>(null);
  const [resultDraft, setResultDraft] = useState<string>('');
  const [errorBodyDraft, setErrorBodyDraft] = useState<string>('');

  const handleStatusChange = (status: number) => {
    onChange('response.status', status);
  };

  const applyTemplate = (template: BusinessTemplate) => {
    // Only update error fields, preserve result field
    onChange('response.errNo', template.errNo);
    onChange('response.errMsg', template.errMsg);
    onChange('response.detailErrMsg', template.detailErrMsg);
  };

  const handleResultChange = (value: string) => {
    setResultDraft(value);
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
    try {
      const parsed = value.trim() ? JSON.parse(value) : undefined;
      onChange('response.errorBody', parsed);
      setErrorBodyJsonError(null);
    } catch (err) {
      setErrorBodyJsonError(t('responseTab.json.invalid'));
      // Don't save invalid JSON - keep as draft only
    }
  };

  // Format result for display in textarea
  const getResultValue = (): string => {
    // If there's a draft being edited (with error), show the draft
    if (resultJsonError && resultDraft) {
      return resultDraft;
    }

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
    // If there's a draft being edited (with error), show the draft
    if (errorBodyJsonError && errorBodyDraft) {
      return errorBodyDraft;
    }

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

  return (
    <div className="em:flex em:gap-4 em:h-full">
      {/* Left: Main Editor */}
      <div className="em:flex-1 em:flex em:flex-col em:gap-3 em:min-w-0">
        {/* Status Bar */}
        <div className="em:flex em:items-center em:gap-4 em:p-3 em:bg-white em:rounded-lg em:border em:border-gray-200">
          <div className="em:flex em:items-center em:gap-2">
            <span className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide">
              Status
            </span>
            <Select
              value={String(rule.response.status)}
              onValueChange={(value) => handleStatusChange(parseInt(value))}
            >
              <SelectTrigger className="em:w-40 em:h-8 em:font-mono em:text-sm">
                <SelectValue />
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
          <div className="em:h-4 em:w-px em:bg-gray-200" />
          <div className="em:flex em:items-center em:gap-2">
            <span className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide">
              Content-Type
            </span>
            <span className="em:text-xs em:font-mono em:text-gray-700 em:bg-gray-100 em:px-2 em:py-1 em:rounded em:border em:border-gray-200">
              application/json
            </span>
          </div>
        </div>

        {/* Business Error Fields (only for 2xx-3xx) */}
        {isBusinessMode && (
          <div className="em:p-3 em:bg-white em:rounded-lg em:border em:border-gray-200">
            <div className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide em:mb-2">
              {t('responseTab.businessError.title')}
            </div>
            <div className="em:grid em:grid-cols-4 em:gap-2">
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
              <div className="em:col-span-2">
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
                <Input
                  id="detailErrMsg"
                  type="text"
                  value={rule.response.detailErrMsg}
                  onChange={(e) => onChange('response.detailErrMsg', e.target.value)}
                  className="em:h-8 em:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* HTTP Error Alert (only for 4xx-5xx) */}
        {!isBusinessMode && (
          <Alert variant="warning">
            <AlertTriangle className="em:w-5 em:h-5" />
            <div>
              <AlertTitle>{t('responseTab.httpError.title')}</AlertTitle>
              <AlertDescription>
                {t('responseTab.httpError.desc', { status: rule.response.status })}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* JSON Editor (main area) */}
        <div className="em:flex-1 em:flex em:flex-col em:bg-white em:rounded-lg em:border em:border-gray-200 em:overflow-hidden em:min-h-0">
          <div className="em:flex em:items-center em:justify-between em:px-3 em:py-2 em:border-b em:border-gray-200 em:bg-gray-50/50">
            <span className="em:text-xs em:font-medium em:text-gray-500 em:uppercase em:tracking-wide">
              {isBusinessMode ? t('responseTab.result.title') : t('responseTab.httpError.advanced')}
            </span>
          </div>
          <Textarea
            id="result"
            value={isBusinessMode ? getResultValue() : getErrorBodyValue()}
            onChange={(e) =>
              isBusinessMode
                ? handleResultChange(e.target.value)
                : handleErrorBodyChange(e.target.value)
            }
            className="em:flex-1 em:font-mono em:text-xs em:border-0 em:rounded-none em:resize-none focus-visible:em:ring-0"
            placeholder="{}"
          />
          {(isBusinessMode ? resultJsonError : errorBodyJsonError) && (
            <div className="em:px-3 em:py-1.5 em:border-t em:border-gray-200 em:bg-red-50">
              <p className="em:text-xs em:text-destructive">
                {isBusinessMode ? resultJsonError : errorBodyJsonError}
              </p>
            </div>
          )}
          {isBusinessMode && (
            <div className="em:px-3 em:py-1.5 em:border-t em:border-gray-200 em:bg-gray-50/50">
              <p className="em:text-xs em:text-gray-500">
                {t('responseTab.result.finalReturn', {
                  shape: '{ err_no, err_msg, detail_err_msg, result, sync, time_stamp, trace_id }',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Templates Sidebar (only for 2xx-3xx) */}
      {isBusinessMode && (
        <div className="em:w-48 em:flex em:flex-col em:bg-white em:rounded-lg em:border em:border-gray-200 em:overflow-hidden em:shrink-0">
          <div className="em:px-3 em:py-2 em:border-b em:border-gray-200 em:bg-gray-50/50">
            <h4 className="em:text-xs em:font-semibold em:text-gray-700 em:uppercase em:tracking-wide">
              {t('responseTab.templates.title')}
            </h4>
          </div>
          <div className="em:flex-1 em:overflow-y-auto em:p-2 em:space-y-1.5">
            {BUSINESS_TEMPLATES.map((template) => {
              const isActive = rule.response.errNo === template.errNo;
              return (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`em:w-full em:p-2 em:text-left em:rounded-md em:border em:transition-all ${
                    isActive
                      ? 'em:border-blue-500 em:bg-blue-50'
                      : 'em:border-gray-200 hover:em:border-blue-300 hover:em:bg-gray-50'
                  }`}
                >
                  <div className="em:flex em:items-center em:justify-between em:mb-0.5">
                    <span className="em:text-xs em:font-semibold em:text-gray-800">
                      {template.name}
                    </span>
                    <span
                      className={`em:text-[10px] em:px-1.5 em:py-0.5 em:rounded em:font-medium ${
                        template.errNo === 0
                          ? 'em:bg-green-100 em:text-green-700'
                          : 'em:bg-red-100 em:text-red-700'
                      }`}
                    >
                      {template.errNo}
                    </span>
                  </div>
                  {template.errMsg && (
                    <p className="em:text-[11px] em:text-gray-500 em:truncate">
                      {template.errMsg}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
