import { MIXED, createDefaultRule } from '../rules';
import type { RuleDraft } from '../ruleEditor';
import type { MockRule, ApiMeta } from '@error-mock/core';

/**
 * Safely apply dirty fields from draft to a clean rule, filtering out MIXED values.
 *
 * This prevents MIXED symbols from being persisted to localStorage, which would
 * cause JSON.stringify() to fail silently and corrupt user data.
 *
 * @param draft - The draft containing edited values (may include MIXED)
 * @param dirtyFields - Set of field paths that were actually edited
 * @param existingRule - The existing rule to update, or null to create new
 * @returns Clean MockRule with only dirty, non-MIXED fields applied
 */
export function applyDirtyFields(
  draft: RuleDraft,
  dirtyFields: Set<string>,
  existingRule: MockRule | null
): MockRule {
  // Start with clean base (existing rule or default)
  const base: MockRule = existingRule || createDefaultRule({
    module: draft.id.split('-')[0] || 'unknown',
    name: draft.id.split('-').slice(1).join('-') || 'unknown',
    url: draft.url,
    method: draft.method
  } as ApiMeta);

  // Clone to avoid mutation
  const result: MockRule = JSON.parse(JSON.stringify(base));

  // Preserve identity fields from existing rule
  if (existingRule) {
    result.id = existingRule.id;
    result.url = existingRule.url;
    result.method = existingRule.method;
  }

  // Apply each dirty field (skipping MIXED values)
  for (const fieldPath of dirtyFields) {
    const value = getNestedValue(draft, fieldPath);

    // Skip MIXED values - they should not be persisted
    if (value === MIXED) {
      continue;
    }

    // Apply the value
    setNestedValue(result, fieldPath, value);
  }

  return result;
}

/**
 * Get nested property value by path (e.g., "network.delay")
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Set nested property value by path (e.g., "network.delay")
 * Creates intermediate objects as needed.
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}
