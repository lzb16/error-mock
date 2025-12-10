<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { activeRuleDraft, editorUiState } from '../../stores/ruleEditor';
  import RuleControlBar from './controls/RuleControlBar.svelte';
  import BatchControlBar from './controls/BatchControlBar.svelte';

  const dispatch = createEventDispatcher<{
    cancelBatch: void;
  }>();

  // Reactive store bindings
  $: draft = $activeRuleDraft;
  $: uiState = $editorUiState;
  $: activeTab = uiState.activeTab;
  $: isBatchMode = uiState.isBatchMode;

  // Event handlers
  function handleCancelBatch() {
    dispatch('cancelBatch');
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
