import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MockRule } from '@error-mock/core';
import { useI18n } from '@/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [errorBodyJsonError, setErrorBodyJsonError] = useState<string | null>(
    null
  );
  const [resultDraft, setResultDraft] = useState<string>('');
  const [errorBodyDraft, setErrorBodyDraft] = useState<string>('');
  const [httpAdvancedOpen, setHttpAdvancedOpen] = useState(false);

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

  return (
    <div className="em:space-y-0">
      {/* Status Code Selection */}
      <div className="em:p-2.5 em:bg-white em:border-b">
        <div className="em:space-y-2">
          <Label htmlFor="statusCode">{t('responseTab.status.title')}</Label>
          <Select
            value={String(rule.response.status)}
            onValueChange={(value) => handleStatusChange(parseInt(value))}
          >
            <SelectTrigger id="statusCode">
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
      </div>

      {/* Status 2xx-3xx: Business Error Configuration */}
      {rule.response.status >= 200 && rule.response.status < 400 && (
        <div className="em:p-3 em:space-y-3">
          {/* Business Templates */}
          <div>
            <Label className="em:mb-2">{t('responseTab.templates.title')}</Label>
            <div className="em:grid em:grid-cols-2 em:gap-2">
              {BUSINESS_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  variant="outline"
                  size="sm"
                  className="em:justify-start"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Business Error Fields */}
          <div>
            <Label className="em:mb-2">{t('responseTab.businessError.title')}</Label>

            <div className="em:grid em:grid-cols-3 em:gap-2">
              <div>
                <Label htmlFor="errNo" className="em:text-xs em:text-muted-foreground">
                  err_no
                </Label>
                <Input
                  id="errNo"
                  type="number"
                  value={rule.response.errNo}
                  onChange={(e) =>
                    onChange('response.errNo', parseInt(e.target.value) || 0)
                  }
                />
                <p className="em:text-xs em:text-muted-foreground em:mt-1">
                  {t('responseTab.businessError.errNoHelp')}
                </p>
              </div>

              <div className="em:col-span-2">
                <Label htmlFor="errMsg" className="em:text-xs em:text-muted-foreground">
                  err_msg
                </Label>
                <Input
                  id="errMsg"
                  type="text"
                  value={rule.response.errMsg}
                  onChange={(e) => onChange('response.errMsg', e.target.value)}
                />
              </div>
            </div>

            <div className="em:mt-2">
              <Label htmlFor="detailErrMsg" className="em:text-xs em:text-muted-foreground">
                detail_err_msg
              </Label>
              <Textarea
                id="detailErrMsg"
                value={rule.response.detailErrMsg}
                onChange={(e) =>
                  onChange('response.detailErrMsg', e.target.value)
                }
                rows={2}
                className="em:min-h-0"
              />
            </div>
          </div>

          {/* Response Data (result) */}
          <div>
            <Label htmlFor="result" className="em:mb-2">
              {t('responseTab.result.title')}
            </Label>
            <Textarea
              id="result"
              value={getResultValue()}
              onChange={(e) => handleResultChange(e.target.value)}
              rows={10}
              className="em:font-mono em:text-xs"
              placeholder="{}"
            />
            {resultJsonError && (
              <p className="em:text-xs em:text-destructive em:mt-1">{resultJsonError}</p>
            )}
            <p className="em:text-xs em:text-muted-foreground em:mt-1">
              {t('responseTab.result.finalReturn', {
                shape:
                  '{ err_no, err_msg, detail_err_msg, result, sync, time_stamp, trace_id }',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Status >= 400: HTTP Error Mode */}
      {rule.response.status >= 400 && (
        <div className="em:p-3">
          <Alert variant="warning">
            <AlertTriangle className="em:w-5 em:h-5" />
            <div>
              <AlertTitle>{t('responseTab.httpError.title')}</AlertTitle>
              <AlertDescription>
                {t('responseTab.httpError.desc', { status: rule.response.status })}
              </AlertDescription>
            </div>
          </Alert>

          {/* Optional: Custom Error Body */}
          <Collapsible
            open={httpAdvancedOpen}
            onOpenChange={setHttpAdvancedOpen}
            className="em:mt-3"
          >
            <CollapsibleTrigger asChild>
              <Button variant="link" size="sm" className="em:px-0">
                {t('responseTab.httpError.advanced')}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="em:pt-2 em:space-y-2">
              <Textarea
                id="errorBody"
                value={getErrorBodyValue()}
                onChange={(e) => handleErrorBodyChange(e.target.value)}
                placeholder='{"error": "Not Found", "message": "..."}'
                rows={6}
                className="em:font-mono em:text-xs"
              />
              {errorBodyJsonError && (
                <p className="em:text-xs em:text-destructive">{errorBodyJsonError}</p>
              )}
              <p className="em:text-xs em:text-muted-foreground">
                {t('responseTab.httpError.emptyHelp')}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
