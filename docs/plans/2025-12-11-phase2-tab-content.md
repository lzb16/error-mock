# Phase 2: Tab Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement three tab content components (NetworkTab, ResponseTab, AdvancedTab) with proper form controls, state management, and CRITICAL `markFieldDirty` calls to support batch editing.

**Architecture:** Each tab is a standalone Svelte component that binds to `ruleEditor` store, updates draft via `updateDraft`, and marks fields dirty via `markFieldDirty`. Uses GitHub Primer design system from Phase 1.

**Tech Stack:** Svelte 4, TypeScript, Vitest, Tailwind CSS

**Priority:** CRITICAL - Core feature implementation. Must follow CONTRIBUTING.md guidelines from Phase 0.

---

## Background

**Why This Matters:**

From Phase 0 (Codex analysis):
> "Apply logic relies entirely on `editedFields` to know what to propagate. Once tab UIs land, every setter **MUST** call `markFieldDirty` or batch Apply will be a no-op."

**MANDATORY Rule from CONTRIBUTING.md:**
```svelte
function handleDelayChange(e: Event) {
  updateDraft({ network: { delay: value } });
  markFieldDirty('network.delay'); // ← CRITICAL!
}
```

**Design References:**
- Layout: `docs/prototypes/03-tab-content-core.md` Ch. 4 (Network), Ch. 5 (Response)
- Forms: `docs/prototypes/04-forms.md`
- Design System: `docs/prototypes/01-design-system.md`

**Estimated Time:** 5-7 hours

---

## Task 1: NetworkTab Implementation

**Files:**
- Create: `packages/ui/src/components/rule-editor/tabs/NetworkTab.svelte`
- Create: `packages/ui/src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts`

**Purpose:** Implement delay, failure rate, timeout, and offline controls.

**Design:** Grid layout (`grid-cols-[140px_1fr]`) with left-aligned labels.

---

### Step 1: Write failing tests for NetworkTab

**File:** `packages/ui/src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import NetworkTab from '../NetworkTab.svelte';
import { initEditor, activeRuleDraft, editorUiState, resetEditor } from '../../../stores/ruleEditor';
import { createDefaultRule } from '../../../stores/rules';

describe('NetworkTab.svelte', () => {
  const mockRule = createDefaultRule({
    module: 'test',
    name: 'api',
    url: '/test',
    method: 'GET'
  });

  beforeEach(() => {
    resetEditor();
  });

  it('should render delay input with current value', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const delayInput = getByLabelText('Delay') as HTMLInputElement;

    expect(delayInput.value).toBe('0');
  });

  it('should update draft and mark field dirty when delay changes', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const delayInput = getByLabelText('Delay');

    fireEvent.input(delayInput, { target: { value: '500' } });

    // Verify draft updated
    const draft = get(activeRuleDraft);
    expect(draft?.network.delay).toBe(500);

    // Verify field marked dirty
    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.delay')).toBe(true);
  });

  it('should render failure rate slider with current value', () => {
    mockRule.network.failRate = 0.3;
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const slider = getByLabelText('Failure Rate') as HTMLInputElement;

    expect(slider.value).toBe('0.3');
  });

  it('should update draft and mark field dirty when failure rate changes', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const slider = getByLabelText('Failure Rate');

    fireEvent.input(slider, { target: { value: '0.7' } });

    const draft = get(activeRuleDraft);
    expect(draft?.network.failRate).toBe(0.7);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.failRate')).toBe(true);
  });

  it('should display failure rate percentage in badge', () => {
    mockRule.network.failRate = 0.25;
    initEditor(mockRule, false);

    const { getByText } = render(NetworkTab);
    expect(getByText('25%')).toBeInTheDocument();
  });

  it('should render timeout checkbox with current value', () => {
    mockRule.network.timeout = true;
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Timeout') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });

  it('should update draft and mark field dirty when timeout toggles', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Timeout');

    fireEvent.click(checkbox);

    const draft = get(activeRuleDraft);
    expect(draft?.network.timeout).toBe(true);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.timeout')).toBe(true);
  });

  it('should render offline checkbox with current value', () => {
    mockRule.network.offline = true;
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Offline') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });

  it('should update draft and mark field dirty when offline toggles', () => {
    initEditor(mockRule, false);

    const { getByLabelText } = render(NetworkTab);
    const checkbox = getByLabelText('Simulate Offline');

    fireEvent.click(checkbox);

    const draft = get(activeRuleDraft);
    expect(draft?.network.offline).toBe(true);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('network.offline')).toBe(true);
  });

  it('should handle batch mode with MIXED values', () => {
    const rule1 = createDefaultRule({ module: 'test', name: 'api1', url: '/api1', method: 'GET' });
    const rule2 = { ...rule1, network: { ...rule1.network, delay: 200 } };

    initEditor(rule1, true, 2, [rule1, rule2]);

    const { getByLabelText } = render(NetworkTab);
    const delayInput = getByLabelText('Delay') as HTMLInputElement;

    // MIXED value should display as empty placeholder
    expect(delayInput.placeholder).toBe('(Mixed)');
  });
});
```

