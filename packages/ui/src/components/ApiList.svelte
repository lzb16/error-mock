<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ApiMeta, MockRule } from '@error-mock/core';
  import { searchQuery, groupedMetas, selectedIds } from '../stores/rules';

  export let rules: Map<string, MockRule>;

  const dispatch = createEventDispatcher<{
    select: string;
    toggle: string;
  }>();

  let expandedModules = new Set<string>();
  let lastSelectedIndex = -1;
  let initializedModules = false;

  // Toggle module expansion
  function toggleModule(module: string) {
    if (expandedModules.has(module)) {
      expandedModules.delete(module);
    } else {
      expandedModules.add(module);
    }
    expandedModules = expandedModules; // trigger reactivity
  }

  // Get method badge color
  function getMethodColor(method: string): string {
    const upperMethod = method.toUpperCase();
    switch (upperMethod) {
      case 'GET':
        return 'em-bg-blue-100 em-text-blue-800';
      case 'POST':
        return 'em-bg-green-100 em-text-green-800';
      case 'PUT':
        return 'em-bg-orange-100 em-text-orange-800';
      case 'DELETE':
        return 'em-bg-red-100 em-text-red-800';
      case 'PATCH':
        return 'em-bg-purple-100 em-text-purple-800';
      default:
        return 'em-bg-gray-100 em-text-gray-800';
    }
  }

  // Get status dot color based on rule state
  function getStatusDot(meta: ApiMeta): string {
    const id = `${meta.module}-${meta.name}`;
    const rule = rules.get(id);

    if (!rule || !rule.enabled || rule.mockType === 'none') {
      return 'em-bg-gray-300'; // Disabled or no rule
    }

    if (rule.mockType === 'success') {
      return 'em-bg-green-500'; // Success mock
    }

    // businessError or networkError
    return 'em-bg-red-500'; // Error mock
  }

  // Handle API selection
  function handleSelect(meta: ApiMeta, event?: MouseEvent) {
    const id = `${meta.module}-${meta.name}`;

    if (event?.shiftKey && lastSelectedIndex >= 0) {
      // Shift+click for range selection (TODO: implement if needed)
      dispatch('select', id);
    } else if (event?.ctrlKey || event?.metaKey) {
      // Ctrl/Cmd+click for multi-select
      dispatch('toggle', id);
    } else {
      // Normal click - single select
      dispatch('select', id);
    }
  }

  // Handle checkbox toggle
  function handleCheckbox(meta: ApiMeta, event: Event) {
    event.stopPropagation();
    const id = `${meta.module}-${meta.name}`;
    dispatch('toggle', id);
  }

  // Keyboard navigation
  function handleKeydown(meta: ApiMeta, event: KeyboardEvent) {
    const id = `${meta.module}-${meta.name}`;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) {
        dispatch('toggle', id);
      } else {
        dispatch('select', id);
      }
    }
  }

  // Expand modules on first load; preserve user collapse state afterward
  $: if ($groupedMetas) {
    const moduleKeys = new Set($groupedMetas.keys());

    if (!initializedModules) {
      // First time: expand all modules
      expandedModules = new Set(moduleKeys);
      initializedModules = true;
    } else {
      // Keep user state, but remove modules that no longer exist (e.g., filtered out)
      expandedModules = new Set([...expandedModules].filter((module) => moduleKeys.has(module)));
    }
  }

  function clearSearch() {
    searchQuery.set('');
  }
</script>

