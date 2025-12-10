<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MIXED, type MixedValue } from '../../stores/rules';

  export let value: MixedValue<string | number>;
  export let type: 'text' | 'number' = 'text';
  export let placeholder = '';
  export let disabled = false;

  const dispatch = createEventDispatcher<{ input: string | number }>();

  // Internal state for the input element
  let inputValue: string | number = '';
  let isMixed = false;

  // React to external value changes
  $: {
    if (value === MIXED) {
      inputValue = '';
      isMixed = true;
    } else {
      inputValue = value;
      isMixed = false;
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    let newValue: string | number = target.value;

    if (type === 'number') {
      newValue = target.value === '' ? 0 : parseFloat(target.value);
    }

    // Dispatch the concrete value (never MIXED)
    dispatch('input', newValue);
  }
</script>

<input
  {type}
  {disabled}
  value={inputValue}
  on:input={handleInput}
  placeholder={isMixed ? '(Mixed)' : placeholder}
  class="em-w-full em-px-3 em-py-2 em-text-sm em-border em-rounded-md
         focus:em-ring-2 focus:em-ring-blue-500 focus:em-outline-none
         {isMixed
    ? 'em-italic em-text-gray-500 placeholder:em-text-gray-400'
    : 'em-border-gray-300'}"
  {...$$restProps}
/>
