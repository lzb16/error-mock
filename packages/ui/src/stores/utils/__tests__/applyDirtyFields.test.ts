import { describe, it, expect } from 'vitest';
import { applyDirtyFields } from '../applyDirtyFields';
import { MIXED } from '../../rules';
import { createDefaultRule } from '../../rules';
import type { RuleDraft } from '../../ruleEditor';
import type { MockRule } from '@error-mock/core';

describe('applyDirtyFields', () => {
  it('should apply single dirty field to existing rule', () => {
    const existingRule: MockRule = {
      ...createDefaultRule({ module: 'test', name: 'api', url: '/test', method: 'GET' }),
      network: { delay: 100, timeout: false, offline: false, failRate: 0 }
    };

    const draft: RuleDraft = {
      ...existingRule,
      network: { delay: 500, timeout: false, offline: false, failRate: 0 }
    };

    const dirtyFields = new Set(['network.delay']);

    const result = applyDirtyFields(draft, dirtyFields, existingRule);

    expect(result.network.delay).toBe(500);
    expect(result.network.timeout).toBe(false); // unchanged
  });

  it('should filter out MIXED values during apply', () => {
    const existingRule: MockRule = createDefaultRule({
      module: 'test', name: 'api', url: '/test', method: 'GET'
    });

    const draft: RuleDraft = {
      ...existingRule,
      enabled: MIXED,
      network: { delay: MIXED, timeout: false, offline: false, failRate: 0 }
    };

    const dirtyFields = new Set(['enabled', 'network.delay']);

    const result = applyDirtyFields(draft, dirtyFields, existingRule);

    // MIXED values should NOT be applied
    expect(result.enabled).toBe(existingRule.enabled);
    expect(result.network.delay).toBe(existingRule.network.delay);
  });

  it('should create new rule from default when existing is null', () => {
    const draft: RuleDraft = {
      ...createDefaultRule({ module: 'test', name: 'api', url: '/test', method: 'GET' }),
      enabled: true,
      network: { delay: 200, timeout: true, offline: false, failRate: 0 }
    };

    const dirtyFields = new Set(['enabled', 'network.delay', 'network.timeout']);

    const result = applyDirtyFields(draft, dirtyFields, null);

    expect(result.enabled).toBe(true);
    expect(result.network.delay).toBe(200);
    expect(result.network.timeout).toBe(true);
  });

  it('should handle nested field paths correctly', () => {
    const existingRule: MockRule = createDefaultRule({
      module: 'test', name: 'api', url: '/test', method: 'GET'
    });

    const draft: RuleDraft = {
      ...existingRule,
      fieldOmit: {
        ...existingRule.fieldOmit,
        random: {
          ...existingRule.fieldOmit.random,
          probability: 0.5,
          maxOmitCount: 3
        }
      }
    };

    const dirtyFields = new Set(['fieldOmit.random.probability', 'fieldOmit.random.maxOmitCount']);

    const result = applyDirtyFields(draft, dirtyFields, existingRule);

    expect(result.fieldOmit.random.probability).toBe(0.5);
    expect(result.fieldOmit.random.maxOmitCount).toBe(3);
    expect(result.fieldOmit.random.depthLimit).toBe(5); // unchanged
  });

  it('should preserve rule identity fields (id, url, method)', () => {
    const existingRule: MockRule = {
      ...createDefaultRule({ module: 'test', name: 'api', url: '/test', method: 'GET' }),
      id: 'test-api',
      url: '/original',
      method: 'POST'
    };

    const draft: RuleDraft = {
      ...existingRule,
      id: 'changed-id',
      url: '/changed',
      method: 'DELETE',
      enabled: true
    };

    const dirtyFields = new Set(['enabled']);

    const result = applyDirtyFields(draft, dirtyFields, existingRule);

    // Identity fields should be preserved from existing rule
    expect(result.id).toBe('test-api');
    expect(result.url).toBe('/original');
    expect(result.method).toBe('POST');
    expect(result.enabled).toBe(true);
  });
});
