<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { hasUnsavedChanges, editorUiState } from '../../stores/ruleEditor';

  const dispatch = createEventDispatcher<{
    cancel: void;
    apply: void;
  }>();
</script>

{#if $hasUnsavedChanges}
  <footer
    role="contentinfo"
    class="em-flex em-h-14 em-shrink-0 em-items-center em-justify-between em-border-t em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-6"
  >
    <!-- Left: Status/Warning -->
    <div class="em-flex em-items-center em-gap-2">
      {#if $editorUiState.isBatchMode}
        <!-- Batch Mode: Blue dot + status text -->
        <span class="em-h-2 em-w-2 em-rounded-full em-bg-[#0969DA]"></span>
        <span class="em-text-xs em-font-medium em-text-[#656D76]">
          Pending changes for {$editorUiState.selectedCount} items...
        </span>
      {:else}
        <!-- Single Mode: Warning icon + message -->
        <span class="em-mr-auto em-text-xs em-text-amber-600 em-flex em-items-center em-gap-1">
          <!-- Warning Icon -->
          <svg class="em-w-3 em-h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          Unsaved changes
        </span>
      {/if}
    </div>

    <!-- Right: Action Buttons -->
    <div class="em-flex em-gap-2">
      <!-- Cancel Button -->
      <button
        class="em-rounded-md em-border em-border-[#D0D7DE] em-bg-white em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-[#1F2328] em-shadow-sm hover:em-bg-[#F3F4F6] focus:em-ring-2 focus:em-ring-[#0969DA]/30 focus:em-outline-none"
        on:click={() => dispatch('cancel')}
      >
        Cancel
      </button>

      <!-- Apply Button -->
      {#if $editorUiState.isBatchMode}
        <button
          class="em-rounded-md em-bg-[#0969DA] em-px-4 em-py-1.5 em-text-sm em-font-bold em-text-white em-shadow-sm hover:em-bg-[#0860CA] focus:em-ring-2 focus:em-ring-[#0969DA]/40 focus:em-outline-none"
          on:click={() => dispatch('apply')}
        >
          Apply to {$editorUiState.selectedCount} Selected
        </button>
      {:else}
        <button
          class="em-rounded-md em-bg-[#1F883D] em-px-4 em-py-1.5 em-text-sm em-font-medium em-text-white hover:em-bg-[#1a7f37] focus:em-ring-2 focus:em-ring-[#0969DA] focus:em-ring-offset-1"
          on:click={() => dispatch('apply')}
        >
          Apply Changes
        </button>
      {/if}
    </div>
  </footer>
{/if}
