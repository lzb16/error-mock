import { describe, expect, it } from 'vitest';
import { zh } from '../locales/zh';
import { en } from '../locales/en';

describe('i18n locales parity', () => {
  it('keeps zh and en keys in sync', () => {
    const zhKeys = Object.keys(zh).sort();
    const enKeys = Object.keys(en).sort();

    expect(enKeys).toEqual(zhKeys);
  });
});

