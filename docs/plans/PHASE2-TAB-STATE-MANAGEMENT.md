# Phase 2: Tab Implementation - State Management Requirements

## Critical Architecture Decision: Tab DOM Lifecycle

**Current Implementation (Phase 1):**
RuleEditor uses `{#if}` conditional rendering for tab content, which **destroys and recreates DOM** on every tab switch.

**Location:** `packages/ui/src/components/rule-editor/RuleEditor.svelte:77-92`

```svelte
{#if draft}
  {#if activeTab === 'network'}
    <div>Network Tab Content</div>
  {:else if activeTab === 'response'}
    <div>Response Tab Content</div>
  {:else if activeTab === 'advanced'}
    <div>Advanced Tab Content</div>
  {/if}
{/if}
```

---

## State Management Contract (MANDATORY)

### Rule: ALL Tab State MUST Live in Svelte Stores

**Why:** DOM remounting on tab switches means component-local state is destroyed.

**Affected Stores:**
- **`activeRuleDraft`** - All draft rule data (network, response, business, fieldOmit)
- **`editorUiState`** - UI state (activeTab, dirtyFields, isBatchMode, selectedCount)

---

## Implementation Guidelines for Phase 2 Tabs

### ✅ CORRECT: Store-Bound State

```svelte
<script>
  import { activeRuleDraft } from '../../../stores/ruleEditor';

  // All state bound to store - survives tab switches
</script>

<input
  type="number"
  bind:value={$activeRuleDraft.network.delay}
/>

<button on:click={() => updateDraft({ network: { timeout: true } })}>
  Enable Timeout
</button>
```

### ❌ WRONG: Component-Local State

```svelte
<script>
  // THIS WILL LOSE STATE ON TAB SWITCH!
  let localDelay = 100;
  let localTimeout = false;
</script>

<input type="number" bind:value={localDelay} />
<input type="checkbox" bind:checked={localTimeout} />
```

**Problem:** When user switches tabs and comes back, `localDelay` and `localTimeout` reset to initial values.

---

## Test Coverage Requirements

### State Preservation Tests (Already Implemented)

**Location:** `packages/ui/src/stores/__tests__/ruleEditor.test.ts`

**Test Suite:** `describe('Tab State Preservation (Critical for RuleEditor {#if} rendering)')`

**Coverage:**
- ✅ Draft mutations survive multiple tab switches
- ✅ dirtyFields tracking persists across remounts
- ✅ Complex multi-field updates preserved
- ✅ MIXED values (batch mode) persist
- ✅ unsavedChanges state maintained
- ✅ Batch mode state and selectedCount preserved
- ✅ Rapid tab switching without state loss

**Run Tests:**
```bash
pnpm test packages/ui/src/stores/__tests__/ruleEditor.test.ts
```

---

## Phase 2 Tab Components - Checklist

### Network Tab (`tabs/NetworkTab.svelte`)

**State Binding Requirements:**
- [ ] `$activeRuleDraft.network.delay` - Number input
- [ ] `$activeRuleDraft.network.timeout` - Boolean checkbox
- [ ] `$activeRuleDraft.network.offline` - Boolean checkbox
- [ ] `$activeRuleDraft.network.failRate` - Number input (0-100)
- [ ] All inputs use `updateDraft()` or two-way binding to store
- [ ] Mark fields dirty: `markFieldDirty('network.delay')`

**Test Requirements:**
- [ ] Component renders with store data
- [ ] User input updates store
- [ ] MIXED values display correctly (batch mode)
- [ ] Tab switch preserves pending edits

---

### Response Tab (`tabs/ResponseTab.svelte`)

**State Binding Requirements:**
- [ ] `$activeRuleDraft.response.useDefault` - Boolean toggle
- [ ] `$activeRuleDraft.response.customResult` - JSON editor
- [ ] `$activeRuleDraft.business.errNo` - Number input
- [ ] `$activeRuleDraft.business.errMsg` - Text input
- [ ] `$activeRuleDraft.business.detailErrMsg` - Textarea
- [ ] All inputs bind to store, not component state

**Test Requirements:**
- [ ] JSON editor state survives tab switches
- [ ] Business error fields update store
- [ ] MIXED values handled in batch mode