---

### Step 2: Run test to verify it fails

```bash
pnpm test packages/ui/src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts
```

**Expected:** Test fails with "Cannot find module '../NetworkTab.svelte'"

---

### Step 3: Implement NetworkTab component

**File:** `packages/ui/src/components/rule-editor/tabs/NetworkTab.svelte`

```svelte
<script lang="ts">
  import { activeRuleDraft, updateDraft, markFieldDirty, isMixed } from '../../../stores/ruleEditor';

  // Handlers - CRITICAL: Each must call markFieldDirty!
  function handleDelayChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const delay = parseInt(target.value) || 0;
    updateDraft({ network: { delay } });
    markFieldDirty('network.delay'); // CRITICAL
  }

  function handleFailRateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const failRate = parseFloat(target.value);
    updateDraft({ network: { failRate } });
    markFieldDirty('network.failRate'); // CRITICAL
  }

  function handleTimeoutChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ network: { timeout: target.checked } });
    markFieldDirty('network.timeout'); // CRITICAL
  }

  function handleOfflineChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ network: { offline: target.checked } });
    markFieldDirty('network.offline'); // CRITICAL
  }

  // Reactive values with MIXED handling
  $: delay = isMixed($activeRuleDraft?.network.delay) ? '' : String($activeRuleDraft?.network.delay ?? 0);
  $: failRate = isMixed($activeRuleDraft?.network.failRate) ? 0 : ($activeRuleDraft?.network.failRate ?? 0);
  $: timeout = isMixed($activeRuleDraft?.network.timeout) ? false : ($activeRuleDraft?.network.timeout ?? false);
  $: offline = isMixed($activeRuleDraft?.network.offline) ? false : ($activeRuleDraft?.network.offline ?? false);
  $: failRatePercent = Math.round(failRate * 100);
</script>

<!-- NETWORK TAB CONTENT -->
<div class="em-mx-auto em-max-w-3xl em-p-6">
  <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-8 em-items-start">

    <!-- Delay Control -->
    <label for="net-delay" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
      Delay
    </label>
    <div class="em-max-w-sm">
      <div class="em-relative">
        <input
          type="number"
          id="net-delay"
          value={delay}
          min="0"
          placeholder={isMixed($activeRuleDraft?.network.delay) ? '(Mixed)' : ''}
          on:input={handleDelayChange}
          class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] em-shadow-sm focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
        />
        <div class="em-pointer-events-none em-absolute em-inset-y-0 em-right-0 em-flex em-items-center em-pr-3">
          <span class="em-text-sm em-text-[#656D76]">ms</span>
        </div>
      </div>
      <p class="em-mt-1 em-text-xs em-text-[#656D76]">
        Simulated latency added to the response.
      </p>
    </div>

    <!-- Failure Rate Slider -->
    <label for="net-fail-rate" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
      Failure Rate
    </label>
    <div class="em-max-w-md">
      <div class="em-flex em-items-center em-gap-4">
        <input
          type="range"
          id="net-fail-rate"
          min="0"
          max="1"
          step="0.01"
          value={failRate}
          on:input={handleFailRateChange}
          class="em-h-2 em-w-full em-cursor-pointer em-rounded-lg em-bg-[#EFF1F3] em-accent-[#0969DA]"
        />
        <span class="em-flex em-h-6 em-w-12 em-items-center em-justify-center em-rounded-full em-bg-[#F6F8FA] em-border em-border-[#D0D7DE] em-text-xs em-font-mono em-font-medium em-text-[#1F2328]">
          {failRatePercent}%
        </span>
      </div>
      <p class="em-mt-2 em-text-xs em-text-[#656D76]">
        Probability of the request failing (0.0 to 1.0).
      </p>
    </div>

    <!-- Divider -->
    <div class="em-col-span-2 em-my-2 em-border-t em-border-[#D0D7DE]"></div>

    <!-- Toggles Section -->
    <div class="em-col-span-2 em-space-y-6">

      <!-- Timeout Toggle -->
      <div class="em-flex em-items-start em-gap-3">
        <div class="em-flex em-h-6 em-items-center">
          <input
            id="net-timeout"
            type="checkbox"
            checked={timeout}
            on:change={handleTimeoutChange}
            class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
        </div>
        <div>
          <label for="net-timeout" class="em-text-sm em-font-semibold em-text-[#1F2328]">
            Simulate Timeout
          </label>
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            Request will fail with a timeout error.
          </p>
        </div>
      </div>

      <!-- Offline Toggle -->
      <div class="em-flex em-items-start em-gap-3">
        <div class="em-flex em-h-6 em-items-center">
          <input
            id="net-offline"
            type="checkbox"
            checked={offline}
            on:change={handleOfflineChange}
            class="em-h-4 em-w-4 em-rounded em-border-[#D0D7DE] em-text-[#0969DA] focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
        </div>
        <div>
          <label for="net-offline" class="em-text-sm em-font-semibold em-text-[#1F2328]">
            Simulate Offline
          </label>
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            Request will fail as if the network is disconnected.
          </p>
        </div>
      </div>

    </div>
  </div>
</div>
```

