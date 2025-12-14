import type { MockRule, GlobalConfig, NetworkProfile } from '@error-mock/core';
import { useI18n } from '@/i18n';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

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
  const delayMode = rule.network.profile === null || rule.network.profile === undefined ? 'global' : 'override';
  const errorMode = rule.network.errorMode ?? 'none';
  const failRate = rule.network.failRate ?? 0;

  return (
    <div className="em:space-y-3">
      {/* Delay Configuration */}
      <div className="em:space-y-2">
        <Label className="em:text-sm em:font-medium">{t('networkTab.delay.title')}</Label>

        <RadioGroup
          value={delayMode}
          onValueChange={(value) => {
            if (value === 'global') {
              onChange('network.profile', null);
              return;
            }
            onChange('network.profile', (rule.network.profile ?? 'none') as NetworkProfile);
          }}
          className="em:gap-2"
        >
          <Label
            htmlFor="delay-mode-global"
            className="em:flex em:cursor-pointer em:items-start em:gap-3 em:rounded-lg em:border em:p-3 hover:em:bg-accent"
          >
            <RadioGroupItem id="delay-mode-global" value="global" className="em:mt-0.5" />
            <div className="em:flex-1">
              <div className="em:text-sm em:font-medium">{t('networkTab.delay.followGlobal.title')}</div>
              <div className="em:text-xs em:text-muted-foreground em:mt-1">
                {t('networkTab.delay.followGlobal.current', { profile: globalProfileLabel })}
              </div>
            </div>
          </Label>

          <Label
            htmlFor="delay-mode-override"
            className="em:flex em:cursor-pointer em:items-start em:gap-3 em:rounded-lg em:border em:p-3 hover:em:bg-accent"
          >
            <RadioGroupItem id="delay-mode-override" value="override" className="em:mt-0.5" />
            <div className="em:flex-1">
              <div className="em:text-sm em:font-medium">{t('networkTab.delay.override.title')}</div>
            </div>
          </Label>
        </RadioGroup>

        {delayMode === 'override' && (
          <div className="em:pl-7 em:pt-1 em:space-y-3">
            <div className="em:space-y-1.5">
              <Label htmlFor="networkProfile" className="em:text-xs em:text-muted-foreground">
                {t('networkTab.delay.profile.label')}
              </Label>
              <Select
                value={(rule.network.profile ?? 'none') as string}
                onValueChange={(value) => onChange('network.profile', value as NetworkProfile)}
              >
                <SelectTrigger id="networkProfile">
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

            <div className="em:space-y-1.5">
              <Label htmlFor="customDelay" className="em:text-xs em:text-muted-foreground">
                {t('networkTab.delay.custom.label')}
              </Label>
              <Input
                id="customDelay"
                type="number"
                min={0}
                max={10000}
                value={rule.network.customDelay ?? ''}
                onChange={(e) =>
                  onChange(
                    'network.customDelay',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder={t('networkTab.delay.custom.placeholder')}
              />
              <p className="em:text-xs em:text-muted-foreground">
                {t('networkTab.delay.custom.help')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Network Errors */}
      <div className="em:space-y-2">
        <Label className="em:text-sm em:font-medium">{t('networkTab.errors.title')}</Label>

        <RadioGroup
          value={errorMode}
          onValueChange={(value) =>
            onChange('network.errorMode', value === 'none' ? null : value)
          }
          className="em:gap-1"
        >
          <Label
            htmlFor="error-mode-none"
            className="em:flex em:cursor-pointer em:items-center em:gap-3 em:rounded-md em:px-2 em:py-2 hover:em:bg-accent"
          >
            <RadioGroupItem id="error-mode-none" value="none" />
            <span className="em:text-sm">{t('networkTab.errors.none')}</span>
          </Label>

          <Label
            htmlFor="error-mode-timeout"
            className="em:flex em:cursor-pointer em:items-start em:gap-3 em:rounded-md em:px-2 em:py-2 hover:em:bg-accent"
          >
            <RadioGroupItem id="error-mode-timeout" value="timeout" className="em:mt-0.5" />
            <div>
              <div className="em:text-sm em:font-medium">{t('networkTab.errors.timeout.title')}</div>
              <div className="em:text-xs em:text-muted-foreground">{t('networkTab.errors.timeout.desc')}</div>
            </div>
          </Label>

          <Label
            htmlFor="error-mode-offline"
            className="em:flex em:cursor-pointer em:items-start em:gap-3 em:rounded-md em:px-2 em:py-2 hover:em:bg-accent"
          >
            <RadioGroupItem id="error-mode-offline" value="offline" className="em:mt-0.5" />
            <div>
              <div className="em:text-sm em:font-medium">{t('networkTab.errors.offline.title')}</div>
              <div className="em:text-xs em:text-muted-foreground">{t('networkTab.errors.offline.desc')}</div>
            </div>
          </Label>
        </RadioGroup>

        <Separator className="em:my-3" />

        <div className="em:space-y-2">
          <div className="em:flex em:items-center em:gap-2">
            <Checkbox
              id="randomFailure"
              checked={failRate > 0}
              onCheckedChange={(checked) =>
                onChange('network.failRate', checked === true ? Math.max(failRate, 20) : 0)
              }
            />
            <Label htmlFor="randomFailure" className="em:text-sm em:font-medium">
              {t('networkTab.randomFailure.title')}
            </Label>
          </div>

          {failRate > 0 && (
            <div className="em:pl-6 em:space-y-2">
              <div className="em:flex em:items-center em:gap-3">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[failRate]}
                  onValueChange={(value) => onChange('network.failRate', value[0] ?? 0)}
                />
                <span className="em:text-sm em:font-mono em:tabular-nums em:w-10 em:text-right">
                  {failRate}%
                </span>
              </div>
              <p className="em:text-xs em:text-muted-foreground">
                {t('networkTab.randomFailure.desc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
