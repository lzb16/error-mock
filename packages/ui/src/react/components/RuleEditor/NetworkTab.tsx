import type { MockRule, GlobalConfig } from '@error-mock/core';
import type { NetworkProfile } from '@error-mock/core';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();

  const globalProfile = globalConfig.networkProfile || 'none';
  const globalProfileLabel = t(`networkProfile.${globalProfile}`);

  return (
    <div className="em:space-y-0">
      <div className="em:p-4 em:space-y-4">
        {/* Delay Configuration */}
        <div>
          <label className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-2">
            {t('networkTab.delay.title')}
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
                {t('networkTab.delay.followGlobal.title')}
              </div>
              <div className="em:text-xs em:text-gray-500 em:mt-1">
                {t('networkTab.delay.followGlobal.current', {
                  profile: globalProfileLabel,
                })}
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
                {t('networkTab.delay.override.title')}
              </div>
            </div>
          </label>

          {/* Conditional: Show profile and custom delay inputs when overriding */}
          {rule.network.profile !== null && rule.network.profile !== undefined && (
            <div className="em:ml-9 em:mt-2 em:space-y-3">
              <div>
                <label
                  htmlFor="networkProfile"
                  className="em:block em:text-xs em:text-gray-500 em:mb-1"
                >
                  {t('networkTab.delay.profile.label')}
                </label>
                <select
                  id="networkProfile"
                  value={rule.network.profile || 'none'}
                  onChange={(e) =>
                    onChange('network.profile', e.target.value as NetworkProfile)
                  }
                  className="em:w-full em:px-3 em:py-2 em:border em:border-gray-300 em:rounded-md em:text-sm focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
                >
                  <option value="none">{t('networkProfile.none')}</option>
                  <option value="fast4g">{t('networkProfile.fast4g')}</option>
                  <option value="slow3g">{t('networkProfile.slow3g')}</option>
                  <option value="2g">{t('networkProfile.2g')}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="customDelay"
                  className="em:block em:text-xs em:text-gray-500 em:mb-1"
                >
                  {t('networkTab.delay.custom.label')}
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
                  placeholder={t('networkTab.delay.custom.placeholder')}
                />
                <p className="em:text-xs em:text-gray-400 em:mt-1">
                  {t('networkTab.delay.custom.help')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Network Errors */}
        <div>
          <label className="em:block em:text-sm em:font-medium em:text-gray-700 em:mb-2">
            {t('networkTab.errors.title')}
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
              <span className="em:text-sm em:text-gray-900">{t('networkTab.errors.none')}</span>
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
                  {t('networkTab.errors.timeout.title')}
                </div>
                <div className="em:text-xs em:text-gray-500">
                  {t('networkTab.errors.timeout.desc')}
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
                  {t('networkTab.errors.offline.title')}
                </div>
                <div className="em:text-xs em:text-gray-500">
                  {t('networkTab.errors.offline.desc')}
                </div>
              </div>
            </label>
          </div>

          {/* Random Failure */}
          <div className="em:mt-3 em:pt-3 em:border-t em:border-gray-300">
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
                {t('networkTab.randomFailure.title')}
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
                  {t('networkTab.randomFailure.desc')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