---

### Step 4: Run tests to verify they pass

```bash
pnpm test packages/ui/src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts
```

**Expected:** All 10 tests pass

---

### Step 5: Check test coverage

```bash
pnpm test:coverage packages/ui/src/components/rule-editor/tabs/NetworkTab.svelte
```

**Expected:** ≥90% branch coverage

---

### Step 6: Commit NetworkTab

```bash
git add packages/ui/src/components/rule-editor/tabs/NetworkTab.svelte packages/ui/src/components/rule-editor/tabs/__tests__/NetworkTab.test.ts
git commit -m "feat(ui): implement NetworkTab with delay, failure rate, and network controls

- Grid layout (140px labels, responsive controls)
- Delay input (ms), Failure Rate slider (0-100%)
- Timeout and Offline checkboxes
- CRITICAL: All handlers call markFieldDirty for batch mode
- MIXED value support with placeholder indicators
- 10 test cases, ≥90% coverage

Phase 2 - Task 1/4"
```

---

## Task 2: ResponseTab Implementation (Simplified)

**Files:**
- Create: `packages/ui/src/components/rule-editor/tabs/ResponseTab.svelte`
- Create: `packages/ui/src/components/rule-editor/tabs/__tests__/ResponseTab.test.ts`

**Purpose:** Display business error form when `mockType === 'businessError'`, otherwise show info card.

**Design:** Conditional rendering based on mockType.

---

### Step 7: Write failing tests for ResponseTab

