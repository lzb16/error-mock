import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastState = {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

// Track setTimeout handles outside store for cleanup
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const clearTimer = (id: string) => {
  const handle = timers.get(id);
  if (handle) {
    clearTimeout(handle);
    timers.delete(id);
  }
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = `toast-${crypto.randomUUID?.() ?? Date.now()}`;
    const toast: Toast = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    if (duration > 0) {
      const handle = setTimeout(() => {
        get().dismissToast(id);
      }, duration);
      timers.set(id, handle);
    }

    return id;
  },

  dismissToast: (id) => {
    clearTimer(id);
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clearToasts: () => {
    for (const handle of Array.from(timers.values())) clearTimeout(handle);
    timers.clear();
    set({ toasts: [] });
  },
}));
