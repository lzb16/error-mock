<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';

  export let selectedCount = 0;

  const dispatch = createEventDispatcher<{
    clear: void;
  }>();

  function handleClear() {
    dispatch('clear');
  }
</script>

{#if selectedCount > 0}
  <div
    class="em-absolute em-bottom-0 em-left-0 em-right-0 em-bg-gradient-to-r em-from-blue-600 em-to-blue-700 em-text-white em-p-4 em-shadow-lg em-z-10 em-flex em-items-center em-justify-between"
    transition:fly={{ y: 100, duration: 300 }}
  >
    <div class="em-flex em-items-center em-gap-4">
      <div class="em-flex em-items-center em-gap-2">
        <svg class="em-w-5 em-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span class="em-font-bold em-text-2xl">{selectedCount}</span>
        <span class="em-text-sm em-opacity-90">{selectedCount === 1 ? 'item' : 'items'} selected</span>
      </div>

      <span
        class="em-px-3 em-py-1 em-bg-blue-800 em-rounded-full em-text-xs em-font-medium em-border em-border-blue-500"
      >
        Batch Editing
      </span>
    </div>

    <button
      class="em-flex em-items-center em-gap-2 em-text-sm em-bg-white em-text-blue-700 em-font-medium em-px-4 em-py-2 em-rounded-lg hover:em-bg-blue-50 em-transition-colors em-shadow-md"
      on:click={handleClear}
      type="button"
    >
      <svg class="em-w-4 em-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Clear Selection
    </button>
  </div>
{/if}
