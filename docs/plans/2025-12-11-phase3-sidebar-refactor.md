# Phase 3: Sidebar Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace ApiList.svelte (262 lines) with improved ApiSidebar that adds global status bar, batch operation toolbar, and improved visual design.

**Architecture:** Keep existing ApiList functionality (module grouping, selection), enhance with: (1) conditional Filter/Batch toolbar at top, (2) global status indicator at bottom with "N Active" + Pause All + Settings buttons.

**Tech Stack:** Svelte 4, TypeScript, Vitest, Tailwind CSS

**Priority:** MEDIUM - UX enhancement, not blocking for core functionality.

---

## Background

**Current State:**
- ApiList.svelte (262 lines) - works but lacks polish
- No global status indicator
- No batch operation quick actions
- No "Pause All" emergency shutoff

**Design Reference:**
- `docs/prototypes/02-layout-components.md` Section 3.1 (Top toolbar), 3.3 (Global status bar)

**Gemini's Design Rationale:**
> "Sidebar should show system-wide state (how many mocks are active) and provide emergency controls (Pause All). This follows the Figma/IDE pattern where the file tree also shows project-level status."

**Estimated Time:** 1-1.5 hours

---

## Task 1: Create Global Status Bar Component

**Files:**
- Create: `packages/ui/src/components/GlobalStatusBar.svelte`
- Create: `packages/ui/src/components/__tests__/GlobalStatusBar.test.ts`

**Purpose:** Display active mock count with pulsing indicator, Pause All, and Settings buttons.

---

### Step 1: Write failing tests for GlobalStatusBar

**File:** `packages/ui/src/components/__tests__/GlobalStatusBar.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import GlobalStatusBar from '../GlobalStatusBar.svelte';

describe('GlobalStatusBar.svelte', () => {
  it('should display active mock count', () => {
    const { getByText } = render(GlobalStatusBar, { activeCount: 3 });
    expect(getByText('3 Active')).toBeInTheDocument();
  });

  it('should show pulsing green indicator when mocks active', () => {
    const { container } = render(GlobalStatusBar, { activeCount: 3 });
    const indicator = container.querySelector('.em-animate-pulse');
    expect(indicator).toBeInTheDocument();
  });

  it('should show "0 Active" when no mocks', () => {
    const { getByText } = render(GlobalStatusBar, { activeCount: 0 });
    expect(getByText('0 Active')).toBeInTheDocument();
  });

  it('should dispatch pauseAll event when clicking Pause All', async () => {
    const handlePauseAll = vi.fn();
    const { getByLabelText } = render(GlobalStatusBar, { activeCount: 3 });

    // Use event listener instead of on:pauseAll
    const component = render(GlobalStatusBar, { activeCount: 3 }).component;
    component.$on('pauseAll', handlePauseAll);

    const pauseButton = getByLabelText('Pause all mocks');
    await fireEvent.click(pauseButton);

    expect(handlePauseAll).toHaveBeenCalled();
  });

  it('should dispatch settings event when clicking Settings', async () => {
    const handleSettings = vi.fn();
    const { getByLabelText } = render(GlobalStatusBar, { activeCount: 3 });

    const component = render(GlobalStatusBar, { activeCount: 3 }).component;
    component.$on('settings', handleSettings);

    const settingsButton = getByLabelText('Open settings');
    await fireEvent.click(settingsButton);

    expect(handleSettings).toHaveBeenCalled();
  });
});
```

---

### Step 2: Run test to verify it fails

```bash
pnpm test packages/ui/src/components/__tests__/GlobalStatusBar.test.ts
```

**Expected:** Test fails with "Cannot find module '../GlobalStatusBar.svelte'"

---

### Step 3: Implement GlobalStatusBar

**File:** `packages/ui/src/components/GlobalStatusBar.svelte`

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let activeCount: number = 0;

  const dispatch = createEventDispatcher();

  function handlePauseAll() {
    dispatch('pauseAll');
  }

  function handleSettings() {
    dispatch('settings');
  }
</script>