**File:** `packages/ui/src/components/rule-editor/tabs/__tests__/ResponseTab.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import ResponseTab from '../ResponseTab.svelte';
import { initEditor, activeRuleDraft, editorUiState, resetEditor } from '../../../stores/ruleEditor';
import { createDefaultRule } from '../../../stores/rules';

describe('ResponseTab.svelte', () => {
  const mockRule = createDefaultRule({
    module: 'test',
    name: 'api',
    url: '/test',
    method: 'GET'
  });

  beforeEach(() => {
    resetEditor();
  });

  it('should show Business Error form when mockType is businessError', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    expect(getByLabelText('Error Code')).toBeInTheDocument();
    expect(getByLabelText('Error Message')).toBeInTheDocument();
  });

  it('should show Success info card when mockType is success', () => {
    mockRule.mockType = 'success';
    initEditor(mockRule, false);

    const { getByText } = render(ResponseTab);
    expect(getByText(/Success Mode/i)).toBeInTheDocument();
    expect(getByText(/returns the default successful response/i)).toBeInTheDocument();
  });

  it('should show Network Error info card when mockType is networkError', () => {
    mockRule.mockType = 'networkError';
    initEditor(mockRule, false);

    const { getByText } = render(ResponseTab);
    expect(getByText(/Network Error Mode/i)).toBeInTheDocument();
  });

  it('should update errNo and mark field dirty', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    const input = getByLabelText('Error Code');

    fireEvent.input(input, { target: { value: '404' } });

    const draft = get(activeRuleDraft);
    expect(draft?.business.errNo).toBe(404);

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('business.errNo')).toBe(true);
  });

  it('should update errMsg and mark field dirty', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    const input = getByLabelText('Error Message');

    fireEvent.input(input, { target: { value: 'Not Found' } });

    const draft = get(activeRuleDraft);
    expect(draft?.business.errMsg).toBe('Not Found');

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('business.errMsg')).toBe(true);
  });

  it('should update detailErrMsg and mark field dirty', () => {
    mockRule.mockType = 'businessError';
    initEditor(mockRule, false);

    const { getByLabelText } = render(ResponseTab);
    const textarea = getByLabelText('Detail Error Message');

    fireEvent.input(textarea, { target: { value: 'Resource not found in database' } });

    const draft = get(activeRuleDraft);
    expect(draft?.business.detailErrMsg).toBe('Resource not found in database');

    const ui = get(editorUiState);
    expect(ui.dirtyFields.has('business.detailErrMsg')).toBe(true);
  });
});
```

---

### Step 8: Implement ResponseTab (simplified version)

**File:** `packages/ui/src/components/rule-editor/tabs/ResponseTab.svelte`

