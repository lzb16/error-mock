import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MockRule } from '@error-mock/core';

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
  const [resultJsonError, setResultJsonError] = useState<string | null>(null);
  const [errorBodyJsonError, setErrorBodyJsonError] = useState<string | null>(
    null
  );

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
    try {
      const parsed = JSON.parse(value);
      onChange('response.result', parsed);
      setResultJsonError(null);
    } catch (err) {
      setResultJsonError('Invalid JSON format');
      // Still update the value so user can continue editing
      onChange('response.result', value);
    }
  };

  const handleErrorBodyChange = (value: string) => {
    try {
      const parsed = value.trim() ? JSON.parse(value) : undefined;
      onChange('response.errorBody', parsed);
      setErrorBodyJsonError(null);
    } catch (err) {
      setErrorBodyJsonError('Invalid JSON format');
      // Still update the value so user can continue editing
      onChange('response.errorBody', value);
    }
  };

  // Format result for display in textarea
  const getResultValue = (): string => {
    const { result } = rule.response;

    // If it's already a string (during editing with invalid JSON), return as-is
    if (typeof result === 'string') {
      return result;
    }

    // If it's null or undefined, return empty string
    if (result === null || result === undefined) {
      return '';
    }

    // Otherwise, stringify with formatting
    return JSON.stringify(result, null, 2);
  };

  // Format errorBody for display in textarea
  const getErrorBodyValue = (): string => {
    const { errorBody } = rule.response;

    // If it's already a string (during editing with invalid JSON), return as-is
    if (typeof errorBody === 'string') {
      return errorBody;
    }

    // If it's null or undefined, return empty string
    if (errorBody === null || errorBody === undefined) {
      return '';
    }

    // Otherwise, stringify with formatting
    return JSON.stringify(errorBody, null, 2);
  };

  return (
    <div className="em:h-full em:overflow-y-auto">
      {/* Status Code Selection */}
      <div className="em:p-4 em:bg-white em:border-b">
        <label
          htmlFor="statusCode"
          className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-2"
        >
          HTTP Status Code
        </label>
        <select
          id="statusCode"
          value={rule.response.status}
          onChange={(e) => handleStatusChange(parseInt(e.target.value))}
          className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
        >
          <optgroup label="Success">
            <option value="200">200 OK</option>
            <option value="201">201 Created</option>
          </optgroup>
          <optgroup label="Client Error">
            <option value="400">400 Bad Request</option>
            <option value="401">401 Unauthorized</option>
            <option value="403">403 Forbidden</option>
            <option value="404">404 Not Found</option>
            <option value="409">409 Conflict</option>
          </optgroup>
          <optgroup label="Server Error">
            <option value="500">500 Internal Server Error</option>
            <option value="502">502 Bad Gateway</option>
            <option value="503">503 Service Unavailable</option>
          </optgroup>
        </select>
      </div>

      {/* Status = 200: Business Error Configuration */}
      {rule.response.status === 200 && (
        <div className="em:p-6 em:space-y-6">
          {/* Business Templates */}
          <div>
            <label className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-2">
              📚 Business Templates
            </label>
            <div className="em:grid em:grid-cols-2 em:gap-2">
              {BUSINESS_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="em:px-3 em:py-2 em:text-sm em:border em:border-gray-300 em:rounded-md em:text-left hover:em:bg-blue-50 hover:em:border-blue-500 em:transition-colors focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Business Error Fields */}
          <div>
            <label className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-3">
              Business Error
            </label>

            <div className="em:grid em:grid-cols-3 em:gap-3">
              <div>
                <label
                  htmlFor="errNo"
                  className="em:block em:text-xs em:text-gray-500 em:mb-1"
                >
                  err_no
                </label>
                <input
                  id="errNo"
                  type="number"
                  value={rule.response.errNo}
                  onChange={(e) =>
                    onChange('response.errNo', parseInt(e.target.value) || 0)
                  }
                  className="em:w-full em:px-2 em:py-1 em:border em:border-gray-300 em:rounded em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                />
                <p className="em:text-xs em:text-gray-400 em:mt-1">0=成功</p>
              </div>

              <div className="em:col-span-2">
                <label
                  htmlFor="errMsg"
                  className="em:block em:text-xs em:text-gray-500 em:mb-1"
                >
                  err_msg
                </label>
                <input
                  id="errMsg"
                  type="text"
                  value={rule.response.errMsg}
                  onChange={(e) => onChange('response.errMsg', e.target.value)}
                  className="em:w-full em:px-2 em:py-1 em:border em:border-gray-300 em:rounded em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                />
              </div>
            </div>

            <div className="em:mt-3">
              <label
                htmlFor="detailErrMsg"
                className="em:block em:text-xs em:text-gray-500 em:mb-1"
              >
                detail_err_msg
              </label>
              <textarea
                id="detailErrMsg"
                value={rule.response.detailErrMsg}
                onChange={(e) =>
                  onChange('response.detailErrMsg', e.target.value)
                }
                rows={2}
                className="em:w-full em:px-2 em:py-1 em:border em:border-gray-300 em:rounded em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
              />
            </div>
          </div>

          {/* Response Data (result) */}
          <div>
            <label
              htmlFor="result"
              className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-2"
            >
              Response Data (result 字段)
            </label>
            <textarea
              id="result"
              value={getResultValue()}
              onChange={(e) => handleResultChange(e.target.value)}
              rows={10}
              className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded em:font-mono em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
              placeholder="{}"
            />
            {resultJsonError && (
              <p className="em:text-xs em:text-red-600 em:mt-1">
                {resultJsonError}
              </p>
            )}
            <p className="em:text-xs em:text-gray-500 em:mt-1">
              💡 最终返回：{'{ err_no, err_msg, detail_err_msg, result, sync, time_stamp, trace_id }'}
            </p>
          </div>
        </div>
      )}

      {/* Status >= 400: HTTP Error Mode */}
      {rule.response.status >= 400 && (
        <div className="em:p-6">
          <div className="em:bg-yellow-50 em:border em:border-yellow-200 em:rounded-lg em:p-4">
            <div className="em:flex em:items-start em:gap-3">
              <AlertTriangle className="em:w-5 em:h-5 em:text-yellow-600 em:shrink-0 em:mt-0.5" />
              <div>
                <h4 className="em:font-semibold em:text-yellow-900">
                  HTTP Error Mode
                </h4>
                <p className="em:text-sm em:text-yellow-700 em:mt-1">
                  将返回 HTTP {rule.response.status} 错误。
                  前端通常不解析错误响应体，会直接进入 catch 或错误处理。
                </p>
              </div>
            </div>
          </div>

          {/* Optional: Custom Error Body */}
          <details className="em:mt-4">
            <summary className="em:text-sm em:font-medium em:cursor-pointer em:text-blue-600 hover:em:text-blue-700">
              Advanced: Custom Error Body
            </summary>
            <div className="em:mt-3">
              <textarea
                id="errorBody"
                value={getErrorBodyValue()}
                onChange={(e) => handleErrorBodyChange(e.target.value)}
                placeholder='{"error": "Not Found", "message": "..."}'
                rows={6}
                className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded em:font-mono em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
              />
              {errorBodyJsonError && (
                <p className="em:text-xs em:text-red-600 em:mt-1">
                  {errorBodyJsonError}
                </p>
              )}
              <p className="em:text-xs em:text-gray-500 em:mt-1">
                留空则返回默认错误信息
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
