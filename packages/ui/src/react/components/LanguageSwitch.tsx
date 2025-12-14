import { useI18n } from '@/i18n';
import type { Locale } from '@/i18n';

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'zh' || value === 'en') {
      setLocale(value as Locale);
    }
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="em:px-2 em:py-1.5 em:text-sm em:border em:border-gray-300 em:rounded-md em:bg-white focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:border-blue-500"
      aria-label={t('language.ariaLabel')}
    >
      <option value="zh">{t('language.zh')}</option>
      <option value="en">{t('language.en')}</option>
    </select>
  );
}