```svelte
<script lang="ts">
  import { activeRuleDraft, updateDraft, markFieldDirty, isMixed } from '../../../stores/ruleEditor';

  // Handlers - CRITICAL: Each must call markFieldDirty!
  function handleErrNoChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const errNo = parseInt(target.value) || 0;
    updateDraft({ business: { errNo } });
    markFieldDirty('business.errNo'); // CRITICAL
  }

  function handleErrMsgChange(e: Event) {
    const target = e.target as HTMLInputElement;
    updateDraft({ business: { errMsg: target.value } });
    markFieldDirty('business.errMsg'); // CRITICAL
  }

  function handleDetailErrMsgChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    updateDraft({ business: { detailErrMsg: target.value } });
    markFieldDirty('business.detailErrMsg'); // CRITICAL
  }

  // Reactive values
  $: mockType = $activeRuleDraft?.mockType ?? 'none';
  $: errNo = isMixed($activeRuleDraft?.business.errNo) ? '' : String($activeRuleDraft?.business.errNo ?? 0);
  $: errMsg = isMixed($activeRuleDraft?.business.errMsg) ? '' : ($activeRuleDraft?.business.errMsg ?? '');
  $: detailErrMsg = isMixed($activeRuleDraft?.business.detailErrMsg) ? '' : ($activeRuleDraft?.business.detailErrMsg ?? '');
</script>

<!-- RESPONSE TAB CONTENT -->
<div class="em-mx-auto em-max-w-3xl em-p-6">

  {#if mockType === 'businessError'}
    <!-- Business Error Form -->
    <div class="em-space-y-6">
      <h3 class="em-text-sm em-font-bold em-text-[#1F2328]">Business Error Configuration</h3>

      <div class="em-grid em-grid-cols-[140px_1fr] em-gap-y-6 em-items-start">

        <!-- Error Code -->
        <label for="resp-err-no" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
          Error Code
        </label>
        <div class="em-max-w-sm">
          <input
            type="number"
            id="resp-err-no"
            value={errNo}
            placeholder={isMixed($activeRuleDraft?.business.errNo) ? '(Mixed)' : ''}
            on:input={handleErrNoChange}
            class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            Numeric error code returned in response.
          </p>
        </div>

        <!-- Error Message -->
        <label for="resp-err-msg" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
          Error Message
        </label>
        <div class="em-max-w-md">
          <input
            type="text"
            id="resp-err-msg"
            value={errMsg}
            placeholder={isMixed($activeRuleDraft?.business.errMsg) ? '(Mixed)' : 'e.g., Invalid parameters'}
            on:input={handleErrMsgChange}
            class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          />
        </div>

        <!-- Detail Error Message -->
        <label for="resp-detail-err-msg" class="em-pt-2 em-text-sm em-font-semibold em-text-[#1F2328]">
          Detail Error Message
        </label>
        <div class="em-max-w-md">
          <textarea
            id="resp-detail-err-msg"
            value={detailErrMsg}
            placeholder={isMixed($activeRuleDraft?.business.detailErrMsg) ? '(Mixed)' : 'Optional detailed error description'}
            on:input={handleDetailErrMsgChange}
            rows="3"
            class="em-w-full em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-text-sm em-text-[#1F2328] focus:em-border-[#0969DA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
          ></textarea>
        </div>

      </div>
    </div>

  {:else if mockType === 'success'}
    <!-- Success Info Card -->
    <div class="em-rounded-lg em-border em-border-[#1F883D]/30 em-bg-[#DDF4DD] em-p-6">
      <div class="em-flex em-gap-3">
        <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#1F883D]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
        </svg>
        <div>
          <h4 class="em-text-sm em-font-bold em-text-[#1F883D]">Success Mode Active</h4>
          <p class="em-mt-1 em-text-xs em-text-[#1F883D]/80">
            API will returns the default successful response (status 200) with standard data structure.
          </p>
        </div>
      </div>
    </div>

  {:else if mockType === 'networkError'}
    <!-- Network Error Info Card -->
    <div class="em-rounded-lg em-border em-border-[#CF222E]/30 em-bg-[#FFE5E5] em-p-6">
      <div class="em-flex em-gap-3">
        <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#CF222E]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.343 13.657A8 8 0 1 1 13.657 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.75.75 0 0 0-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 1 0 1.06 1.06L8 9.06l1.97 1.97a.75.75 0 1 0 1.06-1.06L9.06 8l1.97-1.97a.75.75 0 0 0-1.06-1.06L8 6.94Z"/>
        </svg>
        <div>
          <h4 class="em-text-sm em-font-bold em-text-[#CF222E]">Network Error Mode Active</h4>
          <p class="em-mt-1 em-text-xs em-text-[#CF222E]/80">
            Request will fail with network-level errors (configured in Network tab).
          </p>
        </div>
      </div>
    </div>

  {:else}
    <!-- None Mode Info Card -->
    <div class="em-rounded-lg em-border em-border-[#D0D7DE] em-bg-[#F6F8FA] em-p-6">
      <div class="em-flex em-gap-3">
        <svg class="em-h-5 em-w-5 em-shrink-0 em-text-[#656D76]" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
        </svg>
        <div>
          <h4 class="em-text-sm em-font-bold em-text-[#656D76]">Mock Disabled</h4>
          <p class="em-mt-1 em-text-xs em-text-[#656D76]">
            No mocking active. API will pass through to real server.
          </p>
        </div>
      </div>
    </div>
  {/if}

</div>
```

---

### Step 9: Run tests and commit (Steps 9-11 similar pattern)

```bash
pnpm test packages/ui/src/components/rule-editor/tabs/__tests__/ResponseTab.test.ts
git add packages/ui/src/components/rule-editor/tabs/ResponseTab.svelte packages/ui/src/components/rule-editor/tabs/__tests__/ResponseTab.test.ts
git commit -m "feat(ui): implement ResponseTab with Business Error form and info cards

- Conditional rendering based on mockType
- Business Error form (errNo, errMsg, detailErrMsg)
- Info cards for Success/Network Error/None modes
- CRITICAL: All handlers call markFieldDirty
- 6 test cases, ≥90% coverage

Phase 2 - Task 2/4"
```

---

## Task 3: AdvancedTab Implementation (Simplified)

**Purpose:** Field Omission configuration with Manual and Random modes.

