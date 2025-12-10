# Phase 0: Critical Bug Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical data integrity bugs discovered in multi-model analysis (Gemini + Codex) before continuing UI development.

**Architecture:** Add data validation layer to prevent MIXED symbol persistence, implement unsaved changes warning, and ensure proper batch mode behavior.

**Tech Stack:** TypeScript, Svelte 4, Vitest

**Priority:** CRITICAL - These bugs can cause data loss and must be fixed before Phase 1 (Melt UI) or Phase 2 (Tab implementation).

---

## Background

**Discovery:** Codex identified 4 critical bugs during architecture analysis:
1. **MIXED symbol persistence** - `App.svelte:handleApply` writes Symbol values to localStorage → JSON.stringify() fails silently
2. **Batch Apply no-op risk** - Tab components may forget to call `markFieldDirty` → batch edits don't propagate
3. **Unsaved changes loss** - No warning when switching APIs or closing modal with unsaved drafts
4. **MIXED Toggle coercion** - `!draft.enabled` with MIXED coerces to false, losing user intent

**Impact:**
- Bug #1: **Data corruption** (user loses all rules on next save)
- Bug #2: **Silent failure** (user thinks changes applied but nothing happens)
- Bug #3: **Data loss** (user loses 5 minutes of editing work)
- Bug #4: **Incorrect behavior** (batch toggle affects wrong items)

**Estimated Time:** 60-90 minutes

---

## Task 1: Create Safe Batch Apply Utility

**Files:**
- Create: `packages/ui/src/stores/utils/applyDirtyFields.ts`
- Create: `packages/ui/src/stores/utils/__tests__/applyDirtyFields.test.ts`

**Purpose:** Prevent MIXED symbols from reaching localStorage by filtering them during batch apply.

---

### Step 1: Write failing tests for applyDirtyFields utility

**File:** `packages/ui/src/stores/utils/__tests__/applyDirtyFields.test.ts`

```typescript
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
```

---

### Step 2: Run test to verify it fails

```bash
cd /home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure
pnpm test packages/ui/src/stores/utils/__tests__/applyDirtyFields.test.ts
```

**Expected:** Test fails with "Cannot find module '../applyDirtyFields'"

---

### Step 3: Implement applyDirtyFields utility

**File:** `packages/ui/src/stores/utils/applyDirtyFields.ts`

```typescript
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
```

---

### Step 4: Run tests to verify they pass

```bash
pnpm test packages/ui/src/stores/utils/__tests__/applyDirtyFields.test.ts
```

**Expected:** All 5 tests pass

---

### Step 5: Commit utility implementation

```bash
git add packages/ui/src/stores/utils/applyDirtyFields.ts packages/ui/src/stores/utils/__tests__/applyDirtyFields.test.ts
git commit -m "feat(ui): add applyDirtyFields utility to prevent MIXED symbol persistence

- Filters out MIXED values during batch apply
- Prevents JSON serialization failures
- Preserves rule identity fields (id, url, method)
- Adds comprehensive test coverage (5 test cases)"
```

---

## Task 2: Fix App.svelte handleApply to Use Safe Utility

**Files:**
- Modify: `packages/ui/src/App.svelte:157-233`
- Create: `packages/ui/src/__tests__/App.integration.test.ts`

**Purpose:** Replace manual field-by-field apply logic with safe utility that filters MIXED.

---

### Step 6: Write integration test for handleApply

