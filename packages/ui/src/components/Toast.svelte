<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { toasts } from '../stores/config';

  function getIcon(type: 'success' | 'error' | 'info' | 'warning') {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'i';
    }
  }

  function getColors(type: 'success' | 'error' | 'info' | 'warning') {
    switch (type) {
      case 'success':
        return 'em-bg-green-500';
      case 'error':
        return 'em-bg-red-500';
      case 'warning':
        return 'em-bg-yellow-500';
      case 'info':
      default:
        return 'em-bg-blue-500';
    }
  }

  function getBorderColor(type: 'success' | 'error' | 'info' | 'warning') {
    switch (type) {
      case 'success':
        return 'em-border-green-200';
      case 'error':
        return 'em-border-red-200';
      case 'warning':
        return 'em-border-yellow-200';
      case 'info':
      default:
        return 'em-border-blue-200';
    }
  }
</script>

<div
  class="em-fixed em-bottom-4 em-right-4 em-z-[10000] em-flex em-flex-col em-gap-2 em-pointer-events-none em-max-w-md"
  role="region"
  aria-label="Notifications"
  aria-live="polite"
>
  {#each $toasts as toast (toast.id)}
    <div
      animate:flip={{ duration: 300 }}
      in:fly={{ x: 300, duration: 300 }}
      out:fly={{ x: 300, duration: 200 }}
      class="em-pointer-events-auto em-flex em-items-start em-shadow-lg em-rounded-lg em-overflow-hidden em-min-w-[320px] em-bg-white em-border-2 {getBorderColor(
        toast.type
      )}"
    >
      <!-- Icon Section -->
      <div class="em-p-4 em-flex em-items-center em-justify-center {getColors(toast.type)} em-text-white">
        <span class="em-font-bold em-text-xl em-w-6 em-h-6 em-flex em-items-center em-justify-center">
          {getIcon(toast.type)}
        </span>
      </div>

      <!-- Content Section -->
      <div class="em-flex-1 em-p-4">
        <div class="em-text-sm em-font-medium em-text-gray-900">{toast.message}</div>
        {#if toast.duration && toast.duration > 0}
          <div class="em-mt-2 em-h-1 em-bg-gray-200 em-rounded-full em-overflow-hidden">
            <div
              class="em-h-full {getColors(toast.type)} em-animate-[shrink_{toast.duration}ms_linear]"
              style="animation: shrink {toast.duration}ms linear; width: 100%;"
            />
          </div>
        {/if}
      </div>

      <!-- Dismiss Button -->
      <button
        class="em-p-4 em-text-gray-400 hover:em-text-gray-600 em-transition-colors"
        on:click={() => toasts.dismiss(toast.id)}
        aria-label="Dismiss notification"
        type="button"
      >
        <svg class="em-w-5 em-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }

  :global(.em-animate-\[shrink_.*\]) {
    animation-fill-mode: forwards;
  }
</style>
