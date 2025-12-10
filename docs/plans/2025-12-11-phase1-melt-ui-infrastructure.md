# Phase 1: Melt UI Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create reusable UI component wrapper layer around Melt UI (headless library) to isolate third-party dependencies and enable future migration to Bits UI (Svelte 5).

**Architecture:** Build abstraction layer in `packages/ui/src/components/ui/` that wraps Melt UI primitives with GitHub Primer styling. Business components will use these wrappers instead of Melt UI directly.

**Tech Stack:** Melt UI (Svelte 4), Tailwind CSS, Vitest

**Priority:** HIGH - Must complete before Phase 2 (Tab implementation). Gemini emphasized this step is critical for maintainability.

---

## Background

**Why Wrapper Layer?**

Gemini's key insight:
> "Don't use Melt UI directly in business code. Create a wrapper layer (`src/components/ui/`). If you need to migrate to Bits UI (Svelte 5) later, you only modify the wrapper files, not business logic."

**Component Library Decision:**
- ❌ Bits UI - Requires Svelte 5.33+
- ❌ Ark UI - Requires Svelte 5.20+
- ✅ **Melt UI** - Supports Svelte 4 (only option)

**Design System:** GitHub Primer
- Primary Blue: `#0969DA`
- Success Green: `#1F883D`
- Border: `#D0D7DE`
- Background: `#F6F8FA` (subtle), `#FFFFFF` (white)

**Estimated Time:** 45-60 minutes

---

## Task 1: Install Melt UI

**Files:**
- Modify: `packages/ui/package.json`

**Purpose:** Add Melt UI as dependency for headless UI components.

---

### Step 1: Install Melt UI package

```bash
cd /home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure
pnpm add @melt-ui/svelte --filter @error-mock/ui
```

**Expected output:**
```
Progress: resolved X, reused Y, downloaded Z, added 1
+ @melt-ui/svelte 0.83.0

Done in Xs
```

---

### Step 2: Verify installation

```bash
grep "@melt-ui/svelte" packages/ui/package.json
```

**Expected:** Line showing `"@melt-ui/svelte": "^0.83.0"` (or latest version)

---

### Step 3: Commit Melt UI installation

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "build(ui): install Melt UI for headless component primitives

- Add @melt-ui/svelte ^0.83.0
- Only Svelte 4 compatible headless library available
- Will wrap in abstraction layer for future migration

Phase 1 - Task 1/3"
```

---

## Task 2: Create Tabs Component Wrapper

**Files:**
- Create: `packages/ui/src/components/ui/Tabs.svelte`
- Create: `packages/ui/src/components/ui/__tests__/Tabs.test.ts`

**Purpose:** Wrap Melt UI's `createTabs` with GitHub Primer styling and simple API.

**Design Reference:** `docs/prototypes/03-tab-content-core.md` Section 1.2

---

### Step 4: Write failing test for Tabs component

**File:** `packages/ui/src/components/ui/__tests__/Tabs.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Tabs from '../Tabs.svelte';