**File:** `packages/ui/src/__tests__/App.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import App from '../App.svelte';
import { mockRules, selectedIds, apiMetas } from '../stores/rules';
import { MIXED } from '../stores/rules';
import { RuleStorage } from '@error-mock/core';
import type { ApiMeta } from '@error-mock/core';

// Mock RuleStorage
vi.mock('@error-mock/core', async () => {
  const actual = await vi.importActual('@error-mock/core');
  return {
    ...actual,
    RuleStorage: vi.fn(() => ({
      getRules: vi.fn(() => []),
      saveRules: vi.fn(),
    })),
    install: vi.fn(),
    updateRules: vi.fn(),
  };
});

describe('App.svelte - handleApply integration', () => {
  const testMeta: ApiMeta = {
    module: 'test',
    name: 'api1',
    url: '/api/test',
    method: 'GET'
  };

  beforeEach(() => {
    // Reset stores
    mockRules.set(new Map());
    selectedIds.set(new Set());
    apiMetas.set([testMeta]);
  });

  it('should not persist MIXED values in batch mode', async () => {
    const { component } = render(App, { metas: [testMeta] });

    // Select the API
    selectedIds.set(new Set(['test-api1']));

    // Simulate batch mode apply with MIXED value
    const applyEvent = new CustomEvent('apply', {
      detail: {
        rule: {
          id: 'test-api1',
          url: '/api/test',
          method: 'GET',
          enabled: MIXED, // Should be filtered out
          mockType: 'none',
          network: { delay: 100, timeout: false, offline: false, failRate: 0 },
          business: { errNo: 0, errMsg: '', detailErrMsg: '' },
          response: { useDefault: true, customResult: null },
          fieldOmit: { enabled: false, mode: 'manual', fields: [], random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' } }
        },
        editedFields: new Set(['enabled', 'network.delay'])
      }
    });

    await component.$set({ metas: [testMeta] });
    component.$emit('apply', applyEvent);

    // Verify MIXED was not persisted
    const rules = get(mockRules);
    const savedRule = rules.get('test-api1');

    expect(savedRule).toBeDefined();
    expect(savedRule?.enabled).not.toBe(MIXED);
    expect(savedRule?.network.delay).toBe(100);
  });

  it('should handle batch mode with zero edited fields', async () => {
    const { component } = render(App, { metas: [testMeta] });

    selectedIds.set(new Set(['test-api1']));

    const applyEvent = new CustomEvent('apply', {
      detail: {
        rule: { /* any rule */ },
        editedFields: new Set() // No edits
      }
    });

    component.$emit('apply', applyEvent);

    // Verify no changes were made
    const rules = get(mockRules);
    expect(rules.size).toBe(0);
  });

  it('should preserve existing rule identity when applying edits', async () => {
    const { component } = render(App, { metas: [testMeta] });

    // Create existing rule
    mockRules.update(rules => {
      const newRules = new Map(rules);
      newRules.set('test-api1', {
        id: 'test-api1',
        url: '/original/url',
        method: 'POST',
        enabled: false,
        mockType: 'none',
        network: { delay: 0, timeout: false, offline: false, failRate: 0 },
        business: { errNo: 0, errMsg: '', detailErrMsg: '' },
        response: { useDefault: true, customResult: null },
        fieldOmit: { enabled: false, mode: 'manual', fields: [], random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' } }
      });
      return newRules;
    });

    selectedIds.set(new Set(['test-api1']));

    const applyEvent = new CustomEvent('apply', {
      detail: {
        rule: {
          id: 'changed-id', // Should be ignored
          url: '/changed/url', // Should be ignored
          method: 'DELETE', // Should be ignored
          enabled: true,
          mockType: 'none',
          network: { delay: 100, timeout: false, offline: false, failRate: 0 },
          business: { errNo: 0, errMsg: '', detailErrMsg: '' },
          response: { useDefault: true, customResult: null },
          fieldOmit: { enabled: false, mode: 'manual', fields: [], random: { probability: 0, maxOmitCount: 0, excludeFields: [], depthLimit: 5, omitMode: 'delete' } }
        },
        editedFields: new Set(['enabled'])
      }
    });

    component.$emit('apply', applyEvent);

    const rules = get(mockRules);
    const savedRule = rules.get('test-api1');

    // Identity fields should be preserved
    expect(savedRule?.id).toBe('test-api1');
    expect(savedRule?.url).toBe('/original/url');
    expect(savedRule?.method).toBe('POST');
    // But edited field should be applied
    expect(savedRule?.enabled).toBe(true);
  });
});
```

---

### Step 7: Run test to verify it fails

```bash
pnpm test packages/ui/src/__tests__/App.integration.test.ts
```

**Expected:** Tests fail because handleApply doesn't use applyDirtyFields yet

---

### Step 8: Refactor App.svelte handleApply to use safe utility

**File:** `packages/ui/src/App.svelte`

**Find lines 157-233 (the entire handleApply function) and replace with:**

