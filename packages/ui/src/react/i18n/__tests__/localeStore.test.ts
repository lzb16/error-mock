import { describe, expect, it, beforeEach } from 'vitest';
import { useLocaleStore } from '../store';

describe('useLocaleStore', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'zh' });
  });

  it('defaults to zh', () => {
    expect(useLocaleStore.getState().locale).toBe('zh');
  });

  it('updates locale', () => {
    useLocaleStore.getState().setLocale('en');
    expect(useLocaleStore.getState().locale).toBe('en');
  });
});