<div class="em-flex em-flex-col em-h-full em-min-w-0">
  <!-- Search Bar -->
  <div class="em-p-4 em-border-b em-border-gray-200 em-bg-white em-w-full">
    <div class="em-relative em-w-full">
      <input
        type="text"
        bind:value={$searchQuery}
        placeholder="Search APIs... (⌘K)"
        class="em-w-full em-max-w-full em-px-4 em-py-2 em-pl-10 em-pr-10 em-border em-border-gray-300 em-rounded-lg focus:em-ring-2 focus:em-ring-blue-500 focus:em-border-blue-500 focus:em-outline-none em-text-sm"
        aria-label="Search APIs"
      />
      <svg
        class="em-absolute em-left-3 em-top-1/2 em-transform -em-translate-y-1/2 em-w-4 em-h-4 em-text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {#if $searchQuery}
        <button
          class="em-absolute em-right-3 em-top-1/2 em-transform -em-translate-y-1/2 em-text-gray-400 hover:em-text-gray-600"
          on:click={clearSearch}
          aria-label="Clear search"
          type="button"
        >
          <svg class="em-w-4 em-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- API List -->
  <div class="em-flex-1 em-overflow-y-auto em-p-2">
    {#if $groupedMetas.size === 0}
      <div class="em-flex em-flex-col em-items-center em-justify-center em-h-full em-text-gray-500">
        <svg
          class="em-w-16 em-h-16 em-mb-4 em-text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="em-text-sm em-font-medium">No APIs found</p>
        {#if $searchQuery}
          <p class="em-text-xs em-mt-1">Try a different search query</p>
        {/if}
      </div>
    {:else}
      {#each Array.from($groupedMetas.entries()) as [module, metas]}
        <div class="em-mb-2">
          <!-- Module Header -->
          <button
            class="em-flex em-items-center em-w-full em-p-2 em-text-left em-bg-gray-50 hover:em-bg-gray-100 em-rounded-lg em-transition-colors em-duration-150"
            on:click={() => toggleModule(module)}
            type="button"
            aria-expanded={expandedModules.has(module)}
          >
            <svg
              class="em-w-4 em-h-4 em-transition-transform em-duration-200 {expandedModules.has(module)
                ? 'em-rotate-90'
                : ''}"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="em-ml-2 em-font-semibold em-text-gray-700 em-text-sm">{module}</span>
            <span class="em-ml-auto em-text-xs em-bg-gray-200 em-px-2 em-py-0.5 em-rounded-full">
              {metas.length}
            </span>
          </button>

          <!-- API Items -->
          {#if expandedModules.has(module)}
            <div class="em-ml-4 em-mt-1 em-space-y-1">
              {#each metas as meta}
                {@const id = `${meta.module}-${meta.name}`}
                {@const isSelected = $selectedIds.has(id)}
                <div
                  class="em-flex em-items-center em-p-2 em-rounded-lg em-cursor-pointer hover:em-bg-blue-50 em-transition-colors em-duration-150 {isSelected
                    ? 'em-bg-blue-50 em-ring-1 em-ring-blue-200'
                    : ''}"
                  on:click={(e) => handleSelect(meta, e)}
                  on:keydown={(e) => handleKeydown(meta, e)}
                  role="option"
                  aria-selected={isSelected}
                  tabindex="0"
                >
                  <!-- Checkbox -->
                  <input
                    type="checkbox"
                    checked={isSelected}
                    on:click={(e) => handleCheckbox(meta, e)}
                    class="em-mr-3 em-h-4 em-w-4 em-text-blue-600 em-rounded focus:em-ring-blue-500 em-cursor-pointer"
                    aria-label="Select {meta.name}"
                  />

                  <!-- API Info -->
                  <div class="em-flex-1 em-min-w-0">
                    <div class="em-flex em-items-center em-gap-2 em-mb-1">
                      <!-- Method Badge -->
                      <span
                        class="em-text-xs em-font-medium em-px-2 em-py-0.5 em-rounded {getMethodColor(meta.method)}"
                      >
                        {meta.method}
                      </span>
                      <!-- API Name -->
                      <span class="em-truncate em-text-sm em-font-medium em-text-gray-900" title={meta.name}>
                        {meta.name || meta.url}
                      </span>
                    </div>
                    <!-- URL -->
                    <div class="em-text-xs em-text-gray-500 em-truncate" title={meta.url}>
                      {meta.url}
                    </div>
                  </div>

                  <!-- Status Indicator -->
                  <div class="em-ml-2">
                    <div class="em-w-3 em-h-3 em-rounded-full {getStatusDot(meta)}" aria-hidden="true" />
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>
