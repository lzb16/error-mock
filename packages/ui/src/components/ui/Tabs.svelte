<script lang="ts">
  import { createTabs, melt } from '@melt-ui/svelte';
  import type { Tab } from './types';

  /**
   * Array of tabs to display
   */
  export let tabs: Tab[] = [];

  /**
   * Currently active tab value
   */
  export let value: string;

  /**
   * Callback when tab changes
   */
  export let onChange: ((value: string) => void) | undefined = undefined;

  /**
   * Layout orientation (default: horizontal)
   */
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';

  // Create Melt UI tabs with controlled value
  const {
    elements: { root, list, trigger },
    states: { value: meltValue }
  } = createTabs({
    defaultValue: value,
    orientation,
    onValueChange: ({ next }) => {
      if (next && onChange) {
        onChange(next);
      }
      return next;
    }
  });

  // Sync external value prop with internal Melt state
  $: if (value !== undefined && value !== $meltValue) {
    meltValue.set(value);
  }
</script>

<div use:melt={$root}>
  <!-- Tab List (Navigation) -->
  <nav
    use:melt={$list}
    class="em-flex em-gap-1"
    class:em-flex-col={orientation === 'vertical'}
  >
    {#each tabs as tab (tab.value)}
      {@const isActive = $meltValue === tab.value}
      <button
        use:melt={$trigger(tab.value)}
        disabled={tab.disabled}
        class="
          em-rounded-md
          em-px-3
          em-py-1.5
          em-text-sm
          em-font-medium
          em-transition-colors
          focus:em-outline-none
          focus:em-ring-2
          focus:em-ring-[#0969DA]
          focus:em-ring-offset-1
          disabled:em-cursor-not-allowed
          disabled:em-opacity-50
        "
        class:em-bg-[#F6F8FA]={isActive}
        class:em-text-[#1F2328]={isActive}
        class:em-text-[#656D76]={!isActive}
        class:hover:em-bg-[#F6F8FA]={!isActive}
        class:hover:em-text-[#1F2328]={!isActive}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- Tab Content Slot (rendered by parent) -->
  <slot />
</div>
