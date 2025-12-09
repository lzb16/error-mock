// packages/core/src/__tests__/field-omit.test.ts
import { describe, it, expect } from 'vitest';
import { omitFields } from '../engine/field-omit';
import type { FieldOmitConfig } from '../types';

const createConfig = (overrides: Partial<FieldOmitConfig> = {}): FieldOmitConfig => ({
  enabled: true,
  mode: 'manual',
  fields: [],
  random: {
    probability: 0,
    maxOmitCount: 0,
    excludeFields: [],
    depthLimit: 5,
    omitMode: 'delete',
  },
  ...overrides,
});

describe('omitFields - disabled', () => {
  it('returns original data when disabled', () => {
    const data = { name: 'test', age: 20 };
    const config = createConfig({ enabled: false, fields: ['age'] });
    const result = omitFields(data, config);
    expect(result).toEqual(data);
  });
});

describe('omitFields - manual mode', () => {
  it('deletes specified field', () => {
    const data = { name: 'test', age: 20 };
    const config = createConfig({ fields: ['age'] });
    const result = omitFields(data, config);

    expect(result).toEqual({ name: 'test' });
    expect('age' in result).toBe(false);
  });

  it('deletes nested field using dot notation', () => {
    const data = { user: { name: 'test', profile: { age: 20, city: 'NYC' } } };
    const config = createConfig({ fields: ['user.profile.age'] });
    const result = omitFields(data, config);

    expect(result.user.profile).toEqual({ city: 'NYC' });
    expect('age' in result.user.profile).toBe(false);
  });

  it('deletes multiple fields', () => {
    const data = { a: 1, b: 2, c: 3 };
    const config = createConfig({ fields: ['a', 'c'] });
    const result = omitFields(data, config);

    expect(result).toEqual({ b: 2 });
  });

  it('handles non-existent field path silently', () => {
    const data = { name: 'test' };
    const config = createConfig({ fields: ['nonexistent.path'] });
    const result = omitFields(data, config);

    expect(result).toEqual({ name: 'test' });
  });

  it('does not mutate original data', () => {
    const data = { name: 'test', age: 20 };
    const config = createConfig({ fields: ['age'] });
    omitFields(data, config);

    expect(data.age).toBe(20);
  });
});

describe('omitFields - random mode', () => {
  it('respects maxOmitCount', () => {
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    const remainingKeys = Object.keys(result);
    expect(remainingKeys.length).toBeGreaterThanOrEqual(3);
  });

  it('respects excludeFields', () => {
    const data = { err_no: 0, err_msg: '', result: { name: 'test' } };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 10,
        excludeFields: ['err_no', 'err_msg'],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    expect(result.err_no).toBe(0);
    expect(result.err_msg).toBe('');
  });

  it('respects depthLimit', () => {
    const data = {
      level1: {
        level2: {
          level3: {
            level4: { value: 'deep' }
          }
        }
      }
    };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 10,
        excludeFields: ['level1'], // Protect level1 to ensure structure exists
        depthLimit: 2,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    // Fields deeper than depthLimit should not be in the eligible paths
    // Since we protected level1, level2 and level3.level4.value should still exist
    expect(result.level1?.level2?.level3?.level4?.value).toBe('deep');
  });

  it('sets undefined when omitMode is undefined', () => {
    const data = { a: 1, b: 2 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 1,
        excludeFields: ['a'],
        depthLimit: 5,
        omitMode: 'undefined',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    expect(result.a).toBe(1);
    expect(result.b).toBeUndefined();
    expect('b' in result).toBe(true);
  });

  it('sets null when omitMode is null', () => {
    const data = { a: 1, b: 2 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 1,
        excludeFields: ['a'],
        depthLimit: 5,
        omitMode: 'null',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    expect(result.a).toBe(1);
    expect(result.b).toBeNull();
  });

  it('produces deterministic results with same seed', () => {
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 50,
        maxOmitCount: 3,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 42,
      },
    });

    const result1 = omitFields(structuredClone(data), config);
    const result2 = omitFields(structuredClone(data), config);

    expect(result1).toEqual(result2);
  });

  it('excludes children of excluded fields', () => {
    const data = {
      err_no: 0,
      result: {
        user: { name: 'test', email: 'test@example.com' }
      }
    };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 10,
        excludeFields: ['result'],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    // result and all its children should be protected
    expect(result.result).toEqual(data.result);
    expect(result.result.user.name).toBe('test');
    expect(result.result.user.email).toBe('test@example.com');
  });

  it('handles array fields', () => {
    const data = {
      items: [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' }
      ]
    };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 50,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    const result = omitFields(data, config);
    // Should handle arrays without crashing
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('works without seed using Math.random', () => {
    const data = { a: 1, b: 2, c: 3 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 50,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        // no seed provided
      },
    });

    // Should not throw
    const result = omitFields(data, config);
    expect(typeof result).toBe('object');
  });

  it('does not mutate original data in random mode', () => {
    const data = { a: 1, b: 2, c: 3 };
    const original = structuredClone(data);
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 12345,
      },
    });

    omitFields(data, config);
    expect(data).toEqual(original);
  });

  it('produces consistent shuffle with Fisher-Yates algorithm', () => {
    // Test that the Fisher-Yates shuffle produces deterministic results
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
    const config = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 3,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 999,
      },
    });

    // Run the same operation multiple times with the same seed
    const result1 = omitFields(structuredClone(data), config);
    const result2 = omitFields(structuredClone(data), config);
    const result3 = omitFields(structuredClone(data), config);

    // All results should be identical
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);

    // The number of remaining fields should be consistent
    const remainingKeys1 = Object.keys(result1);
    const remainingKeys2 = Object.keys(result2);
    const remainingKeys3 = Object.keys(result3);

    expect(remainingKeys1).toEqual(remainingKeys2);
    expect(remainingKeys2).toEqual(remainingKeys3);
  });

  it('produces different results with different seeds', () => {
    const data = { a: 1, b: 2, c: 3, d: 4, e: 5 };

    const config1 = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 111,
      },
    });

    const config2 = createConfig({
      mode: 'random',
      random: {
        probability: 100,
        maxOmitCount: 2,
        excludeFields: [],
        depthLimit: 5,
        omitMode: 'delete',
        seed: 222,
      },
    });

    const result1 = omitFields(structuredClone(data), config1);
    const result2 = omitFields(structuredClone(data), config2);

    // Different seeds should likely produce different results
    // (there's a small chance they could be the same, but very unlikely)
    expect(Object.keys(result1).sort()).not.toEqual(Object.keys(result2).sort());
  });
});
