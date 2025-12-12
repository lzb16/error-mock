import { useState, useEffect, useRef } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useRulesStore } from '@/stores/useRulesStore';
import type { GlobalConfig } from '@error-mock/core';

const MARGIN = 20;
const BUTTON_SIZE = 56;

interface Position {
  x: number;
  y: number;
}

interface DragStart {
  x: number;
  y: number;
  time: number;
}

/**
 * Clamp position to viewport boundaries with margin
 */
function clampPosition({ x, y }: Position): Position {
  const maxX = Math.max(MARGIN, window.innerWidth - BUTTON_SIZE - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - BUTTON_SIZE - MARGIN);
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  };
}

/**
 * Get default position from GlobalConfig position setting
 */
function getPositionFromConfig(pos: GlobalConfig['position']): Position {
  switch (pos) {
    case 'bottom-right':
      return {
        x: window.innerWidth - BUTTON_SIZE - MARGIN,
        y: window.innerHeight - BUTTON_SIZE - MARGIN,
      };
    case 'bottom-left':
      return { x: MARGIN, y: window.innerHeight - BUTTON_SIZE - MARGIN };
    case 'top-right':
      return { x: window.innerWidth - BUTTON_SIZE - MARGIN, y: MARGIN };
    case 'top-left':
      return { x: MARGIN, y: MARGIN };
  }
}

/**
 * Save position to localStorage
 */
function savePosition(x: number, y: number): void {
  try {
    localStorage.setItem('error-mock-float-button-pos', JSON.stringify({ x, y }));
  } catch (err) {
    console.warn('[ErrorMock] Failed to save button position:', err);
  }
}

export function FloatButton() {
  const { globalConfig, toggleModal, isModalOpen } = useConfigStore();
  const activeMockCount = useRulesStore((state) => state.activeMockCount());

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false); // Sync dragging state to avoid stale closure
  const dragStartRef = useRef<DragStart>({ x: 0, y: 0, time: 0 });

  // Initialize position from localStorage or config
  useEffect(() => {
    const initPosition = () => {
      // Try to load from localStorage first
      try {
        const saved = localStorage.getItem('error-mock-float-button-pos');
        if (saved) {
          const pos = JSON.parse(saved) as Position;
          if (typeof pos.x === 'number' && typeof pos.y === 'number') {
            setPosition(clampPosition(pos));
            return;
          }
        }
      } catch (err) {
        console.warn('[ErrorMock] Failed to load button position:', err);
      }

      // Fallback to config position
      const defaultPos = getPositionFromConfig(globalConfig.position);
      setPosition(clampPosition(defaultPos));
    };

    initPosition();
  }, [globalConfig.position]);

  // Drag handlers using Pointer Events (supports touch and mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    draggingRef.current = true; // Set sync flag
    setIsDragging(true); // Set async state for UI

    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
      time: Date.now(),
    };

    // Capture pointer events
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return; // Use ref for sync check

    const newPos = {
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    };

    setPosition(clampPosition(newPos));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;

    draggingRef.current = false; // Clear sync flag
    setIsDragging(false); // Clear async state

    // Calculate movement distance and time
    const dist = Math.hypot(
      e.clientX - (position.x + dragStartRef.current.x),
      e.clientY - (position.y + dragStartRef.current.y)
    );
    const time = Date.now() - dragStartRef.current.time;

    // Click detection: <5px movement and <300ms duration
    if (dist < 5 && time < 300) {
      toggleModal(); // Click → open Modal (only called when Modal is closed due to pointerEvents: none)
    } else {
      // Save position after drag
      savePosition(position.x, position.y);
    }

    // Release pointer capture
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    draggingRef.current = false;
    setIsDragging(false);
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleModal();
    }
  };

  return (
    <button
      className="em:fixed em:touch-none em:top-0 em:left-0 em:bg-blue-600 em:text-white em:rounded-full em:w-14 em:h-14 em:shadow-lg em:flex em:items-center em:justify-center em:cursor-pointer hover:em:bg-blue-700 hover:em:scale-105 em:transition-transform em:duration-200 focus:em:outline-none focus:em:ring-2 focus:em:ring-offset-2 focus:em:ring-blue-500"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        willChange: isDragging ? 'transform' : 'auto',
        zIndex: isModalOpen ? 49 : 9999, // Lower z-index when Modal open to prevent overlapping
        pointerEvents: isModalOpen ? 'none' : 'auto', // Disable when Modal is open
        opacity: isModalOpen ? 0.5 : 1, // Visual feedback
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label="Toggle Error Mock Panel"
      aria-disabled={isModalOpen}
      tabIndex={isModalOpen ? -1 : 0}
      type="button"
    >
      {/* Settings icon */}
      <svg
        className="em:h-8 em:w-8 em:pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>

      {/* Active mock count badge */}
      {activeMockCount > 0 && (
        <span className="em:absolute -em:top-1 -em:right-1 em:bg-red-500 em:text-white em:text-xs em:font-bold em:w-6 em:h-6 em:rounded-full em:flex em:items-center em:justify-center em:border-2 em:border-white em:animate-pulse">
          {activeMockCount}
        </span>
      )}
    </button>
  );
}
