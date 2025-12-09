<script lang="ts">
  import { spring } from 'svelte/motion';
  import { onMount, onDestroy } from 'svelte';
  import { activeMockCount } from '../stores/rules';
  import { isModalOpen, globalConfig } from '../stores/config';

  // Spring animation for smooth drag movement
  let coords = spring(
    { x: 0, y: 0 },
    {
      stiffness: 0.1,
      damping: 0.25,
    }
  );

  // Drag state
  let isDragging = false;
  let startPos = { x: 0, y: 0 };
  let startTime = 0;

  // Initialize position from config or use default
  onMount(() => {
    const pos = getPositionFromConfig($globalConfig.position);
    coords.set(pos, { hard: true });
    loadSavedPosition();
  });

  function getPositionFromConfig(
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  ) {
    const margin = 20;
    const buttonSize = 56;

    switch (position) {
      case 'bottom-right':
        return {
          x: window.innerWidth - buttonSize - margin,
          y: window.innerHeight - buttonSize - margin,
        };
      case 'bottom-left':
        return { x: margin, y: window.innerHeight - buttonSize - margin };
      case 'top-right':
        return { x: window.innerWidth - buttonSize - margin, y: margin };
      case 'top-left':
        return { x: margin, y: margin };
    }
  }

  function loadSavedPosition() {
    try {
      const saved = localStorage.getItem('error-mock-button-position');
      if (saved) {
        const pos = JSON.parse(saved);
        coords.set(pos, { hard: true });
      }
    } catch (err) {
      console.warn('Failed to load button position:', err);
    }
  }

  function savePosition(x: number, y: number) {
    try {
      localStorage.setItem('error-mock-button-position', JSON.stringify({ x, y }));
    } catch (err) {
      console.warn('Failed to save button position:', err);
    }
  }

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    startPos = { x: e.clientX, y: e.clientY };
    startTime = Date.now();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;

    const buttonSize = 56;
    const newX = Math.max(0, Math.min(e.clientX - buttonSize / 2, window.innerWidth - buttonSize));
    const newY = Math.max(0, Math.min(e.clientY - buttonSize / 2, window.innerHeight - buttonSize));

    coords.set({ x: newX, y: newY });
  }

  function handleMouseUp(e: MouseEvent) {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    if (!isDragging) return;
    isDragging = false;

    const dist = Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y);
    const time = Date.now() - startTime;

    // Click detection: <5px movement and <300ms duration
    if (dist < 5 && time < 300) {
      toggleModal();
    } else {
      // Save position after drag
      savePosition($coords.x, $coords.y);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleModal();
    }
  }

  function toggleModal() {
    isModalOpen.update((v) => !v);
  }

  onDestroy(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });
</script>

<div
  class="em-fixed em-z-[9999] em-touch-none"
  style="transform: translate({$coords.x}px, {$coords.y}px); will-change: transform;"
>
  <button
    class="em-bg-blue-600 em-text-white em-rounded-full em-w-14 em-h-14 em-shadow-lg em-flex em-items-center em-justify-center em-cursor-move hover:em-bg-blue-700 hover:em-scale-105 em-transition-transform em-duration-200 focus:em-outline-none focus:em-ring-2 focus:em-ring-offset-2 focus:em-ring-blue-500 em-relative"
    on:mousedown={handleMouseDown}
    on:keydown={handleKeyDown}
    aria-label="Open Error Mock Settings"
    tabindex="0"
    type="button"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="em-h-8 em-w-8"
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

    {#if $activeMockCount > 0}
      <span
        class="em-absolute -em-top-1 -em-right-1 em-bg-red-500 em-text-white em-text-xs em-font-bold em-w-6 em-h-6 em-rounded-full em-flex em-items-center em-justify-center em-border-2 em-border-white em-animate-pulse"
        aria-label="{$activeMockCount} active mocks"
      >
        {$activeMockCount}
      </span>
    {/if}
  </button>
</div>
