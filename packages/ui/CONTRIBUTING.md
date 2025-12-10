# UI Package Developer Guidelines

## Critical: Batch Mode Field Editing

When implementing tab content components (NetworkTab, ResponseTab, AdvancedTab), you **MUST** call `markFieldDirty()` for every user input that modifies the draft.

### Why This Matters

Batch mode relies on the `dirtyFields` set to know which fields to apply to all selected rules. If you forget to mark a field as dirty, batch Apply will silently ignore that field (Bug #2).

### Correct Pattern

```svelte
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
```

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

```typescript
it('should mark field as dirty when editing delay', () => {
  initEditor(mockRule, false);

  const { getByLabelText } = render(NetworkTab);
  const delayInput = getByLabelText('Delay (ms)');

  fireEvent.input(delayInput, { target: { value: '500' } });

  const ui = get(editorUiState);
  expect(ui.dirtyFields.has('network.delay')).toBe(true);
});
```

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