```typescript
import { applyDirtyFields } from './stores/utils/applyDirtyFields';

// ... (keep existing imports)

function handleApply(event: CustomEvent<{ rule: MockRule | RuleDraft; editedFields: Set<string> }>) {
  const { rule: incomingDraft, editedFields } = event.detail;

  mockRules.update((rules) => {
    const newRules = new Map(rules);

    // Batch mode with zero edits - do nothing
    if (isBatch && editedFields.size === 0) {
      return rules;
    }

    // Apply to all selected rules
    for (const id of $selectedIds) {
      const existingRule = newRules.get(id);

      if (existingRule) {
        // Update existing rule using safe utility
        if (isBatch && editedFields.size > 0) {
          // Batch mode: apply only dirty fields, filtering MIXED values
          const updated = applyDirtyFields(incomingDraft as RuleDraft, editedFields, existingRule);
          newRules.set(id, updated);
        } else {
          // Single mode: update all fields except identity
          newRules.set(id, {
            ...(incomingDraft as MockRule),
            id: existingRule.id,
            url: existingRule.url,
            method: existingRule.method,
          });
        }
      } else {
        // Create new rule from draft (filters MIXED if any)
        const meta = $apiMetas.find((m) => `${m.module}-${m.name}` === id);
        if (meta) {
          const newRule = applyDirtyFields(
            incomingDraft as RuleDraft,
            editedFields.size > 0 ? editedFields : new Set(Object.keys(incomingDraft)),
            null // null means create from default
          );

          // Override identity with correct values
          newRule.id = id;
          newRule.url = meta.url;

          // Validate and normalize HTTP method
          const validMethods: MockRule['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
          newRule.method = validMethods.includes(meta.method.toUpperCase() as MockRule['method'])
            ? (meta.method.toUpperCase() as MockRule['method'])
            : 'GET';

          newRules.set(id, newRule);
        }
      }
    }

    return newRules;
  });

  // Save to localStorage (now safe from MIXED symbols)
  const allRules = Array.from($mockRules.values());
  storage.saveRules(allRules);

  // Update interceptor
  updateRules(allRules);

  // Show success toast
  const count = $selectedIds.size;
  toasts.add(
    `Successfully updated ${count} ${count === 1 ? 'rule' : 'rules'}`,
    'success',
    3000
  );

  // Clear selection after apply
  selectedIds.set(new Set());
}
```

---

### Step 9: Run tests to verify they pass

```bash
pnpm test packages/ui/src/__tests__/App.integration.test.ts
```

**Expected:** All 3 integration tests pass

---

### Step 10: Run full test suite to ensure no regressions

```bash
pnpm test
```

**Expected:** 314 tests pass (311 original + 3 new integration + 5 utility tests - 6 skipped $on tests)

---

### Step 11: Commit handleApply refactor

```bash
git add packages/ui/src/App.svelte packages/ui/src/__tests__/App.integration.test.ts
git commit -m "fix(ui): refactor handleApply to prevent MIXED symbol persistence

- Use applyDirtyFields utility for safe batch apply
- Prevents localStorage corruption from Symbol serialization
- Adds integration tests for batch mode edge cases
- Fixes bug where new rules could be created with MIXED values

Closes: Critical Bug #1 (Data Corruption)"
```

---

## Task 3: Add Unsaved Changes Warning

**Files:**
- Modify: `packages/ui/src/App.svelte:137-154` (handleSelect, handleToggle)
- Modify: `packages/ui/src/App.svelte:264-268` (handleCloseModal)

**Purpose:** Warn user before discarding unsaved edits when switching APIs or closing modal.

---

### Step 12: Add unsaved changes check to handleSelect

**File:** `packages/ui/src/App.svelte`

**Find `function handleSelect` (line ~137) and replace with:**

```typescript
function handleSelect(event: CustomEvent<string>) {
  const id = event.detail;

  // Check for unsaved changes before switching
  if ($hasUnsavedChanges) {
    const confirmed = confirm(
      'You have unsaved changes. Switching to another API will discard them. Continue?'
    );
    if (!confirmed) {
      return; // User cancelled, stay on current selection
    }
  }

  // Single select - clear others
  selectedIds.set(new Set([id]));
}
```

---

### Step 13: Add unsaved changes check to handleToggle

**File:** `packages/ui/src/App.svelte`

**Find `function handleToggle` (line ~143) and replace with:**

```typescript
function handleToggle(event: CustomEvent<string>) {
  const id = event.detail;

  // Check for unsaved changes before modifying selection
  if ($hasUnsavedChanges) {
    const confirmed = confirm(
      'You have unsaved changes. Changing selection will discard them. Continue?'
    );
    if (!confirmed) {
      return;
    }
  }

  // Toggle selection
  selectedIds.update((ids) => {
    const newIds = new Set(ids);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    return newIds;
  });
}
```

