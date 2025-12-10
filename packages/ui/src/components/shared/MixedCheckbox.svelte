<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MIXED, type MixedValue } from '../../stores/rules';

  export let checked: MixedValue<boolean>;
  export let disabled = false;

  const dispatch = createEventDispatcher<{ change: boolean }>();

  let inputEl: HTMLInputElement;

  // Reactively update indeterminate state
  $: if (inputEl) {
    inputEl.indeterminate = checked === MIXED;
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    dispatch('change', target.checked);
  }
</script>

<input
  bind:this={inputEl}
  type="checkbox"
  {disabled}
  checked={checked === true}
  on:change={handleChange}
  class="em-h-4 em-w-4 em-text-blue-600 em-border-gray-300 em-rounded
         focus:em-ring-blue-500 focus:em-ring-2
         indeterminate:em-bg-blue-300 indeterminate:em-border-blue-300"
  {...$$restProps}
/>
