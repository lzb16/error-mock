import { useState } from 'react';
import type { MockRule } from '@error-mock/core';

interface ResponseTabProps {
  rule: MockRule;
  onChange: (field: string, value: unknown) => void;
}

export function ResponseTab({ rule, onChange }: ResponseTabProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      onChange('response.customResult', parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON format');
      // Still update the value so user can continue editing
      onChange('response.customResult', value);
    }
  };

  // Format customResult for display in textarea
  const getCustomResultValue = (): string => {
    const { customResult } = rule.response;

    // If it's already a string (during editing with invalid JSON), return as-is
    if (typeof customResult === 'string') {
      return customResult;
    }

    // If it's null or undefined, return empty string
    if (customResult === null || customResult === undefined) {
      return '';
    }

    // Otherwise, stringify with formatting
    return JSON.stringify(customResult, null, 2);
  };

  return (
    <div className="em:space-y-6">
      {/* Use Default Response Toggle */}
      <div className="em:flex em:items-start em:justify-between em:py-2">
        <div className="em:flex-1">
          <label
            htmlFor="useDefault"
            className="em:block em:text-sm em:font-medium em:text-gray-700 em:cursor-pointer"
          >
            Use Default Response
          </label>
          <p className="em:text-xs em:text-gray-500 em:mt-1">
            Return empty object {'{}'} as result
          </p>
        </div>
        <input
          id="useDefault"
          type="checkbox"
          checked={rule.response.useDefault}
          onChange={(e) => onChange('response.useDefault', e.target.checked)}
          className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:rounded em:cursor-pointer focus:em:ring-2 focus:em:ring-blue-500"
        />
      </div>

      {/* Custom Result - Only show when useDefault is false */}
      {!rule.response.useDefault && (
        <div className="em:space-y-2">
          <label
            htmlFor="customResult"
            className="em:block em:text-sm em:font-medium em:text-gray-700"
          >
            Custom Result (JSON)
          </label>
          <textarea
            id="customResult"
            value={getCustomResultValue()}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:font-mono em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
            rows={10}
            placeholder='{"key": "value"}'
          />
          {jsonError && (
            <p className="em:text-xs em:text-red-600">{jsonError}</p>
          )}
          <p className="em:text-xs em:text-gray-500">Custom JSON object to return</p>
        </div>
      )}
    </div>
  );
}