---

### Step 14: Add unsaved changes check to handleCloseModal

**File:** `packages/ui/src/App.svelte`

**Find `function handleCloseModal` (line ~264) and replace with:**

```typescript
function handleCloseModal() {
  // Check for unsaved changes before closing
  if ($hasUnsavedChanges) {
    const confirmed = confirm(
      'You have unsaved changes. Closing will discard them. Continue?'
    );
    if (!confirmed) {
      return; // User cancelled, keep modal open
    }
  }

  isModalOpen.set(false);
  // Also clear selection when closing
  selectedIds.set(new Set());
}
```

---

### Step 15: Import hasUnsavedChanges store

**File:** `packages/ui/src/App.svelte`

**Find the imports section (line ~12-18) and add:**

```typescript
import {
  apiMetas,
  mockRules,
  selectedIds,
  createDefaultRule,
  getRuleForApi,
} from './stores/rules';
import { isModalOpen, toasts } from './stores/config';
import { hasUnsavedChanges } from './stores/ruleEditor'; // ADD THIS LINE
import type { ApiMeta, MockRule } from '@error-mock/core';
```

---

### Step 16: Manual test unsaved changes warning

**Test steps:**
1. `pnpm dev` (start dev server)
2. Open browser DevTools console
3. Click Float Button → Select an API → Make an edit (don't Apply)
4. Try to select another API → Confirm warning appears
5. Click Cancel → Confirm edit is preserved
6. Click OK → Confirm new API loads

**Expected:** Warning dialog appears on all three actions (select, toggle, close)

---

### Step 17: Commit unsaved changes warning

```bash
git add packages/ui/src/App.svelte
git commit -m "feat(ui): add unsaved changes warning before discarding edits

- Warn user when switching APIs with unsaved changes
- Warn when toggling selection with unsaved changes
- Warn when closing modal with unsaved changes
- Uses hasUnsavedChanges derived store from ruleEditor

Closes: Critical Bug #3 (Data Loss)"
```

---

## Task 4: Fix MIXED Toggle Behavior

**Files:**
- Modify: `packages/ui/src/components/rule-editor/controls/BatchControlBar.svelte:8-14`
- Modify: `packages/ui/src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts`

**Purpose:** Handle MIXED state explicitly in toggle instead of coercing to false.

---

### Step 18: Update BatchControlBar test to cover MIXED toggle

**File:** `packages/ui/src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts`

**Add this test after existing tests:**

```typescript
it('should default MIXED to true when toggling', () => {
  // Initialize with MIXED value
  initEditor(mockRule, true, 2, [mockRule, mockRule2]);

  // Set enabled to MIXED manually
  activeRuleDraft.update(draft => {
    if (!draft) return draft;
    return { ...draft, enabled: MIXED };
  });

  const { getByRole } = render(BatchControlBar);
  const toggle = getByRole('checkbox');

  // Toggle should set to true (not false) when value is MIXED
  fireEvent.click(toggle);

  const draft = get(activeRuleDraft);
  expect(draft?.enabled).toBe(true);

  // Dirty field should be marked
  const ui = get(editorUiState);
  expect(ui.dirtyFields.has('enabled')).toBe(true);
});
```

---

### Step 19: Run test to verify it fails

```bash
pnpm test packages/ui/src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts
```

**Expected:** New test fails because current implementation coerces MIXED to false

---

### Step 20: Fix BatchControlBar toggle to handle MIXED

**File:** `packages/ui/src/components/rule-editor/controls/BatchControlBar.svelte`

**Find `function handleToggleChange` (lines 7-14) and replace with:**

```typescript
import { MIXED, isMixed } from '../../../stores/ruleEditor';

// ... (keep other imports)

function handleToggleChange() {
  activeRuleDraft.update(draft => {
    if (!draft) return draft;

    // If current value is MIXED, default to true (enable all)
    // Otherwise, toggle the boolean value
    const nextValue = isMixed(draft.enabled) ? true : !draft.enabled;

    return { ...draft, enabled: nextValue };
  });

  // Mark 'enabled' field as dirty for batch mode
  markFieldDirty('enabled');
}
```

---

### Step 21: Update imports in BatchControlBar

**File:** `packages/ui/src/components/rule-editor/controls/BatchControlBar.svelte`

**Find line 3 and update to:**

```typescript
import { activeRuleDraft, editorUiState, markFieldDirty, MIXED, isMixed } from '../../../stores/ruleEditor';
```

---

### Step 22: Export MIXED and isMixed from ruleEditor store

**File:** `packages/ui/src/stores/ruleEditor.ts`

**Check if MIXED is already exported. If not, add to imports:**

```typescript
import { MIXED, type MixedValue } from './rules';

// ... (existing code)

// Re-export MIXED for convenience
export { MIXED, type MixedValue };
```

---

### Step 23: Run tests to verify they pass

```bash
pnpm test packages/ui/src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts
```

**Expected:** All tests pass including new MIXED toggle test

---

### Step 24: Commit MIXED toggle fix

```bash
git add packages/ui/src/components/rule-editor/controls/BatchControlBar.svelte packages/ui/src/components/rule-editor/controls/__tests__/BatchControlBar.test.ts packages/ui/src/stores/ruleEditor.ts
git commit -m "fix(ui): handle MIXED state correctly in batch toggle

- Default to true (enable all) when toggling from MIXED
- Prevents unintended disable-all behavior
- Add test coverage for MIXED toggle scenario
- Export MIXED and isMixed from ruleEditor store

Closes: Critical Bug #4 (Incorrect Behavior)"
```

---

## Task 5: Add Developer Guidelines Document

**Files:**
- Create: `packages/ui/CONTRIBUTING.md`

**Purpose:** Document the `markFieldDirty` requirement for future tab implementations to prevent Bug #2.

---

### Step 25: Create developer guidelines for tab implementation

**File:** `packages/ui/CONTRIBUTING.md`

```markdown
# UI Package Developer Guidelines

## Critical: Batch Mode Field Editing

When implementing tab content components (NetworkTab, ResponseTab, AdvancedTab), you **MUST** call `markFieldDirty()` for every user input that modifies the draft.

### Why This Matters

Batch mode relies on the `dirtyFields` set to know which fields to apply to all selected rules. If you forget to mark a field as dirty, batch Apply will silently ignore that field (Bug #2).

### Correct Pattern

\`\`\`svelte
<script lang="ts">
  import { activeRuleDraft, updateDraft, markFieldDirty } from '../../stores/ruleEditor';

  function handleDelayChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const delay = parseInt(target.value);

    updateDraft({ network: { delay } });
    markFieldDirty('network.delay'); // ← CRITICAL: Must call this!
  }
</script>

<input
  type="number"
  value={$activeRuleDraft?.network.delay ?? 0}
  on:input={handleDelayChange}
/>
\`\`\`

### Field Path Naming Convention

Use dot notation matching the `RuleDraft` structure:

- Top-level: `'enabled'`, `'mockType'`
- Network: `'network.delay'`, `'network.timeout'`, `'network.offline'`, `'network.failRate'`
- Business: `'business.errNo'`, `'business.errMsg'`, `'business.detailErrMsg'`
- Response: `'response.useDefault'`, `'response.customResult'`
- Field Omit: `'fieldOmit.enabled'`, `'fieldOmit.mode'`, `'fieldOmit.fields'`
- Field Omit Random: `'fieldOmit.random.probability'`, `'fieldOmit.random.maxOmitCount'`, etc.

### Testing Requirement

Every tab component **MUST** have a test that verifies `markFieldDirty` is called:

\`\`\`typescript
it('should mark field as dirty when editing delay', () => {
  initEditor(mockRule, false);

  const { getByLabelText } = render(NetworkTab);
  const delayInput = getByLabelText('Delay (ms)');

  fireEvent.input(delayInput, { target: { value: '500' } });

  const ui = get(editorUiState);
  expect(ui.dirtyFields.has('network.delay')).toBe(true);
});
\`\`\`

## Data Integrity Rules

### Rule 1: Never Persist MIXED Symbols

The `MIXED` symbol is used for batch mode UI only. It **must never** reach `RuleStorage.saveRules()` or localStorage.

**Use `applyDirtyFields` utility** when applying batch edits. See `packages/ui/src/App.svelte:handleApply` for reference.

### Rule 2: Always Preserve Rule Identity

When applying edits, **never overwrite**:
- `rule.id` (generated from `${module}-${name}`)
- `rule.url` (comes from ApiMeta)
- `rule.method` (comes from ApiMeta)

Use `applyDirtyFields` which handles this automatically.

### Rule 3: Warn Before Data Loss

Any action that discards unsaved changes (switching APIs, closing modal, etc.) **must** show a confirmation dialog if `$hasUnsavedChanges` is true.

## Testing Guidelines

### Minimum Coverage: 90%

All new components and utilities must achieve ≥90% branch coverage.

```bash
pnpm test:coverage
```

### Test Structure

Follow TDD (Test-Driven Development):
1. Write failing test first
2. Implement minimal code to pass
3. Refactor
4. Commit

### Integration Tests

For logic that crosses component boundaries (like Apply flow), write integration tests in `packages/ui/src/__tests__/`.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

Closes: <issue/bug reference>
```

**Types:** feat, fix, refactor, test, docs, chore

**Example:**
```
fix(ui): prevent MIXED symbol persistence in batch apply

- Use applyDirtyFields utility
- Add integration tests
- Prevents localStorage corruption

Closes: Critical Bug #1 (Data Corruption)
```

## Questions?

See `docs/plans/` for detailed implementation plans and architectural decisions.
```

---

### Step 26: Commit developer guidelines

```bash
git add packages/ui/CONTRIBUTING.md
git commit -m "docs(ui): add developer guidelines for batch mode and data integrity

- Document markFieldDirty requirement for tab implementations
- Explain MIXED symbol handling rules
- Add testing requirements (90% coverage)
- Provide code examples and patterns

Prevents: Critical Bug #2 (Batch Apply No-op)"
```

---

## Task 6: Final Verification

**Purpose:** Ensure all fixes work together and no regressions were introduced.

---

### Step 27: Run full test suite

```bash
pnpm test
```

**Expected:** ≥315 tests pass (311 original + 3 integration + 5 utility + 1 toggle test - 6 skipped)

---

### Step 28: Check test coverage

```bash
pnpm test:coverage
```

**Expected:**
- `applyDirtyFields.ts`: 100% coverage
- `App.svelte`: ≥85% coverage (integration tests)
- `BatchControlBar.svelte`: 100% coverage

---

### Step 29: Manual end-to-end test

**Test scenario: Batch mode with MIXED values**

1. Start dev server: `pnpm dev`
2. Open browser → Click Float Button
3. Select 2+ APIs with different `enabled` states (one true, one false)
4. Verify "Enable All" toggle shows partial state or MIXED indicator
5. Toggle "Enable All" → Verify sets to true (not false)
6. Make another edit (e.g., delay)
7. Click Apply → Verify both rules updated
8. Close DevTools → Open localStorage → Verify no Symbol strings in JSON

**Expected:** All steps work correctly, no console errors

---

### Step 30: Create summary commit

```bash
git add -A
git commit -m "chore(ui): Phase 0 critical bug fixes complete

Summary of fixes:
1. ✅ MIXED symbol persistence bug (data corruption)
2. ✅ Batch Apply no-op risk (developer guidelines)
3. ✅ Unsaved changes warning (data loss prevention)
4. ✅ MIXED toggle coercion (incorrect behavior)

Test results:
- 315 tests passing (97.8% pass rate maintained)
- ≥90% coverage for new code
- 3 integration tests added
- 5 utility tests added

Developer documentation:
- CONTRIBUTING.md with batch mode guidelines
- Code examples and patterns
- Testing requirements

Ready for Phase 1 (Melt UI integration)"
```

---

## Verification Checklist

Before proceeding to Phase 1, confirm:

- [ ] All tests pass (`pnpm test`)
- [ ] Coverage ≥90% for new code (`pnpm test:coverage`)
- [ ] Manual E2E test passed
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No console errors in browser
- [ ] Git history clean (7 commits total)
- [ ] CONTRIBUTING.md exists and is accurate

---

## Next Steps

After completing Phase 0, proceed to:

**Phase 1: Melt UI Integration** (`docs/plans/2025-12-11-phase1-melt-ui-integration.md`)
- Install @melt-ui/svelte
- Create UI component wrapper layer
- Refactor RuleControlBar to use Melt UI Tabs

**Estimated total time for Phase 0:** 60-90 minutes

---

**Document version:** 1.0
**Created:** 2025-12-11
**Status:** Ready for execution