---

### Advanced Tab (`tabs/AdvancedTab.svelte`)

**State Binding Requirements:**
- [ ] `$activeRuleDraft.fieldOmit.enabled` - Boolean toggle
- [ ] `$activeRuleDraft.fieldOmit.mode` - Select ('manual' | 'random')
- [ ] `$activeRuleDraft.fieldOmit.fields` - Array of strings (manual mode)
- [ ] `$activeRuleDraft.fieldOmit.random.*` - All random config fields
- [ ] Complex nested state managed through `updateDraft()`

**Test Requirements:**
- [ ] Mode switching preserves other fieldOmit state
- [ ] Array fields (fields, excludeFields) update correctly
- [ ] Deep nested updates work (fieldOmit.random.*)

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Local State for UI Toggles

**Bad:**
```svelte
<script>
  let isExpanded = false; // Lost on tab switch!
</script>

<button on:click={() => isExpanded = !isExpanded}>Toggle</button>
{#if isExpanded}
  <div>Details</div>
{/if}
```

**Solution:** Store UI state in `editorUiState` or use component keys to preserve across remounts.

---

### ❌ Pitfall 2: Derived State Not Synced

**Bad:**
```svelte
<script>
  let delay = $activeRuleDraft.network.delay; // Stale on remount!

  function updateDelay(newDelay) {
    delay = newDelay; // Not updating store!
  }
</script>
```

**Solution:** Always use `updateDraft()` or direct store binding.

---

### ❌ Pitfall 3: Async State Not Persisted

**Bad:**
```svelte
<script>
  let loading = false;
  let jsonValid = true;

  async function validateJson(text) {
    loading = true; // Lost if user switches tabs mid-validation
    jsonValid = await validate(text);
    loading = false;
  }
</script>
```

**Solution:** Store async state in `editorUiState` or cancel operations on tab unmount.

---

## Verification Checklist Before PR

**Before implementing any Phase 2 tab:**
- [ ] Review RuleEditor.svelte JSDoc (lines 2-30)
- [ ] Run tab state preservation tests (7 tests must pass)
- [ ] Verify all component state uses store bindings
- [ ] Test rapid tab switching manually
- [ ] Test batch mode with MIXED values
- [ ] Check `hasUnsavedChanges` updates correctly

**Test Command:**
```bash
pnpm test packages/ui/src/stores/__tests__/ruleEditor.test.ts -t "Tab State Preservation"
```

**Expected:** All 7 tests pass ✅

---

## Architecture Rationale

### Why {#if} Instead of class:hidden?

**Option A: Keep All Tabs in DOM (class:hidden)**
- ✅ Pros: Preserves local state automatically
- ❌ Cons: All tabs rendered even if unused, performance overhead

**Option B: Destroy/Recreate with {#if} (CHOSEN)**
- ✅ Pros: Optimal performance, clean DOM, no memory leaks
- ✅ Pros: We control Phase 2 implementation
- ⚠️ Requires: Discipline to always use stores

**Decision:** Option B chosen because:
1. We control all Phase 2 tab implementations
2. Store-based architecture is already established
3. Better performance and memory management
4. Tests enforce the contract

---

## References

**Documentation:**
- RuleEditor JSDoc: `packages/ui/src/components/rule-editor/RuleEditor.svelte:2-30`
- Store Implementation: `packages/ui/src/stores/ruleEditor.ts`
- Test Suite: `packages/ui/src/stores/__tests__/ruleEditor.test.ts:536-700`

**Key Functions:**
- `initEditor(rule, isBatch, selectedCount, batchRules?)` - Initialize editor
- `updateDraft(updates)` - Deep merge updates into draft
- `markFieldDirty(field)` - Track edited fields (batch mode)
- `setActiveTab(tab)` - Switch active tab
- `resetEditor()` - Clear all state

---

## Contact & Questions

**Identified Issue By:** Codex review (2025-12-10)
**Documented By:** Claude Code
**Phase 1 Implementation:** Complete (tab structure + store + tests)
**Phase 2 Status:** Pending - Use this document as mandatory guide

**Questions?** Review test suite for concrete examples of correct usage.
