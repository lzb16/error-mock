import { writable, type Writable } from 'svelte/store';
import { DEFAULT_GLOBAL_CONFIG, type GlobalConfig } from '@error-mock/core';

// Global configuration store
export const globalConfig: Writable<GlobalConfig> = writable(DEFAULT_GLOBAL_CONFIG);

// Modal state stores
export const isModalOpen = writable(false);
export const isMinimized = writable(false);

// Toast notification interface
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Toast store with helper functions
function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  let nextId = 0;

  return {
    subscribe,
    add: (message: string, type: Toast['type'] = 'info', duration = 3000) => {
      const id = `toast-${nextId++}`;
      const toast: Toast = { id, message, type, duration };

      update((toasts) => [...toasts, toast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    dismiss: (id: string) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    clear: () => {
      update(() => []);
    },
  };
}

export const toasts = createToastStore();
