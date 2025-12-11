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
    class="em-absolute em-bottom-0 em-left-0 em-right-0 em-bg-[#F6F8FA] em-border-t em-border-[#D0D7DE] em-text-[#1F2328] em-px-4 em-py-3 em-shadow-md em-z-10 em-flex em-items-center em-justify-between"
    transition:fly={{ y: 100, duration: 300 }}
  >
    <div class="em-flex em-items-center em-gap-3">
      <div class="em-flex em-items-center em-gap-2">
        <svg class="em-w-5 em-h-5 em-text-[#0969DA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span class="em-font-semibold em-text-base">{selectedCount}</span>
        <span class="em-text-sm em-text-[#656D76]">{selectedCount === 1 ? 'item selected' : 'items selected'}</span>
      </div>

      <span
        class="em-px-3 em-py-1 em-bg-white em-rounded-full em-text-xs em-font-medium em-text-[#656D76] em-border em-border-[#D0D7DE]"
      >
        Batch selection
      </span>
    </div>

    <button
      class="em-inline-flex em-items-center em-gap-2 em-text-sm em-font-medium em-text-[#0969DA] em-border em-border-[#D0D7DE] em-bg-white em-px-3 em-py-2 em-rounded-md hover:em-bg-[#F6F8FA] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]/30"
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