**Design:** Toggle to enable, mode selector, fields list for Manual, probability slider for Random.

**Note:** Due to complexity, implementing simplified version. Full accordion design can be added later.

---

### Step 12-17: Similar TDD pattern for AdvancedTab

**Key features:**
- Field Omit toggle (`fieldOmit.enabled`)
- Mode selector: Manual vs Random (`fieldOmit.mode`)
- Manual: Comma-separated fields list (`fieldOmit.fields`)
- Random: Probability slider (`fieldOmit.random.probability`)

**All handlers MUST call `markFieldDirty`!**

---

## Task 4: Integrate Tabs into RuleEditor

**Files:**
- Modify: `packages/ui/src/components/rule-editor/RuleEditor.svelte:20-40`

**Purpose:** Replace placeholder with actual tab content components.

---

### Step 18: Update RuleEditor to render tab components

**File:** `packages/ui/src/components/rule-editor/RuleEditor.svelte`

**Find the tab content placeholder section and replace:**

```svelte
<script lang="ts">
  // Add imports
  import NetworkTab from './tabs/NetworkTab.svelte';
  import ResponseTab from './tabs/ResponseTab.svelte';
  import AdvancedTab from './tabs/AdvancedTab.svelte';

  // ... existing code ...
</script>

<!-- Replace the <!-- Tab Content Placeholder --> section with: -->

<!-- TAB CONTENT AREA (Scrollable) -->
<div class="em-flex-1 em-overflow-y-auto">
  {#if $editorUiState.activeTab === 'network'}
    <NetworkTab />
  {:else if $editorUiState.activeTab === 'response'}
    <ResponseTab />
  {:else if $editorUiState.activeTab === 'advanced'}
    <AdvancedTab />
  {/if}
</div>
```

---

### Step 19: Run full test suite

```bash
pnpm test
```

**Expected:** ≥337 tests pass (317 Phase 0+1 + 10 Network + 6 Response + 4 Advanced tests)

---

### Step 20: Manual E2E test

**Test scenario:**
1. `pnpm dev`
2. Open browser → Click Float Button
3. Select an API → Edit in each tab
4. Switch tabs → Verify content preserved
5. Apply → Verify changes saved
6. Select 2 APIs → Verify batch mode works
7. Edit delay → Apply → Verify both updated

**Expected:** All tabs work, changes persist, batch mode applies correctly

---

### Step 21: Commit integration

```bash
git add packages/ui/src/components/rule-editor/RuleEditor.svelte
git commit -m "feat(ui): integrate NetworkTab, ResponseTab, and AdvancedTab into RuleEditor

- Replace placeholder with actual tab content
- Conditional rendering based on activeTab
- All tabs support batch mode with MIXED values
- Manual E2E test passed

Phase 2 - Complete"
```

---

## Verification Checklist

- [ ] NetworkTab: 10 tests pass, ≥90% coverage
- [ ] ResponseTab: 6 tests pass, ≥90% coverage
- [ ] AdvancedTab: 4 tests pass, ≥90% coverage
- [ ] RuleEditor integration works
- [ ] Batch mode: MIXED values display correctly
- [ ] Batch mode: All edits apply (verify markFieldDirty called)
- [ ] Full test suite: ≥337 tests pass
- [ ] Manual E2E test passed
- [ ] No TypeScript errors

---

## Summary

**Phase 2 Achievements:**
- ✅ NetworkTab with 4 controls
- ✅ ResponseTab with conditional forms
- ✅ AdvancedTab with Field Omission
- ✅ Integrated into RuleEditor
- ✅ **CRITICAL**: All handlers call `markFieldDirty`
- ✅ MIXED value support throughout
- ✅ GitHub Primer styling

**Test Coverage:**
- 20 new tests (10 + 6 + 4)
- ≥90% coverage for all new code

**Next Phase:**
**Phase 3: Sidebar Refactor** (`docs/plans/2025-12-11-phase3-sidebar-refactor.md`)

**Estimated total time for Phase 2:** 5-7 hours (split over multiple sessions)

---

**Document version:** 1.0
**Created:** 2025-12-11
**Status:** Ready for execution (Note: AdvancedTab details abbreviated for length - expand during execution)