<!-- GLOBAL STATUS BAR (Bottom of Sidebar) -->
<div class="em-border-t em-border-[#D0D7DE] em-bg-white em-p-3">
  <div class="em-flex em-items-center em-justify-between">

    <!-- Left: Status Indicator -->
    <div class="em-flex em-items-center em-gap-2">
      <!-- Pulsing Dot (only when active) -->
      {#if activeCount > 0}
        <span class="em-relative em-flex em-h-2.5 em-w-2.5">
          <!-- Ping animation -->
          <span class="em-absolute em-inline-flex em-h-full em-w-full em-animate-ping em-rounded-full em-bg-[#1F883D] em-opacity-75"></span>
          <!-- Solid dot -->
          <span class="em-relative em-inline-flex em-h-2.5 em-w-2.5 em-rounded-full em-bg-[#1F883D]"></span>
        </span>
      {:else}
        <!-- Gray dot when inactive -->
        <span class="em-h-2.5 em-w-2.5 em-rounded-full em-bg-[#D0D7DE]"></span>
      {/if}

      <span class="em-text-sm em-font-semibold em-text-[#1F2328]">
        {activeCount} Active
      </span>
    </div>

    <!-- Right: Action Buttons -->
    <div class="em-flex em-gap-2">

      <!-- Pause All Button -->
      <button
        on:click={handlePauseAll}
        class="em-rounded-md em-p-1.5 em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        title="Pause all mocks"
        aria-label="Pause all mocks"
        disabled={activeCount === 0}
      >
        <!-- GitHub Octicon: circle-slash-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"/>
        </svg>
      </button>

      <!-- Settings Button -->
      <button
        on:click={handleSettings}
        class="em-rounded-md em-p-1.5 em-text-[#656D76] hover:em-bg-[#F6F8FA] hover:em-text-[#1F2328] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        title="Open settings"
        aria-label="Open settings"
      >
        <!-- GitHub Octicon: gear-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.327.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z"/>
        </svg>
      </button>

    </div>
  </div>
</div>
```

---

### Step 4: Run tests to verify they pass

```bash
pnpm test packages/ui/src/components/__tests__/GlobalStatusBar.test.ts
```

**Expected:** All 5 tests pass

---

### Step 5: Commit GlobalStatusBar

```bash
git add packages/ui/src/components/GlobalStatusBar.svelte packages/ui/src/components/__tests__/GlobalStatusBar.test.ts
git commit -m "feat(ui): add GlobalStatusBar with active mock indicator and controls

- Pulsing green dot when mocks active
- Active count display (N Active)
- Pause All button (disabled when no mocks)
- Settings button
- 5 test cases covering functionality

Phase 3 - Task 1/2"
```

---

## Task 2: Integrate GlobalStatusBar into App.svelte

**Files:**
- Modify: `packages/ui/src/App.svelte:312-314` (Add GlobalStatusBar to sidebar slot)

**Purpose:** Add global status bar to bottom of sidebar.

---

### Step 6: Add GlobalStatusBar to App.svelte

**File:** `packages/ui/src/App.svelte`

**Find the sidebar slot section (line ~312) and add GlobalStatusBar:**

```svelte
<script lang="ts">
  // Add import
  import GlobalStatusBar from './components/GlobalStatusBar.svelte';
  import { activeMockCount } from './stores/rules'; // Already exists

  // ... existing code ...

  function handlePauseAll() {
    // Disable all active mocks
    mockRules.update(rules => {
      const newRules = new Map(rules);
      for (const [id, rule] of newRules) {
        if (rule.enabled) {
          newRules.set(id, { ...rule, enabled: false });
        }
      }
      return newRules;
    });

    // Save to localStorage
    const allRules = Array.from($mockRules.values());
    storage.saveRules(allRules);
    updateRules(allRules);

    // Show toast
    toasts.add('All mocks paused', 'success', 2000);
  }

  function handleSettings() {
    // TODO: Implement settings panel (future enhancement)
    toasts.add('Settings panel coming soon', 'info', 2000);
  }
</script>

<!-- Update sidebar slot content: -->
<div slot="sidebar" class="em-h-full em-relative em-flex em-flex-col">
  <!-- API List (flex-1 to take remaining space) -->
  <div class="em-flex-1 em-overflow-y-auto">
    <ApiList rules={$mockRules} on:select={handleSelect} on:toggle={handleToggle} />
  </div>

  <!-- Batch Panel (conditionally displayed) -->
  <BatchPanel selectedCount={$selectedIds.size} on:clear={handleClearSelection} />

  <!-- Global Status Bar (always at bottom) -->
  <GlobalStatusBar
    activeCount={$activeMockCount}
    on:pauseAll={handlePauseAll}
    on:settings={handleSettings}
  />
</div>
```

---

### Step 7: Manual test GlobalStatusBar integration

**Test steps:**
1. `pnpm dev`
2. Open browser → Click Float Button
3. Verify status bar at bottom: "0 Active" with gray dot
4. Enable a mock → Verify "1 Active" with pulsing green dot
5. Enable 2 more → Verify "3 Active"
6. Click Pause All → Verify all mocks disabled, "0 Active" returns
7. Click Settings → Verify toast "Settings panel coming soon"

**Expected:** All interactions work correctly

---

### Step 8: Run full test suite

```bash
pnpm test
```

**Expected:** ≥342 tests pass (337 Phase 0+1+2 + 5 GlobalStatusBar tests)

---

### Step 9: Commit integration

```bash
git add packages/ui/src/App.svelte
git commit -m "feat(ui): integrate GlobalStatusBar into sidebar

- Add GlobalStatusBar to bottom of sidebar
- Implement Pause All functionality (disables all mocks)
- Add Settings placeholder (future enhancement)
- Sidebar layout: API List (flex-1) + Batch Panel + Global Status Bar

Phase 3 - Task 2/2"
```

---

## Task 3: Optional Enhancements (Future)

**Note:** These can be added in follow-up PRs if needed:

1. **Batch Operation Toolbar** (Filter/Batch toolbar switching)
   - Show when `$selectedIds.size > 0`
   - Enable Selected, Disable Selected, Delete buttons

2. **Smart Search** (from design doc 3.1)
   - Pinyin first-letter support
   - Method abbreviation (g → GET)
   - Intelligent ranking

3. **Module Collapse Persistence** (localStorage)
   - Remember which modules are expanded

**Estimated additional time:** 2-3 hours

---

## Verification Checklist

- [ ] GlobalStatusBar: 5 tests pass
- [ ] Integration: Status bar displays at bottom
- [ ] Pulsing indicator works when mocks active
- [ ] Pause All disables all mocks
- [ ] activeCount reactive (updates on changes)
- [ ] Full test suite: ≥342 tests pass
- [ ] Manual E2E test passed
- [ ] No TypeScript errors

---

## Summary

**Phase 3 Achievements:**
- ✅ GlobalStatusBar component with pulsing indicator
- ✅ Active mock count display
- ✅ Pause All emergency shutoff
- ✅ Settings button (placeholder)
- ✅ Integrated into App sidebar

**Test Coverage:**
- 5 new tests (GlobalStatusBar)
- All existing tests still pass

**What's Next:**
- **Optional:** Batch operation toolbar (future PR)
- **Optional:** Smart search enhancements (future PR)
- **Ready:** Phase 0+1+2+3 complete, ready for merge!

**Estimated total time for Phase 3:** 1-1.5 hours

---

**Document version:** 1.0
**Created:** 2025-12-11
**Status:** Ready for execution