describe('Tabs.svelte', () => {
  const tabs = [
    { value: 'network', label: 'Network' },
    { value: 'response', label: 'Response' },
    { value: 'advanced', label: 'Advanced' }
  ];

  it('should render all tab triggers', () => {
    const { getByText } = render(Tabs, { tabs, value: 'network' });

    expect(getByText('Network')).toBeInTheDocument();
    expect(getByText('Response')).toBeInTheDocument();
    expect(getByText('Advanced')).toBeInTheDocument();
  });

  it('should highlight active tab with GitHub style', () => {
    const { getByText } = render(Tabs, { tabs, value: 'network' });

    const networkTab = getByText('Network').closest('button');
    expect(networkTab).toHaveClass('em-bg-[#F6F8FA]'); // Active background
    expect(networkTab).toHaveClass('em-text-[#1F2328]'); // Active text
  });

  it('should call onChange when clicking inactive tab', async () => {
    const handleChange = vi.fn();
    const { getByText } = render(Tabs, { tabs, value: 'network', onChange: handleChange });

    const responseTab = getByText('Response');
    await fireEvent.click(responseTab);

    expect(handleChange).toHaveBeenCalledWith('response');
  });

  it('should support keyboard navigation (Arrow keys)', async () => {
    const handleChange = vi.fn();
    const { getByText } = render(Tabs, { tabs, value: 'network', onChange: handleChange });

    const networkTab = getByText('Network');
    networkTab.focus();

    // Press ArrowRight to move to next tab
    await fireEvent.keyDown(networkTab, { key: 'ArrowRight' });

    // Should focus Response tab and call onChange
    const responseTab = getByText('Response');
    expect(document.activeElement).toBe(responseTab);
  });

  it('should have proper ARIA attributes', () => {
    const { getByText } = render(Tabs, { tabs, value: 'network' });

    const networkTab = getByText('Network').closest('button');
    expect(networkTab).toHaveAttribute('role', 'tab');
    expect(networkTab).toHaveAttribute('aria-selected', 'true');

    const responseTab = getByText('Response').closest('button');
    expect(responseTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should render in horizontal layout by default', () => {
    const { container } = render(Tabs, { tabs, value: 'network' });

    const tabList = container.querySelector('[role="tablist"]');
    expect(tabList).toHaveClass('em-flex');
    expect(tabList).toHaveClass('em-gap-1');
  });
});
```

---

### Step 5: Run test to verify it fails

```bash
pnpm test packages/ui/src/components/ui/__tests__/Tabs.test.ts
```

**Expected:** Test fails with "Cannot find module '../Tabs.svelte'"

---

### Step 6: Implement Tabs wrapper component

**File:** `packages/ui/src/components/ui/Tabs.svelte`

```svelte
<script lang="ts">
  import { createTabs, melt } from '@melt-ui/svelte';

  /**
   * Tab definition
   */
  export interface Tab {
    value: string;
    label: string;
    disabled?: boolean;
  }

  /**
   * Array of tabs to display
   */
  export let tabs: Tab[] = [];

  /**
   * Currently active tab value
   */
  export let value: string;

  /**
   * Callback when tab changes
   */
  export let onChange: ((value: string) => void) | undefined = undefined;

  /**
   * Layout orientation (default: horizontal)
   */
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';

  // Create Melt UI tabs with controlled value
  const {
    elements: { root, list, trigger },
    states: { value: meltValue }
  } = createTabs({
    defaultValue: value,
    orientation,
    onValueChange: ({ next }) => {
      if (next && onChange) {
        onChange(next);
      }
      return next;
    }
  });

  // Sync external value prop with internal Melt state
  $: if (value !== undefined && value !== $meltValue) {
    meltValue.set(value);
  }
</script>

<div use:melt={$root}>
  <!-- Tab List (Navigation) -->
  <nav
    use:melt={$list}
    class="em-flex em-gap-1"
    class:em-flex-col={orientation === 'vertical'}
  >
    {#each tabs as tab (tab.value)}
      {@const isActive = $meltValue === tab.value}
      <button
        use:melt={$trigger(tab.value)}
        disabled={tab.disabled}
        class="
          em-rounded-md
          em-px-3
          em-py-1.5
          em-text-sm
          em-font-medium
          em-transition-colors
          focus:em-outline-none
          focus:em-ring-2
          focus:em-ring-[#0969DA]
          focus:em-ring-offset-1
          disabled:em-cursor-not-allowed
          disabled:em-opacity-50
        "
        class:em-bg-[#F6F8FA]={isActive}
        class:em-text-[#1F2328]={isActive}
        class:em-text-[#656D76]={!isActive}
        class:hover:em-bg-[#F6F8FA]={!isActive}
        class:hover:em-text-[#1F2328]={!isActive}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- Tab Content Slot (rendered by parent) -->
  <slot />
</div>
```

---

### Step 7: Run tests to verify they pass

```bash
pnpm test packages/ui/src/components/ui/__tests__/Tabs.test.ts
```

**Expected:** All 6 tests pass

---

### Step 8: Manual visual test

**Create temporary test file:** `packages/ui/src/components/ui/TabsDemo.svelte`

```svelte
<script lang="ts">
  import Tabs from './Tabs.svelte';

  let activeTab = 'network';

  const tabs = [
    { value: 'network', label: 'Network' },
    { value: 'response', label: 'Response' },
    { value: 'advanced', label: 'Advanced' }
  ];
</script>

<div class="em-p-6 em-space-y-4">
  <h1 class="em-text-base em-font-bold">Tabs Component Demo</h1>

  <div class="em-border em-border-[#D0D7DE] em-rounded-lg em-p-4">
    <Tabs {tabs} bind:value={activeTab} onChange={(v) => console.log('Changed to:', v)} />

    <div class="em-mt-4 em-p-4 em-bg-[#F6F8FA] em-rounded">
      <p class="em-text-sm">Active tab: <strong>{activeTab}</strong></p>
    </div>
  </div>
</div>
```

**Test in browser:**
1. `pnpm dev`
2. Temporarily add `<TabsDemo />` to `App.svelte`
3. Verify:
   - Tabs render with correct styling
   - Clicking changes active tab
   - Keyboard arrows work
   - Focus ring appears (blue GitHub style)

**Remove demo file after testing:**
```bash
rm packages/ui/src/components/ui/TabsDemo.svelte
```

---

### Step 9: Commit Tabs wrapper

```bash
git add packages/ui/src/components/ui/Tabs.svelte packages/ui/src/components/ui/__tests__/Tabs.test.ts
git commit -m "feat(ui): add Tabs wrapper component with GitHub Primer styling

- Wraps Melt UI createTabs for abstraction
- Implements GitHub-style tab navigation
- Supports keyboard navigation (Arrow keys)
- Proper ARIA attributes for accessibility
- 6 test cases covering behavior and styling

Phase 1 - Task 2/3"
```

---

## Task 3: Create Switch Component Wrapper

**Files:**
- Create: `packages/ui/src/components/ui/Switch.svelte`
- Create: `packages/ui/src/components/ui/__tests__/Switch.test.ts`

**Purpose:** Wrap Melt UI's `createSwitch` with GitHub toggle styling (green when on).

**Design Reference:** `docs/prototypes/03-tab-content-core.md` Section 1.2 (Enable Toggle)

---

### Step 10: Write failing test for Switch component

**File:** `packages/ui/src/components/ui/__tests__/Switch.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Switch from '../Switch.svelte';

describe('Switch.svelte', () => {
  it('should render with label', () => {
    const { getByText } = render(Switch, { label: 'Enable', checked: false });

    expect(getByText('Enable')).toBeInTheDocument();
  });

  it('should show checked state with green background', () => {
    const { container } = render(Switch, { label: 'Enable', checked: true });

    const track = container.querySelector('.em-relative.em-h-5.em-w-9');
    expect(track).toHaveClass('peer-checked:em-bg-[#1F883D]'); // GitHub green
  });

  it('should show unchecked state with gray background', () => {
    const { container } = render(Switch, { label: 'Enable', checked: false });

    const track = container.querySelector('.em-relative.em-h-5.em-w-9');
    expect(track).toHaveClass('em-bg-[#D0D7DE]'); // GitHub border gray
  });

  it('should call onChange when clicked', async () => {
    const handleChange = vi.fn();
    const { getByRole } = render(Switch, {
      label: 'Enable',
      checked: false,
      onChange: handleChange
    });

    const checkbox = getByRole('checkbox', { hidden: true });
    await fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should toggle thumb position when checked', () => {
    const { container, rerender } = render(Switch, { label: 'Enable', checked: false });

    let thumb = container.querySelector('.em-absolute.em-left-\\[2px\\]');
    expect(thumb).not.toHaveClass('peer-checked:em-translate-x-4');

    rerender({ label: 'Enable', checked: true });

    thumb = container.querySelector('.em-absolute.em-left-\\[2px\\]');
    expect(thumb?.parentElement).toHaveClass('peer-checked:em-bg-[#1F883D]');
  });

  it('should support disabled state', () => {
    const { getByRole } = render(Switch, {
      label: 'Enable',
      checked: false,
      disabled: true
    });

    const checkbox = getByRole('checkbox', { hidden: true });
    expect(checkbox).toBeDisabled();
  });

  it('should have proper ARIA attributes', () => {
    const { getByRole } = render(Switch, { label: 'Enable', checked: true });

    const checkbox = getByRole('checkbox', { hidden: true });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});
```

---

### Step 11: Run test to verify it fails

```bash
pnpm test packages/ui/src/components/ui/__tests__/Switch.test.ts
```

**Expected:** Test fails with "Cannot find module '../Switch.svelte'"

---

### Step 12: Implement Switch wrapper component

**File:** `packages/ui/src/components/ui/Switch.svelte`

```svelte
<script lang="ts">
  import { createSwitch, melt } from '@melt-ui/svelte';

  /**
   * Label text for the switch
   */
  export let label: string = '';

  /**
   * Whether the switch is checked
   */
  export let checked: boolean = false;

  /**
   * Whether the switch is disabled
   */
  export let disabled: boolean = false;

  /**
   * Callback when switch state changes
   */
  export let onChange: ((checked: boolean) => void) | undefined = undefined;

  /**
   * Size variant (default: md)
   */
  export let size: 'sm' | 'md' = 'md';

  // Create Melt UI switch
  const {
    elements: { root, input },
    states: { checked: meltChecked }
  } = createSwitch({
    defaultChecked: checked,
    disabled,
    onCheckedChange: ({ next }) => {
      if (onChange) {
        onChange(next);
      }
      return next;
    }
  });

  // Sync external checked prop with internal Melt state
  $: if (checked !== undefined && checked !== $meltChecked) {
    meltChecked.set(checked);
  }

  // Sync disabled state
  $: if (disabled !== undefined) {
    // Melt UI handles disabled through the disabled prop
  }

  // Size classes
  $: trackClasses = size === 'sm'
    ? 'em-h-4 em-w-7'
    : 'em-h-5 em-w-9';

  $: thumbClasses = size === 'sm'
    ? 'em-h-3 em-w-3'
    : 'em-h-4 em-w-4';

  $: thumbTranslate = size === 'sm'
    ? 'peer-checked:em-translate-x-3'
    : 'peer-checked:em-translate-x-4';
</script>

<label
  use:melt={$root}
  class="em-flex em-items-center em-gap-2 em-cursor-pointer"
  class:em-opacity-50={disabled}
  class:em-cursor-not-allowed={disabled}
>
  {#if label}
    <span class="em-text-xs em-font-medium em-text-[#1F2328]">
      {label}
    </span>
  {/if}

  <!-- Hidden native checkbox (for accessibility) -->
  <input
    use:melt={$input}
    type="checkbox"
    class="em-peer em-sr-only"
  />

  <!-- Visual track -->
  <div
    class="
      em-relative
      {trackClasses}
      em-rounded-full
      em-bg-[#D0D7DE]
      em-transition-colors
      peer-checked:em-bg-[#1F883D]
      peer-focus:em-ring-2
      peer-focus:em-ring-[#0969DA]
      peer-focus:em-ring-offset-1
    "
  >
    <!-- Thumb -->
    <span
      class="
        em-absolute
        em-left-[2px]
        em-top-[2px]
        {thumbClasses}
        em-rounded-full
        em-bg-white
        em-shadow-sm
        em-transition-transform
        {thumbTranslate}
      "
    ></span>
  </div>
</label>
```

---

### Step 13: Run tests to verify they pass

```bash
pnpm test packages/ui/src/components/ui/__tests__/Switch.test.ts
```

**Expected:** All 7 tests pass

---

### Step 14: Commit Switch wrapper

```bash
git add packages/ui/src/components/ui/Switch.svelte packages/ui/src/components/ui/__tests__/Switch.test.ts
git commit -m "feat(ui): add Switch wrapper component with GitHub toggle styling

- Wraps Melt UI createSwitch for abstraction
- GitHub green (#1F883D) when enabled
- Supports sm and md sizes
- Proper ARIA attributes for accessibility
- 7 test cases covering behavior and styling

Phase 1 - Task 3/3"
```

---

## Task 4: Update RuleControlBar to Use Tabs Wrapper

**Files:**
- Modify: `packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte:1-96`
- Modify: `packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts`

**Purpose:** Replace hand-written tab buttons with Tabs wrapper component.

---

### Step 15: Update RuleControlBar tests for Tabs component

**File:** `packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts`

**Find the test "should switch tabs when clicked" and update expectations:**

```typescript
it('should switch tabs when clicked', () => {
  initEditor(mockRule, false);

  const { getByText } = render(RuleControlBar);

  // Click Response tab
  const responseTab = getByText('Response');
  fireEvent.click(responseTab);

  // Verify store was updated
  const state = get(editorUiState);
  expect(state.activeTab).toBe('response');
});

it('should support keyboard navigation between tabs', async () => {
  initEditor(mockRule, false);

  const { getByText } = render(RuleControlBar);

  const networkTab = getByText('Network');
  networkTab.focus();

  // Press ArrowRight
  await fireEvent.keyDown(networkTab, { key: 'ArrowRight' });

  // Should move to Response tab
  const state = get(editorUiState);
  expect(state.activeTab).toBe('response');
});
```

---

### Step 16: Run tests to verify current implementation

```bash
pnpm test packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts
```

**Expected:** Tests still pass with hand-written tabs (baseline)

---

### Step 17: Refactor RuleControlBar to use Tabs wrapper

**File:** `packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte`

**Replace entire file content:**

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import { editorUiState, setActiveTab, activeRuleDraft, updateDraft, markFieldDirty } from '../../../stores/ruleEditor';
  import type { MockRule } from '@error-mock/core';

  const dispatch = createEventDispatcher();

  // Tab definitions
  const tabs = [
    { value: 'network', label: 'Network' },
    { value: 'response', label: 'Response' },
    { value: 'advanced', label: 'Advanced' }
  ];

  function handleTabChange(tab: string) {
    setActiveTab(tab as 'network' | 'response' | 'advanced');
  }

  function handleMockTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const mockType = target.value as MockRule['mockType'];
    updateDraft({ mockType });
    markFieldDirty('mockType');
  }

  function handleToggleChange() {
    activeRuleDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, enabled: !draft.enabled };
    });
    markFieldDirty('enabled');
  }
</script>

<!-- RULE CONTROL BAR (Single Mode) -->
<div class="em-shrink-0 em-border-b em-border-[#D0D7DE] em-bg-white em-px-6 em-py-3">
  <div class="em-flex em-items-center em-justify-between">

    <!-- Left: Tabs (Using Tabs Wrapper) -->
    <Tabs
      {tabs}
      value={$editorUiState.activeTab}
      onChange={handleTabChange}
    />

    <!-- Right: Primary Actions -->
    <div class="em-flex em-items-center em-gap-4">

      <!-- Mock Type Dropdown -->
      <div class="em-relative">
        <select
          class="em-w-36 em-appearance-none em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-1.5 em-pr-8 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none"
          value={$activeRuleDraft?.mockType ?? 'none'}
          on:change={handleMockTypeChange}
        >
          <option value="networkError">Network Error</option>
          <option value="businessError">Business Error</option>
          <option value="success">Success</option>
          <option value="none">None</option>
        </select>
        <!-- Chevron -->
        <svg class="em-pointer-events-none em-absolute em-right-2.5 em-top-2.5 em-h-3 em-w-3 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 5.22a.75.75 0 0 1 1.06 0L8 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L3.72 6.28a.75.75 0 0 1 0-1.06Z"/>
        </svg>
      </div>

      <div class="em-h-4 em-w-px em-bg-[#D0D7DE]"></div>

      <!-- Enable Toggle -->
      <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
        <span class="em-text-xs em-font-medium em-text-[#1F2328]">Enable</span>
        <input
          type="checkbox"
          class="em-peer em-sr-only"
          checked={$activeRuleDraft?.enabled ?? false}
          on:change={handleToggleChange}
        >
        <div class="em-relative em-h-5 em-w-9 em-rounded-full em-bg-[#D0D7DE] em-transition-colors peer-checked:em-bg-[#1F883D] peer-focus:em-ring-2 peer-focus:em-ring-[#0969DA] peer-focus:em-ring-offset-1">
          <span class="em-absolute em-left-[2px] em-top-[2px] em-h-4 em-w-4 em-rounded-full em-bg-white em-shadow-sm em-transition-transform peer-checked:em-translate-x-4"></span>
        </div>
      </label>
    </div>
  </div>
</div>
```

---

### Step 18: Run tests to verify refactor works

```bash
pnpm test packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts
```

**Expected:** All tests still pass (behavior unchanged, implementation improved)

---

### Step 19: Run full test suite

```bash
pnpm test
```

**Expected:** 317 tests pass (315 from Phase 0 + 6 Tabs + 7 Switch tests - 11 skipped)

---

### Step 20: Commit RuleControlBar refactor

```bash
git add packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts
git commit -m "refactor(ui): use Tabs wrapper in RuleControlBar

- Replace hand-written tab buttons with Tabs component
- Reduces code from ~30 lines to <10 lines for tabs
- Gains keyboard navigation and ARIA support
- All existing tests still pass

Phase 1 - Complete"
```

---

## Task 5: Create UI Components Index

**Files:**
- Create: `packages/ui/src/components/ui/index.ts`

**Purpose:** Centralize exports for easy importing of UI components.

---

### Step 21: Create index file

**File:** `packages/ui/src/components/ui/index.ts`

```typescript
/**
 * UI Component Library
 *
 * Wrapper components around Melt UI (Svelte 4) with GitHub Primer styling.
 *
 * Purpose: Isolate third-party dependencies for future migration to Bits UI (Svelte 5).
 * When Svelte 5 migration happens, only these files need to change.
 */

export { default as Tabs } from './Tabs.svelte';
export { default as Switch } from './Switch.svelte';

export type { Tab } from './Tabs.svelte';
```

---

### Step 22: Update RuleControlBar import

**File:** `packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte`

**Change line 3 from:**
```typescript
import Tabs from '../../ui/Tabs.svelte';
```

**To:**
```typescript
import { Tabs } from '../../ui';
```

---

### Step 23: Verify import works

```bash
pnpm test packages/ui/src/components/rule-editor/controls/__tests__/RuleControlBar.test.ts
```

**Expected:** Tests still pass

---

### Step 24: Commit index file

```bash
git add packages/ui/src/components/ui/index.ts packages/ui/src/components/rule-editor/controls/RuleControlBar.svelte
git commit -m "feat(ui): add UI components index for centralized exports

- Export Tabs, Switch, and types from single entry point
- Simplifies imports: import { Tabs } from '../../ui'
- Standard pattern for component libraries

Phase 1 - Cleanup"
```

---

## Task 6: Documentation and Guidelines

**Files:**
- Create: `packages/ui/src/components/ui/README.md`

**Purpose:** Document the wrapper layer architecture for future developers.

---

### Step 25: Create UI components README

**File:** `packages/ui/src/components/ui/README.md`

```markdown
# UI Component Library

Wrapper components around **Melt UI** (Svelte 4 headless library) with **GitHub Primer** styling.

## Architecture Decision

**Why Wrapper Layer?**

We don't use Melt UI directly in business logic. Instead, we wrap primitives in this directory. Benefits:

1. **Future Migration**: When we upgrade to Svelte 5, we can switch to Bits UI by only modifying these wrapper files
2. **Consistent API**: Business components use a stable interface regardless of underlying library
3. **Design System**: All GitHub Primer styling lives here, not scattered across codebase
4. **DRY**: Reusable components reduce duplication

**Gemini's Guidance:**
> "If you need to migrate to Bits UI (Svelte 5) later, you only modify the wrapper files, not business logic."

## Available Components

### Tabs
Tab navigation with keyboard support and ARIA attributes.

```svelte
<script>
  import { Tabs } from '../../ui';

  const tabs = [
    { value: 'network', label: 'Network' },
    { value: 'response', label: 'Response' },
  ];
</script>

<Tabs {tabs} value="network" onChange={(v) => console.log(v)} />
```

**Props:**
- `tabs: Tab[]` - Array of `{ value, label, disabled? }`
- `value: string` - Currently active tab
- `onChange: (value: string) => void` - Callback on tab change
- `orientation: 'horizontal' | 'vertical'` - Layout direction (default: horizontal)

**Features:**
- ✅ Keyboard navigation (Arrow keys, Home/End)
- ✅ ARIA attributes (`role="tab"`, `aria-selected`)
- ✅ GitHub Primer styling
- ✅ Focus ring (`#0969DA`)

### Switch
Toggle switch (checkbox) with GitHub styling.

```svelte
<script>
  import { Switch } from '../../ui';
</script>

<Switch label="Enable" checked={true} onChange={(v) => console.log(v)} />
```

**Props:**
- `label: string` - Label text
- `checked: boolean` - Switch state
- `onChange: (checked: boolean) => void` - Callback on state change
- `disabled: boolean` - Disabled state
- `size: 'sm' | 'md'` - Size variant (default: md)

**Features:**
- ✅ GitHub green (`#1F883D`) when enabled
- ✅ Gray (`#D0D7DE`) when disabled
- ✅ ARIA attributes (`aria-checked`)
- ✅ Focus ring

## Design System

All components follow **GitHub Primer** design tokens:

### Colors
- Primary: `#0969DA` (blue-600)
- Success: `#1F883D` (green-600)
- Border: `#D0D7DE` (slate-300)
- Text Primary: `#1F2328` (slate-900)
- Text Secondary: `#656D76` (slate-500)

### Spacing
- Padding: `px-3 py-1.5` (tabs), `p-2` (small), `p-4` (cards)
- Gap: `gap-1` (tabs), `gap-2` (inline), `gap-4` (sections)

### Typography
- Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
- Size: `text-xs` (12px), `text-sm` (14px), `text-base` (16px)
- Weight: `font-medium` (500), `font-semibold` (600), `font-bold` (700)

See `docs/prototypes/01-design-system.md` for complete specification.

## Adding New Components

When adding a new UI wrapper:

1. **Create component**: `packages/ui/src/components/ui/MyComponent.svelte`
2. **Write tests first**: `packages/ui/src/components/ui/__tests__/MyComponent.test.ts`
3. **Wrap Melt UI primitive**: Use `createX` from `@melt-ui/svelte`
4. **Apply GitHub Primer styles**: Use Tailwind classes with `em-` prefix
5. **Export**: Add to `packages/ui/src/components/ui/index.ts`
6. **Test coverage**: Achieve ≥90% branch coverage

### Example Template

```svelte
<script lang="ts">
  import { createX, melt } from '@melt-ui/svelte';

  export let someProp: string;
  export let onChange: ((value: string) => void) | undefined = undefined;

  const { elements, states } = createX({
    defaultValue: someProp,
    onValueChange: ({ next }) => {
      if (onChange) onChange(next);
      return next;
    }
  });
</script>

<div use:melt={$elements.root} class="em-...">
  <!-- Component structure -->
</div>
```

## Testing Requirements

Every component must have:
- ✅ Rendering tests
- ✅ Interaction tests (click, keyboard)
- ✅ ARIA attribute tests
- ✅ Styling tests (active states, focus)
- ✅ Callback tests (onChange, etc.)

**Minimum coverage:** 90%

## Future Migration Path

When upgrading to **Svelte 5** and **Bits UI**:

1. Update `package.json`: Replace `@melt-ui/svelte` with `bits-ui`
2. Update each wrapper: Replace `createX` from Melt with Bits equivalent
3. Run tests: `pnpm test` - all should pass (same API)
4. Business logic: **No changes needed** (this is the goal!)

**Estimated migration time:** 2-4 hours (vs. 2-3 days if no wrapper layer)

---

**Created:** 2025-12-11
**Maintainer:** UI Team
**Status:** Stable
```

---

### Step 26: Commit documentation

```bash
git add packages/ui/src/components/ui/README.md
git commit -m "docs(ui): add UI component library architecture documentation

- Explain wrapper layer pattern and benefits
- Document Tabs and Switch component APIs
- Include design system tokens
- Provide migration path to Svelte 5 / Bits UI

Phase 1 - Documentation"
```

---

## Verification Checklist

Before proceeding to Phase 2, confirm:

- [ ] Melt UI installed (`@melt-ui/svelte` in package.json)
- [ ] Tabs component works (6 tests pass)
- [ ] Switch component works (7 tests pass)
- [ ] RuleControlBar refactored (uses Tabs wrapper)
- [ ] Index file exports all components
- [ ] README.md documents architecture
- [ ] Full test suite passes (≥317 tests)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] Visual test passed (tabs look correct in browser)

---

## Summary

**Phase 1 Achievements:**
- ✅ Installed Melt UI (Svelte 4 compatible)
- ✅ Created Tabs wrapper with GitHub styling
- ✅ Created Switch wrapper with GitHub styling
- ✅ Refactored RuleControlBar to use wrappers
- ✅ Established component library architecture
- ✅ Documented migration path

**Test Coverage:**
- 13 new tests (6 Tabs + 7 Switch)
- All existing tests still pass
- ≥90% coverage for new code

**Next Phase:**
**Phase 2: Tab Content Implementation** (`docs/plans/2025-12-11-phase2-tab-content.md`)
- NetworkTab (Delay, Failure Rate, Timeout, Offline)
- ResponseTab (Business Error / Success / Network Error forms)
- AdvancedTab (Field Omission, Manual/Random modes)

**Estimated total time for Phase 1:** 45-60 minutes

---

**Document version:** 1.0
**Created:** 2025-12-11
**Status:** Ready for execution
