<script lang="ts">
  import { createSwitch, melt } from '@melt-ui/svelte';

  /**
   * Label text for the switch
   */
  export let label: string = '';

  /**
   * Whether the switch is checked
   */
  export let checked: boolean = false;

  /**
   * Whether the switch is disabled
   */
  export let disabled: boolean = false;

  /**
   * Callback when switch state changes
   */
  export let onChange: ((checked: boolean) => void) | undefined = undefined;

  /**
   * Size variant (default: md)
   */
  export let size: 'sm' | 'md' = 'md';

  // Create Melt UI switch
  const {
    elements: { root, input },
    states: { checked: meltChecked }
  } = createSwitch({
    defaultChecked: checked,
    disabled,
    onCheckedChange: ({ next }) => {
      if (onChange) {
        onChange(next);
      }
      return next;
    }
  });

  // Sync external checked prop with internal Melt state
  $: if (checked !== undefined && checked !== $meltChecked) {
    meltChecked.set(checked);
  }

  // Size classes
  $: trackClasses = size === 'sm'
    ? 'em-h-4 em-w-7'
    : 'em-h-5 em-w-9';

  $: thumbClasses = size === 'sm'
    ? 'em-h-3 em-w-3'
    : 'em-h-4 em-w-4';

  $: thumbTranslate = size === 'sm'
    ? 'peer-checked:em-translate-x-3'
    : 'peer-checked:em-translate-x-4';
</script>

<label
  use:melt={$root}
  class="em-flex em-items-center em-gap-2 em-cursor-pointer"
  class:em-opacity-50={disabled}
  class:em-cursor-not-allowed={disabled}
>
  {#if label}
    <span class="em-text-xs em-font-medium em-text-[#1F2328]">
      {label}
    </span>
  {/if}

  <!-- Hidden native checkbox (for accessibility) -->
  <input
    use:melt={$input}
    type="checkbox"
    class="em-peer em-sr-only"
    {disabled}
  />

  <!-- Visual track -->
  <div
    class="
      em-relative
      {trackClasses}
      em-rounded-full
      em-bg-[#D0D7DE]
      em-transition-colors
      peer-checked:em-bg-[#1F883D]
      peer-focus:em-ring-2
      peer-focus:em-ring-[#0969DA]
      peer-focus:em-ring-offset-1
    "
  >
    <!-- Thumb -->
    <span
      class="
        em-absolute
        em-left-[2px]
        em-top-[2px]
        {thumbClasses}
        em-rounded-full
        em-bg-white
        em-shadow-sm
        em-transition-transform
        {thumbTranslate}
      "
    ></span>
  </div>
</label>
