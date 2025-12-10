<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let currentApi: { method: string; url: string } | null = null;
  export let isBatchMode = false;
  export let selectedCount = 0;

  const dispatch = createEventDispatcher<{
    minimize: void;
    close: void;
  }>();

  // HTTP方法颜色映射
  const methodColors: Record<string, string> = {
    POST: '#1F883D',
    GET: '#0969DA',
    PUT: '#9A6700',
    DELETE: '#CF222E',
    PATCH: '#9A6700'
  };

  function getMethodColor(method: string): string {
    return methodColors[method] || '#656D76';
  }
</script>

<header class="em-flex em-h-14 em-shrink-0 em-items-center em-justify-between em-border-b em-border-[#D0D7DE] em-bg-[#F6F8FA] em-px-4">

  <!-- Left: App Title -->
  <div class="em-flex em-items-center em-gap-3">
    <span id="modal-title" class="em-font-bold em-text-[#1F2328]">Error Mock</span>
    <div class="em-h-5 em-w-px em-bg-[#D0D7DE]"></div>
  </div>

  <!-- Center: Context (API or Batch) -->
  <div class="em-flex em-flex-1 em-items-baseline em-gap-2 em-px-4 em-text-sm em-min-w-0">
    {#if isBatchMode}
      <!-- Batch Mode -->
      <svg class="em-h-4 em-w-4 em-text-[#0969DA] em-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.75 12.5a.75.75 0 0 1 .75.75V15h3a.75.75 0 0 1 0-1.5H9.25a.75.75 0 0 1 0-1.5h3.25a1.5 1.5 0 0 1 1.5 1.5v2.25a.75.75 0 0 1-.75.75h-11a.75.75 0 0 1-.75-.75V13.5a1.5 1.5 0 0 1 1.5-1.5h3.25a.75.75 0 0 1 0 1.5H5.5a.75.75 0 0 1 0 1.5h3v-1.75a.75.75 0 0 1-.25-.75ZM2.75 4a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75ZM1 8.75A.75.75 0 0 1 1.75 8h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8.75Z" />
      </svg>
      <span class="em-font-medium em-text-[#1F2328]">
        Batch Editing <span class="em-font-bold em-text-[#0969DA]">{selectedCount} items</span>
      </span>
    {:else if currentApi}
      <!-- Single Mode -->
      <span class="em-font-mono em-font-bold em-shrink-0" style="color: {getMethodColor(currentApi.method)}">
        {currentApi.method}
      </span>
      <span class="em-truncate em-max-w-[300px] em-text-[#1F2328] em-font-medium" title={currentApi.url}>
        {currentApi.url}
      </span>
    {/if}
  </div>

  <!-- Right: Window Controls -->
  <div class="em-flex em-items-center em-gap-2">
    <!-- Minimize -->
    <button
      class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#D0D7DE]/50 hover:em-text-[#0969DA] focus:em-outline-none"
      aria-label="Minimize"
      on:click={() => dispatch('minimize')}
    >
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z" />
      </svg>
    </button>

    <!-- Close -->
    <button
      class="em-group em-flex em-h-8 em-w-8 em-items-center em-justify-center em-rounded-md em-text-[#656D76] hover:em-bg-[#FFEBE9] hover:em-text-[#CF222E] focus:em-outline-none"
      aria-label="Close"
      on:click={() => dispatch('close')}
    >
      <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
  </div>
</header>
