import { createTranslator } from '../translator';

describe('i18n translator', () => {
  const translator = createTranslator(
    {
      zh: {
        'hello.world': '你好，{name}！',
        'only.zh': '仅中文',
      },
      en: {
        'hello.world': 'Hello, {name}!',
      },
    },
    'zh'
  );

  it('translates in current locale', () => {
    expect(translator.translate('en', 'hello.world', { name: 'Tom' })).toBe(
      'Hello, Tom!'
    );
    expect(translator.translate('zh', 'hello.world', { name: '汤姆' })).toBe(
      '你好，汤姆！'
    );
  });

  it('falls back to default locale when key missing', () => {
    expect(translator.translate('en', 'only.zh')).toBe('仅中文');
  });

  it('returns key when missing in all locales', () => {
    expect(translator.translate('en', 'missing.key')).toBe('missing.key');
  });

  it('formats missing values as empty string', () => {
    expect(translator.translate('en', 'hello.world', {})).toBe('Hello, !');
  });

  it('resolves locale aliases', () => {
    expect(translator.resolveLocale('en-US')).toBe('en');
    expect(translator.resolveLocale('en_US')).toBe('en');
    expect(translator.resolveLocale('zh-CN')).toBe('zh');
    expect(translator.resolveLocale('zh_Hans')).toBe('zh');
    expect(translator.resolveLocale('unknown')).toBe('zh');
  });
});
