<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Header from './modal/Header.svelte';
  import Footer from './modal/Footer.svelte';
  import { activeRuleDraft, editorUiState } from '../stores/ruleEditor';

  export let currentApi: { method: string; url: string } | null = null;
  export let isBatchMode = false;
  export let selectedCount = 0;

  const dispatch = createEventDispatcher<{
    close: void;
    minimize: void;
    apply: { rule: any; editedFields: Set<string> };
    cancel: void;
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

  function handleFooterApply() {
    if ($activeRuleDraft) {
      dispatch('apply', {
        rule: $activeRuleDraft,
        editedFields: $editorUiState.dirtyFields
      });
    }
  }

  function handleFooterCancel() {
    dispatch('cancel');
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
    <Header
      {currentApi}
      {isBatchMode}
      {selectedCount}
      on:minimize={() => dispatch('minimize')}
      on:close={() => dispatch('close')}
    />

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

    <Footer on:apply={handleFooterApply} on:cancel={handleFooterCancel} />
  </div>
</div>
