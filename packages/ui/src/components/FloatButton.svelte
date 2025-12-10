<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { activeMockCount } from '../stores/rules';
  import { isModalOpen, globalConfig } from '../stores/config';

  // Position state
  interface Position {
    side: 'left' | 'right';
    y: number;
  }

  let position: Position = { side: 'right', y: 300 };
  let isDragging = false;
  let isHovering = false;
  let startPos = { x: 0, y: 0 };
  let startTime = 0;

  // Derived state
  $: state = getFloatButtonState($activeMockCount, $globalConfig.enabled);
  $: statusText = getStatusText(state, $activeMockCount);

  type ButtonState = 'idle' | 'active' | 'paused';

  function getFloatButtonState(count: number, enabled: boolean): ButtonState {
    if (count === 0) return 'idle';
    if (!enabled) return 'paused';
    return 'active';
  }

  function getStatusText(state: ButtonState, count: number): { primary: string; secondary: string } {
    switch (state) {
      case 'active':
        return { primary: `${count} Active`, secondary: 'Mocking...' };
      case 'paused':
        return { primary: `${count} Paused`, secondary: 'Mocking off' };
      default:
        return { primary: '', secondary: '' };
    }
  }

  // Load saved position
  onMount(() => {
    try {
      const saved = localStorage.getItem('error-mock-button-position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.side && typeof parsed.y === 'number') {
          position = parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load button position:', err);
    }
  });

  // Save position
  function savePosition(newPosition: Position) {
    try {
      position = newPosition;
      localStorage.setItem('error-mock-button-position', JSON.stringify(newPosition));
    } catch (err) {
      console.warn('Failed to save button position:', err);
    }
  }

  // Drag handlers
  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    isHovering = false;
    startPos = { x: e.clientX, y: e.clientY };
    startTime = Date.now();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;

    const newY = Math.max(0, Math.min(e.clientY - 22, window.innerHeight - 44));
    position = { ...position, y: newY };
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
      // Snap to side based on final position
      const side = e.clientX > window.innerWidth / 2 ? 'right' : 'left';
      const newY = Math.max(0, Math.min(e.clientY - 22, window.innerHeight - 44));
      savePosition({ side, y: newY });
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

  function handleTogglePause(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    globalConfig.update((c) => ({ ...c, enabled: !c.enabled }));
  }

  onDestroy(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  // Color styles
  $: iconColors = {
    idle: { bg: 'em-bg-[#F6F8FA]', text: 'em-text-[#656D76]' },
    active: { bg: 'em-bg-[#DAFBE1]', text: 'em-text-[#1F883D]' },
    paused: { bg: 'em-bg-[#FFF8C5]', text: 'em-text-[#9A6700]' }
  }[state];

  $: edgeColor = {
    active: 'em-bg-[#2DA44E]',
    paused: 'em-bg-[#D4A72C]'
  }[state];

  $: ariaLabel = state === 'idle'
    ? 'Open Error Mock'
    : `${$activeMockCount} ${state === 'active' ? 'Active' : 'Paused'} Mocks`;
</script>

<!-- CSS for breathe animation -->
<style>
  @keyframes breathe-green {
    0%, 100% { background-color: #DAFBE1; }
    50% { background-color: #B4F4CA; }
  }
  .em-animate-breathe-green {
    animation: breathe-green 3s ease-in-out infinite;
  }
</style>

<!-- Main container -->
<div
  class="em-fixed em-z-50 em-translate-y-[-50%]"
  class:em-left-0={position.side === 'left'}
  class:em-right-0={position.side === 'right'}
  style="top: {position.y}px;"
>
  <button
    class="em-group em-relative em-flex em-h-11 em-w-12 em-cursor-pointer em-items-center em-overflow-hidden em-border-y em-border-[#D0D7DE] em-bg-white em-shadow-sm em-transition-all em-duration-300 em-ease-[cubic-bezier(0.2,0,0,1)] focus:em-outline-none focus:em-ring-2 focus:em-ring-[#0969DA]"
    class:em-rounded-l-2xl={position.side === 'right'}
    class:em-border-l={position.side === 'right'}
    class:em-rounded-r-2xl={position.side === 'left'}
    class:em-border-r={position.side === 'left'}
    class:hover:em-w-auto={state !== 'idle' && !isDragging}
    class:hover:em-pr-12={state !== 'idle' && !isDragging && position.side === 'right'}
    class:hover:em-pl-12={state !== 'idle' && !isDragging && position.side === 'left'}
    on:mousedown={handleMouseDown}
    on:mouseenter={() => !isDragging && (isHovering = true)}
    on:mouseleave={() => isHovering = false}
    on:keydown={handleKeyDown}
    aria-label={ariaLabel}
    tabindex="0"
    type="button"
  >
    <!-- Edge indicator (only for active/paused) -->
    {#if state !== 'idle'}
      <div
        class="em-absolute em-top-0 em-bottom-0 em-w-[3px] em-z-20 {edgeColor}"
        class:em-right-0={position.side === 'right'}
        class:em-left-0={position.side === 'left'}
      ></div>
    {/if}

    <!-- Icon container (fixed position) -->
    <div
      class="em-absolute em-top-0 em-flex em-h-11 em-w-12 em-items-center em-justify-center em-z-10"
      class:em-right-0={position.side === 'right'}
      class:em-left-0={position.side === 'left'}
    >
      <div
        class="em-flex em-h-7 em-w-7 em-items-center em-justify-center em-rounded-full {iconColors.bg} {iconColors.text}"
        class:em-animate-breathe-green={state === 'active'}
      >
        <!-- Beaker icon (GitHub Octicon) -->
        <svg class="em-h-4 em-w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 5.782V2.5h-.25a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 0 1.5H11v3.282l3.666 5.76C15.619 13.04 14.543 15 12.767 15H3.233c-1.776 0-2.852-1.96-1.899-3.458L5 5.782ZM9.5 2.5h-3v4.294c0 .218-.057.43-.166.616L4.55 10.5h6.9l-1.784-3.09a1.2 1.2 0 0 1-.166-.616V2.5Z"/>
        </svg>
      </div>
    </div>

    <!-- Hover content (only for active/paused, layout depends on side) -->
    {#if state !== 'idle'}
      <div
        class="em-flex em-items-center em-gap-3 em-opacity-0 em-w-0 em-transition-all em-duration-300 em-delay-75"
        class:group-hover:em-opacity-100={!isDragging}
        class:group-hover:em-w-auto={!isDragging}
        class:em-pl-4={position.side === 'right'}
        class:em-pr-4={position.side === 'left'}
        class:em-flex-row={position.side === 'right'}
        class:em-flex-row-reverse={position.side === 'left'}
      >
        <!-- Status text -->
        <div class="em-flex em-flex-col em-justify-center em-mr-1">
          <span class="em-text-xs em-font-bold em-text-[#1F2328] em-whitespace-nowrap em-leading-none">
            {statusText.primary}
          </span>
          <span
            class="em-text-[10px] em-font-medium em-leading-none em-mt-0.5"
            class:em-text-[#1F883D]={state === 'active'}
            class:em-text-[#9A6700]={state === 'paused'}
          >
            {statusText.secondary}
          </span>
        </div>

        <!-- Divider -->
        <div class="em-h-4 em-w-px em-bg-[#D0D7DE]"></div>

        <!-- Pause/Resume button -->
        <div
          class="em-flex em-items-center em-gap-1.5 em-rounded em-px-1.5 em-py-1 em-transition-colors"
          class:hover:em-bg-[#FFF8C5]={state === 'active'}
          class:hover:em-text-[#9A6700]={state === 'active'}
          class:hover:em-bg-[#DAFBE1]={state === 'paused'}
          class:hover:em-text-[#1F883D]={state === 'paused'}
          role="button"
          tabindex="-1"
          on:click={handleTogglePause}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTogglePause(e);
            }
          }}
        >
          {#if state === 'active'}
            <!-- Pause icon -->
            <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.5 2h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Zm5 0h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5Z"/>
            </svg>
            <span class="em-text-xs em-font-medium">Pause</span>
          {:else}
            <!-- Resume icon -->
            <svg class="em-h-3.5 em-w-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 12.796V3.204L11.481 8 6 12.796Zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753Z"/>
            </svg>
            <span class="em-text-xs em-font-medium">Resume</span>
          {/if}
        </div>
      </div>
    {/if}
  </button>
</div>
