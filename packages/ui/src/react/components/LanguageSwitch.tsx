import { useI18n } from '@/i18n';
import type { Locale } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (value === 'zh' || value === 'en') {
          setLocale(value as Locale);
        }
      }}
    >
      <SelectTrigger className="em:w-[110px]" aria-label={t('language.ariaLabel')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh">{t('language.zh')}</SelectItem>
        <SelectItem value="en">{t('language.en')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
