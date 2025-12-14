import { Globe } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import type { NetworkProfile } from '@error-mock/core';
import { useI18n } from '@/i18n';

export function NetworkProfileSelect() {
  const { t } = useI18n();
  const { globalConfig, updateGlobalConfig } = useConfigStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'none' || value === 'fast4g' || value === 'slow3g' || value === '2g') {
      updateGlobalConfig({ networkProfile: value });
    }
  };

  return (
    <div className="em:flex em:items-center em:gap-2">
      <Globe className="em:w-4 em:h-4 em:text-gray-500" aria-hidden="true" />
      <select
        value={globalConfig.networkProfile}
        onChange={handleChange}
        className="em:px-3 em:py-1.5 em:text-sm em:border em:border-gray-300 em:rounded-md em:bg-white focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
        aria-label={t('networkProfile.ariaLabel')}
      >
        <option value="none">{t('networkProfile.none')}</option>
        <option value="fast4g">{t('networkProfile.fast4g')}</option>
        <option value="slow3g">{t('networkProfile.slow3g')}</option>
        <option value="2g">{t('networkProfile.2g')}</option>
      </select>
    </div>
  );
}
