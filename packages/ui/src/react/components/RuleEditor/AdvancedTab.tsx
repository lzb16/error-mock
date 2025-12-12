import type { MockRule } from '@error-mock/core';

interface AdvancedTabProps {
  rule: MockRule;
  onChange: (field: string, value: unknown) => void;
}

export function AdvancedTab({ rule, onChange }: AdvancedTabProps) {
  // Handle field list changes (textarea with one field path per line)
  const handleFieldsChange = (value: string) => {
    const fieldList = value
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    onChange('fieldOmit.fields', fieldList);
  };

  return (
    <div className="em:space-y-6">
      {/* Enable Field Omit Toggle */}
      <div className="em:flex em:items-start em:justify-between em:py-2">
        <div className="em:flex-1">
          <label
            htmlFor="fieldOmitEnabled"
            className="em:block em:text-sm em:font-medium em:text-gray-700 em:cursor-pointer"
          >
            Enable Field Omit
          </label>
          <p className="em:text-xs em:text-gray-500 em:mt-1">
            Omit specific fields from response data
          </p>
        </div>
        <input
          id="fieldOmitEnabled"
          type="checkbox"
          checked={rule.fieldOmit.enabled}
          onChange={(e) => onChange('fieldOmit.enabled', e.target.checked)}
          className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:rounded em:cursor-pointer focus:em:ring-2 focus:em:ring-blue-500"
        />
      </div>

      {/* Mode Selector and Mode-Specific Fields - Only show when enabled */}
      {rule.fieldOmit.enabled && (
        <>
          {/* Mode Selector */}
          <div className="em:space-y-2">
            <label
              htmlFor="fieldOmitMode"
              className="em:block em:text-sm em:font-medium em:text-gray-700"
            >
              Omit Mode
            </label>
            <select
              id="fieldOmitMode"
              value={rule.fieldOmit.mode}
              onChange={(e) => onChange('fieldOmit.mode', e.target.value)}
              className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
            >
              <option value="manual">Manual - Specify exact field paths</option>
              <option value="random">Random - Randomly omit fields</option>
            </select>
            <p className="em:text-xs em:text-gray-500">
              {rule.fieldOmit.mode === 'manual'
                ? 'Manually specify which fields to omit'
                : 'Randomly omit fields based on probability'}
            </p>
          </div>

          {/* Manual Mode Fields */}
          {rule.fieldOmit.mode === 'manual' && (
            <div className="em:space-y-2">
              <label
                htmlFor="fieldPaths"
                className="em:block em:text-sm em:font-medium em:text-gray-700"
              >
                Field Paths to Omit
              </label>
              <textarea
                id="fieldPaths"
                value={rule.fieldOmit.fields.join('\n')}
                onChange={(e) => handleFieldsChange(e.target.value)}
                className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:font-mono em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                rows={5}
                placeholder="result.user.email&#10;result.user.phone&#10;result.metadata.timestamp"
              />
              <p className="em:text-xs em:text-gray-500">
                One field path per line (e.g., <code className="em:font-mono">result.user.name</code>)
              </p>
            </div>
          )}

          {/* Random Mode Fields */}
          {rule.fieldOmit.mode === 'random' && (
            <div className="em:space-y-6 em:pt-2">
              {/* Probability */}
              <div className="em:space-y-2">
                <label
                  htmlFor="probability"
                  className="em:block em:text-sm em:font-medium em:text-gray-700"
                >
                  Probability (%)
                </label>
                <input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={rule.fieldOmit.random.probability}
                  onChange={(e) =>
                    onChange('fieldOmit.random.probability', parseInt(e.target.value) || 0)
                  }
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                  placeholder="0"
                />
                <p className="em:text-xs em:text-gray-500">
                  Probability of applying field omission (0-100%)
                </p>
              </div>

              {/* Max Omit Count */}
              <div className="em:space-y-2">
                <label
                  htmlFor="maxOmitCount"
                  className="em:block em:text-sm em:font-medium em:text-gray-700"
                >
                  Max Omit Count
                </label>
                <input
                  id="maxOmitCount"
                  type="number"
                  min="0"
                  value={rule.fieldOmit.random.maxOmitCount}
                  onChange={(e) =>
                    onChange('fieldOmit.random.maxOmitCount', parseInt(e.target.value) || 0)
                  }
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                  placeholder="0"
                />
                <p className="em:text-xs em:text-gray-500">
                  Maximum number of fields to omit in one request
                </p>
              </div>

              {/* Depth Limit */}
              <div className="em:space-y-2">
                <label
                  htmlFor="depthLimit"
                  className="em:block em:text-sm em:font-medium em:text-gray-700"
                >
                  Depth Limit
                </label>
                <input
                  id="depthLimit"
                  type="number"
                  min="1"
                  max="10"
                  value={rule.fieldOmit.random.depthLimit}
                  onChange={(e) =>
                    onChange('fieldOmit.random.depthLimit', parseInt(e.target.value) || 5)
                  }
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                  placeholder="5"
                />
                <p className="em:text-xs em:text-gray-500">
                  Maximum depth to traverse when finding fields to omit (1-10)
                </p>
              </div>

              {/* Omit Mode */}
              <div className="em:space-y-2">
                <label
                  htmlFor="omitMode"
                  className="em:block em:text-sm em:font-medium em:text-gray-700"
                >
                  Omit Strategy
                </label>
                <select
                  id="omitMode"
                  value={rule.fieldOmit.random.omitMode}
                  onChange={(e) => onChange('fieldOmit.random.omitMode', e.target.value)}
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                >
                  <option value="delete">Delete - Remove field completely</option>
                  <option value="undefined">Undefined - Set field to undefined</option>
                  <option value="null">Null - Set field to null</option>
                </select>
                <p className="em:text-xs em:text-gray-500">
                  How to omit selected fields from the response
                </p>
              </div>

              {/* Exclude Fields */}
              <div className="em:space-y-2">
                <label
                  htmlFor="excludeFields"
                  className="em:block em:text-sm em:font-medium em:text-gray-700"
                >
                  Protected Fields
                </label>
                <textarea
                  id="excludeFields"
                  value={rule.fieldOmit.random.excludeFields.join('\n')}
                  onChange={(e) => {
                    const list = e.target.value
                      .split('\n')
                      .map((f) => f.trim())
                      .filter((f) => f.length > 0);
                    onChange('fieldOmit.random.excludeFields', list);
                  }}
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:font-mono em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                  rows={3}
                  placeholder="result.id&#10;result.timestamp&#10;err_no"
                />
                <p className="em:text-xs em:text-gray-500">
                  Fields that should never be omitted (one per line)
                </p>
              </div>

              {/* Seed (Optional) */}
              <div className="em:space-y-2">
                <label
                  htmlFor="seed"
                  className="em:block em:text-sm em:font-medium em:text-gray-700"
                >
                  Random Seed (Optional)
                </label>
                <input
                  id="seed"
                  type="number"
                  value={rule.fieldOmit.random.seed ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange(
                      'fieldOmit.random.seed',
                      val === '' ? undefined : parseInt(val) || undefined
                    );
                  }}
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                  placeholder="Leave empty for random behavior"
                />
                <p className="em:text-xs em:text-gray-500">
                  Set a seed for reproducible random behavior (optional)
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
