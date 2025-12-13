import type { MockRule, GlobalConfig } from '@error-mock/core';
import { PROFILE_DELAYS } from '@error-mock/core';
import type { NetworkProfile } from '@error-mock/core';

interface NetworkTabProps {
  rule: MockRule;
  globalConfig: GlobalConfig;
  onChange: (field: string, value: unknown) => void;
}

export function NetworkTab({
  rule,
  globalConfig,
  onChange,
}: NetworkTabProps) {
  return (
    <div className="em:h-full em:overflow-y-auto">
      <div className="em:p-6 em:space-y-6">
        {/* Delay Configuration */}
        <div>
          <label className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-3">
            Delay Configuration
          </label>

          {/* Follow Global Option */}
          <label className="em:flex em:items-center em:gap-3 em:p-3 em:border em:border-gray-300 em:rounded-lg em:cursor-pointer hover:em:bg-gray-50 em:transition-colors">
            <input
              type="radio"
              checked={rule.network.profile === null || rule.network.profile === undefined}
              onChange={() => onChange('network.profile', null)}
              className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:cursor-pointer"
            />
            <div className="em:flex-1">
              <div className="em:font-medium em:text-sm em:text-gray-900">
                Follow Global Network Profile
              </div>
              <div className="em:text-xs em:text-gray-500 em:mt-1">
                Current: {globalConfig.networkProfile || 'none'} ={' '}
                {PROFILE_DELAYS[globalConfig.networkProfile || 'none']}ms
              </div>
            </div>
          </label>

          {/* Override Option */}
          <label className="em:flex em:items-center em:gap-3 em:p-3 em:border em:border-gray-300 em:rounded-lg em:cursor-pointer hover:em:bg-gray-50 em:transition-colors em:mt-2">
            <input
              type="radio"
              checked={rule.network.profile !== null && rule.network.profile !== undefined}
              onChange={() => onChange('network.profile', 'none')}
              className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:cursor-pointer"
            />
            <div className="em:flex-1">
              <div className="em:font-medium em:text-sm em:text-gray-900">
                Override for this API
              </div>
            </div>
          </label>

          {/* Conditional: Show profile and custom delay inputs when overriding */}
          {rule.network.profile !== null && rule.network.profile !== undefined && (
            <div className="em:ml-9 em:mt-3 em:space-y-3">
              <div>
                <label
                  htmlFor="networkProfile"
                  className="em:block em:text-xs em:text-gray-500 em:mb-1"
                >
                  Network Profile
                </label>
                <select
                  id="networkProfile"
                  value={rule.network.profile || 'none'}
                  onChange={(e) =>
                    onChange('network.profile', e.target.value as NetworkProfile)
                  }
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                >
                  <option value="none">None (0ms)</option>
                  <option value="fast4g">Fast 4G (150ms)</option>
                  <option value="slow3g">Slow 3G (500ms)</option>
                  <option value="2g">2G (1500ms)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="customDelay"
                  className="em:block em:text-xs em:text-gray-500 em:mb-1"
                >
                  Or Custom Delay (ms)
                </label>
                <input
                  id="customDelay"
                  type="number"
                  min="0"
                  max="10000"
                  value={rule.network.customDelay ?? ''}
                  onChange={(e) =>
                    onChange(
                      'network.customDelay',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                  placeholder="Leave empty to use profile"
                />
                <p className="em:text-xs em:text-gray-400 em:mt-1">
                  Custom delay overrides the profile selection
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Network Errors */}
        <div>
          <label className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-3">
            Network Errors
          </label>

          <div className="em:space-y-2">
            {/* None option */}
            <label className="em:flex em:items-center em:gap-3 em:p-2 em:cursor-pointer">
              <input
                type="radio"
                checked={
                  rule.network.errorMode === null ||
                  rule.network.errorMode === undefined
                }
                onChange={() => onChange('network.errorMode', null)}
                className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:cursor-pointer"
              />
              <span className="em:text-sm em:text-gray-900">None (正常)</span>
            </label>

            {/* Timeout option */}
            <label className="em:flex em:items-center em:gap-3 em:p-2 em:cursor-pointer">
              <input
                type="radio"
                checked={rule.network.errorMode === 'timeout'}
                onChange={() => onChange('network.errorMode', 'timeout')}
                className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:cursor-pointer"
              />
              <div>
                <div className="em:text-sm em:font-medium em:text-gray-900">
                  Timeout
                </div>
                <div className="em:text-xs em:text-gray-500">
                  抛出 DOMException('TimeoutError')
                </div>
              </div>
            </label>

            {/* Offline option */}
            <label className="em:flex em:items-center em:gap-3 em:p-2 em:cursor-pointer">
              <input
                type="radio"
                checked={rule.network.errorMode === 'offline'}
                onChange={() => onChange('network.errorMode', 'offline')}
                className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:cursor-pointer"
              />
              <div>
                <div className="em:text-sm em:font-medium em:text-gray-900">
                  Offline
                </div>
                <div className="em:text-xs em:text-gray-500">
                  抛出 TypeError('Failed to fetch')
                </div>
              </div>
            </label>
          </div>

          {/* Random Failure */}
          <div className="em:mt-4 em:pt-4 em:border-t em:border-gray-300">
            <label className="em:flex em:items-center em:gap-3 em:mb-3 em:cursor-pointer">
              <input
                type="checkbox"
                checked={(rule.network.failRate || 0) > 0}
                onChange={(e) =>
                  onChange('network.failRate', e.target.checked ? 20 : 0)
                }
                className="em:w-4 em:h-4 em:text-blue-600 em:border-gray-300 em:rounded em:cursor-pointer focus:em:ring-2 focus:em:ring-blue-500"
              />
              <span className="em:text-sm em:font-medium em:text-gray-900">
                ⚡ Random Network Failure
              </span>
            </label>

            {(rule.network.failRate || 0) > 0 && (
              <div className="em:ml-7">
                <div className="em:flex em:items-center em:gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rule.network.failRate || 0}
                    onChange={(e) =>
                      onChange('network.failRate', parseInt(e.target.value))
                    }
                    className="em:flex-1 em:h-2 em:bg-gray-300 em:rounded-lg em:appearance-none em:cursor-pointer em:accent-blue-600"
                  />
                  <span className="em:text-sm em:font-mono em:font-bold em:text-gray-900 em:min-w-12 em:text-right">
                    {rule.network.failRate || 0}%
                  </span>
                </div>
                <p className="em:text-xs em:text-gray-500 em:mt-2">
                  触发时抛出 TypeError('Failed to fetch')
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
