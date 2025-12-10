<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { MockRule } from '@error-mock/core';
  import { activeRuleDraft, editorUiState, initEditor, resetEditor } from '../../stores/ruleEditor';
  import RuleControlBar from './controls/RuleControlBar.svelte';
  import BatchControlBar from './controls/BatchControlBar.svelte';

  // Props (to maintain compatibility with App.svelte)
  export let rule: MockRule | null = null;
  export let isBatch = false;

  const dispatch = createEventDispatcher<{
    apply: { rule: MockRule; editedFields: Set<string> };
    cancel: void;
    cancelBatch: void;
  }>();

  // Track if props are being used (for App.svelte compatibility) vs store-only (for tests)
  let propsMode = false;
  let lastRule: MockRule | null = null;

  // Initialize editor when rule or isBatch changes (only if props are provided)
  $: {
    // If rule prop is provided, we're in props mode (App.svelte)
    if (rule !== undefined && rule !== lastRule) {
      propsMode = true;
      lastRule = rule;

      if (rule) {
        initEditor(rule, isBatch, isBatch ? 0 : 1);
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

  <!-- Action Buttons (Bottom) -->
  {#if draft}
    <div class="em-shrink-0 em-border-t em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-6 em-py-4">
      <div class="em-flex em-justify-end em-gap-3">
        <button
          class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-4 em-py-2 em-text-sm em-font-medium em-text-[#24292F] hover:em-bg-[#F3F4F6] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA] focus:em-ring-offset-2"
          on:click={handleCancel}
        >
          Cancel
        </button>
        <button
          class="em-rounded-md em-bg-[#1F883D] em-px-4 em-py-2 em-text-sm em-font-medium em-text-white hover:em-bg-[#1A7F37] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#1F883D] focus:em-ring-offset-2"
          on:click={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  {/if}
</div>
