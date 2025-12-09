<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher<{
    close: void;
    minimize: void;
  }>();

  let modalElement: HTMLElement | null = null;
  let previousActiveElement: HTMLElement | null = null;

  onMount(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Store previously focused element
    previousActiveElement = document.activeElement as HTMLElement;

    // Focus first focusable element in modal after render
    setTimeout(() => {
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalElement.focus();
        }
      }
    }, 0);
  });

  onDestroy(() => {
    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus to previously active element
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  });

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      dispatch('close');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      dispatch('close');
      return;
    }

    // Focus trap implementation
    if (e.key === 'Tab' && modalElement) {
      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const focusableArray = Array.from(focusableElements);
      const firstElement = focusableArray[0];
      const lastElement = focusableArray[focusableArray.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        // Shift+Tab on first element -> focus last
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        // Tab on last element -> focus first
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div
  class="em-fixed em-inset-0 em-z-[9998] em-flex em-items-center em-justify-center em-bg-black/30 em-backdrop-blur-sm"
  transition:fade={{ duration: 200 }}
  on:click={handleBackdropClick}
  on:keydown={handleKeydown}
  role="presentation"
>
  <!-- Modal Container -->
  <div
    bind:this={modalElement}
    class="em-bg-white em-w-11/12 em-max-w-7xl em-h-5/6 em-max-h-[90vh] em-rounded-2xl em-shadow-2xl em-flex em-flex-col em-overflow-hidden em-outline-none"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    transition:scale={{ start: 0.95, duration: 200 }}
    on:click|stopPropagation
  >
    <!-- Header -->
    <div
      class="em-flex em-justify-between em-items-center em-px-6 em-py-4 em-border-b em-border-gray-200 em-bg-gradient-to-r em-from-blue-50 em-to-indigo-50"
    >
      <h2 id="modal-title" class="em-text-xl em-font-bold em-text-gray-800 em-flex em-items-center em-gap-2">
        <svg
          class="em-w-6 em-h-6 em-text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        Error Mock Control Panel
      </h2>

      <div class="em-flex em-gap-2">
        <button
          class="em-p-2 em-text-gray-500 hover:em-text-gray-700 hover:em-bg-gray-100 em-rounded-lg em-transition-colors em-duration-150"
          on:click={() => dispatch('minimize')}
          aria-label="Minimize"
          type="button"
        >
          <svg class="em-w-5 em-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <button
          class="em-p-2 em-text-gray-500 hover:em-text-red-600 hover:em-bg-red-50 em-rounded-lg em-transition-colors em-duration-150"
          on:click={() => dispatch('close')}
          aria-label="Close"
          type="button"
        >
          <svg class="em-w-5 em-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content Body - Left/Right Split -->
    <div class="em-flex em-flex-1 em-overflow-hidden">
      <!-- Left Sidebar -->
      <div class="em-w-1/3 em-min-w-[320px] em-border-r em-border-gray-200 em-flex em-flex-col em-bg-white">
        <slot name="sidebar" />
      </div>

      <!-- Right Content -->
      <div class="em-w-2/3 em-flex em-flex-col em-bg-gray-50">
        <slot name="content" />
      </div>
    </div>
  </div>
</div>
