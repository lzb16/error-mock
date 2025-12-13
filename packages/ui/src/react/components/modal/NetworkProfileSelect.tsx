import { Globe } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import type { NetworkProfile } from '@error-mock/core';

export function NetworkProfileSelect() {
  const { globalConfig, updateGlobalConfig } = useConfigStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateGlobalConfig({ networkProfile: e.target.value as NetworkProfile });
  };

  return (
    <div className="em:flex em:items-center em:gap-2">
      <Globe className="em:w-4 em:h-4 em:text-gray-500" aria-hidden="true" />
      <select
        value={globalConfig.networkProfile}
        onChange={handleChange}
        className="em:px-3 em:py-1.5 em:text-sm em:border em:border-gray-300 em:rounded-md em:bg-white focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
        aria-label="Global Network Profile"
      >
        <option value="none">No Delay</option>
        <option value="fast4g">Fast 4G (150ms)</option>
        <option value="slow3g">Slow 3G (500ms)</option>
        <option value="2g">2G (1500ms)</option>
      </select>
    </div>
  );
}
