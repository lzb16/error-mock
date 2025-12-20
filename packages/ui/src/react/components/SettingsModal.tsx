import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import type { NetworkProfile, LogLevel } from '@error-mock/core';
import { useI18n, type Locale } from '@/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function SettingsModal() {
  const [open, setOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const { globalConfig, updateGlobalConfig } = useConfigStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="em:rounded-full hover:em:bg-gray-100"
          title={t('settings.title')}
        >
          <Settings className="em:w-4 em:h-4 em:text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="em:w-80"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader showCloseButton>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="em:space-y-4 em:py-2">
          {/* Language */}
          <div className="em:space-y-2">
            <Label>{t('settings.language')}</Label>
            <Select
              value={locale}
              onValueChange={(value) => {
                if (value === 'zh' || value === 'en') {
                  setLocale(value as Locale);
                }
              }}
            >
              <SelectTrigger aria-label={t('language.ariaLabel')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">{t('language.zh')}</SelectItem>
                <SelectItem value="en">{t('language.en')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Network Profile */}
          <div className="em:space-y-2">
            <Label>{t('settings.networkProfile')}</Label>
            <Select
              value={globalConfig.networkProfile}
              onValueChange={(value) => {
                if (value === 'none' || value === 'fast4g' || value === 'slow3g' || value === '2g') {
                  updateGlobalConfig({ networkProfile: value as NetworkProfile });
                }
              }}
            >
              <SelectTrigger aria-label={t('networkProfile.ariaLabel')}>
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

          {/* Log Level */}
          <div className="em:space-y-2">
            <Label>{t('settings.logLevel')}</Label>
            <Select
              value={globalConfig.logLevel ?? 'warn'}
              onValueChange={(value) => {
                if (value === 'error' || value === 'warn' || value === 'info' || value === 'debug') {
                  updateGlobalConfig({ logLevel: value as LogLevel });
                }
              }}
            >
              <SelectTrigger aria-label={t('settings.logLevel')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">{t('logLevel.error')}</SelectItem>
                <SelectItem value="warn">{t('logLevel.warn')}</SelectItem>
                <SelectItem value="info">{t('logLevel.info')}</SelectItem>
                <SelectItem value="debug">{t('logLevel.debug')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
