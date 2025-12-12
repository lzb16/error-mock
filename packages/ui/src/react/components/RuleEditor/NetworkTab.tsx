import type { MockRule } from '@error-mock/core';

interface NetworkTabProps {
  rule: MockRule;
  onChange: (field: string, value: unknown) => void;
}

export function NetworkTab({ rule, onChange }: NetworkTabProps) {
  return (
    <div className="em:space-y-6">
      {/* Delay Input */}
      <div className="em:space-y-2">
        <label
          htmlFor="delay"
          className="em:block em:text-sm em:font-medium em:text-gray-700"
        >
          Delay (ms)
        </label>
        <input
          id="delay"
          type="number"
          min="0"
          max="10000"
          value={rule.network.delay}
          onChange={(e) => onChange('network.delay', parseInt(e.target.value) || 0)}
          className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
          placeholder="0"
        />
        <p className="em:text-xs em:text-gray-500">Add delay before response</p>
      </div>

      {/* Fail Rate Input */}
      <div className="em:space-y-2">
        <label
          htmlFor="failRate"
          className="em:block em:text-sm em:font-medium em:text-gray-700"
        >
          Random Fail Rate (%)
        </label>
        <input
          id="failRate"
          type="number"
          min="0"
          max="100"
          step="1"
          value={rule.network.failRate}
          onChange={(e) => onChange('network.failRate', parseFloat(e.target.value) || 0)}
          className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
          placeholder="0"
        />
        <p className="em:text-xs em:text-gray-500">Probability of random failure (0-100%)</p>
      </div>

      {/* Timeout Switch */}
      <div className="em:flex em:items-start em:justify-between em:py-2">
        <div className="em:flex-1">
          <label
            htmlFor="timeout"
            className="em:block em:text-sm em:font-medium em:text-gray-700 em:cursor-pointer"
          >
            Simulate Timeout
          </label>
          <p className="em:text-xs em:text-gray-500 em:mt-1">Return timeout error</p>
        </div>
        <input
          id="timeout"
          type="checkbox"
          checked={rule.network.timeout}
          onChange={(e) => onChange('network.timeout', e.target.checked)}
          className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:rounded em:cursor-pointer focus:em:ring-2 focus:em:ring-blue-500"
        />
      </div>

      {/* Offline Switch */}
      <div className="em:flex em:items-start em:justify-between em:py-2">
        <div className="em:flex-1">
          <label
            htmlFor="offline"
            className="em:block em:text-sm em:font-medium em:text-gray-700 em:cursor-pointer"
          >
            Simulate Offline
          </label>
          <p className="em:text-xs em:text-gray-500 em:mt-1">Return network error</p>
        </div>
        <input
          id="offline"
          type="checkbox"
          checked={rule.network.offline}
          onChange={(e) => onChange('network.offline', e.target.checked)}
          className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:rounded em:cursor-pointer focus:em:ring-2 focus:em:ring-blue-500"
        />
      </div>
    </div>
  );
}
