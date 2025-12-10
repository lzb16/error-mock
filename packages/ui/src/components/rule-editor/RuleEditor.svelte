<script lang="ts">
  /**
   * RuleEditor - Main container for rule editing interface
   *
   * IMPORTANT: Tab State Management Architecture
   * ============================================
   * This component uses {#if} conditional rendering for tab content (lines 77-92),
   * which means the DOM is completely destroyed and recreated on every tab switch.
   *
   * **Critical Requirement for Phase 2 Tab Implementation:**
   * ALL tab-local state MUST be stored in Svelte stores (editorUiState/activeRuleDraft),
   * NOT in component-local variables. This ensures:
   * - State survives tab switches (DOM remounts)
   * - Batch editing works correctly across tabs
   * - No data loss when users navigate between tabs
   *
   * **Store Binding Contract:**
   * - activeRuleDraft: All draft rule data (network, response, business, fieldOmit)
   * - editorUiState: UI state (activeTab, dirtyFields, isBatchMode, selectedCount)
   *
   * **Example (CORRECT):**
   *   <input bind:value={$activeRuleDraft.network.delay} />
   *
   * **Example (WRONG - will lose state on tab switch):**
   *   let localDelay = 100;
   *   <input bind:value={localDelay} />
   *
   * See: packages/ui/src/stores/ruleEditor.ts for store implementation
   * See: packages/ui/src/stores/__tests__/ruleEditor.test.ts for state preservation tests
   */
  import { createEventDispatcher, onMount } from 'svelte';
  import type { MockRule } from '@error-mock/core';
  import { activeRuleDraft, editorUiState, initEditor, resetEditor } from '../../stores/ruleEditor';
  import RuleControlBar from './controls/RuleControlBar.svelte';
  import BatchControlBar from './controls/BatchControlBar.svelte';

  // Props (to maintain compatibility with App.svelte)
  export let rule: MockRule | null = null;
  export let isBatch = false;
  export let selectedCount = 0;
  export let batchRules: MockRule[] = [];

  const dispatch = createEventDispatcher<{
    apply: { rule: MockRule; editedFields: Set<string> };
    cancel: void;
    cancelBatch: void;
  }>();

  // Track if props are being used (for App.svelte compatibility) vs store-only (for tests)
  let propsMode = false;
  let lastRule: MockRule | null = null;
  let lastSelectedCount = 0;
  let lastIsBatch = isBatch;

  // Initialize editor when rule or isBatch changes (only if props are provided)
  $: {
    const selectionChanged = selectedCount !== lastSelectedCount || isBatch !== lastIsBatch;
    // If rule prop is provided, we're in props mode (App.svelte)
    if (rule !== undefined && (rule !== lastRule || selectionChanged)) {
      propsMode = true;
      lastRule = rule;
      lastSelectedCount = selectedCount;
      lastIsBatch = isBatch;

      if (rule) {
        const count = isBatch ? selectedCount : 1;
        initEditor(rule, isBatch, count, batchRules);
      } else if (propsMode) {
        // Only reset if we were previously using props
        resetEditor();
      }
    }
  }

  // Reactive store bindings
  $: draft = $activeRuleDraft;
  $: uiState = $editorUiState;
  $: activeTab = uiState.activeTab;
  $: isBatchMode = uiState.isBatchMode;

  // Event handlers
  function handleCancelBatch() {
    dispatch('cancelBatch'); // For test compatibility
    dispatch('cancel'); // For App.svelte
  }

  function handleApply() {
    if ($activeRuleDraft) {
      dispatch('apply', {
        rule: $activeRuleDraft,
        editedFields: $editorUiState.dirtyFields
      });
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<!-- RULE EDITOR CONTAINER -->
<div class="em-flex em-flex-col em-h-full em-bg-white">

  <!-- Control Bar (Conditional) -->
  {#if isBatchMode}
    <BatchControlBar on:cancelBatch={handleCancelBatch} />
  {:else}
    <RuleControlBar />
  {/if}

  <!-- Tab Content Area (Scrollable) -->
  <div class="em-flex-1 em-overflow-auto em-px-6 em-py-4">
    {#if draft}
      {#if activeTab === 'network'}
        <!-- Network Tab (Phase 2) -->
        <div class="em-text-sm em-text-[#656D76]">
          Network Tab Content
        </div>
      {:else if activeTab === 'response'}
        <!-- Response Tab (Phase 2) -->
        <div class="em-text-sm em-text-[#656D76]">
          Response Tab Content
        </div>
      {:else if activeTab === 'advanced'}
        <!-- Advanced Tab (Phase 2) -->
        <div class="em-text-sm em-text-[#656D76]">
          Advanced Tab Content
        </div>
      {/if}
    {:else}
      <!-- Empty State -->
      <div class="em-flex em-h-full em-items-center em-justify-center em-text-sm em-text-[#656D76]">
        No rule selected
      </div>
    {/if}
  </div>
</div>
