import { Globe } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import type { NetworkProfile } from '@error-mock/core';
import { useI18n } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function NetworkProfileSelect() {
  const { t } = useI18n();
  const { globalConfig, updateGlobalConfig } = useConfigStore();

  return (
    <div className="em:flex em:items-center em:gap-2">
      <Globe className="em:w-4 em:h-4 em:text-gray-500" aria-hidden="true" />
      <Select
        value={globalConfig.networkProfile}
        onValueChange={(value) => {
          if (value === 'none' || value === 'fast4g' || value === 'slow3g' || value === '2g') {
            updateGlobalConfig({ networkProfile: value as NetworkProfile });
          }
        }}
      >
        <SelectTrigger className="em:w-[180px]" aria-label={t('networkProfile.ariaLabel')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{t('networkProfile.none')}</SelectItem>
          <SelectItem value="fast4g">{t('networkProfile.fast4g')}</SelectItem>
          <SelectItem value="slow3g">{t('networkProfile.slow3g')}</SelectItem>
          <SelectItem value="2g">{t('networkProfile.2g')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
