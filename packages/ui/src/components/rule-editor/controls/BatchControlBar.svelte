<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { activeRuleDraft, editorUiState } from '../../../stores/ruleEditor';

  const dispatch = createEventDispatcher();

  function handleToggleChange() {
    activeRuleDraft.update(draft => {
      if (!draft) return draft;
      return { ...draft, enabled: !draft.enabled };
    });
  }

  function handleCancelBatch() {
    dispatch('cancelBatch');
  }
</script>

<!-- BATCH CONTEXT BAR (Sticky Top of Tab Content) -->
<div class="em-sticky em-top-0 em-z-10 em-shrink-0 em-border-b em-border-blue-200 em-bg-blue-50 em-px-6 em-py-3 em-shadow-sm">
  <div class="em-flex em-items-center em-justify-between">

    <!-- Left: Batch Information -->
    <div class="em-flex em-items-center em-gap-3">
      <!-- Icon: Stack/Collection in Blue Circle -->
      <div class="em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-full em-bg-white em-text-[#0969DA] em-shadow-sm em-ring-1 em-ring-blue-100">
        <!-- Octicon: stack-16 -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.75 12.5a.75.75 0 0 1 .75.75V15h3a.75.75 0 0 1 0-1.5H9.25a.75.75 0 0 1 0-1.5h3.25a1.5 1.5 0 0 1 1.5 1.5v2.25a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75V13.5a1.5 1.5 0 0 1 1.5-1.5h3.25a.75.75 0 0 1 0 1.5H5.5a.75.75 0 0 1 0 1.5h3v-1.75a.75.75 0 0 1-.25-.75ZM2.75 4a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75ZM1 8.75A.75.75 0 0 1 1.75 8h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8.75Z" />
        </svg>
      </div>

      <div class="em-leading-tight">
        <h2 class="em-text-sm em-font-bold em-text-[#1F2328]">Batch Editing</h2>
        <p class="em-text-xs em-text-[#656D76]">
          Modifying <span class="em-font-bold em-text-[#0969DA]">{$editorUiState.selectedCount}</span> selected items
        </p>
      </div>
    </div>

    <!-- Right: Quick Actions -->
    <div class="em-flex em-items-center em-gap-5">

      <!-- Enable All Toggle -->
      <label class="em-flex em-items-center em-gap-2 em-cursor-pointer">
        <span class="em-text-xs em-font-bold em-text-[#1F2328]">Enable All</span>
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

      <!-- Cancel Batch Button -->
      <button
        class="em-text-xs em-font-medium em-text-[#CF222E] hover:em-underline focus:em-rounded focus:em-outline-none focus:em-ring-2 focus:em-ring-[#CF222E]/40"
        aria-label="Cancel batch selection"
        on:click={handleCancelBatch}
      >
        Cancel Batch
      </button>
    </div>
  </div>
</div>
