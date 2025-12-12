import { useToastStore } from '@/stores/useToastStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const TOAST_COLORS = {
  success: 'em:bg-green-500',
  error: 'em:bg-red-500',
  warning: 'em:bg-yellow-500',
  info: 'em:bg-blue-500',
} as const;

const TOAST_BORDER_COLORS = {
  success: 'em:border-green-200',
  error: 'em:border-red-200',
  warning: 'em:border-yellow-200',
  info: 'em:border-blue-200',
} as const;

export function Toast() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="em:fixed em:bottom-4 em:right-4 em:z-[10000] em:flex em:flex-col em:gap-2 em:pointer-events-none em:max-w-md"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.type];
        const bgColor = TOAST_COLORS[toast.type];
        const borderColor = TOAST_BORDER_COLORS[toast.type];

        return (
          <div
            key={toast.id}
            className={`em:pointer-events-auto em:flex em:items-start em:shadow-lg em:rounded-lg em:overflow-hidden em:min-w-[320px] em:bg-white em:border-2 ${borderColor} em:animate-in em:slide-in-from-right em:fade-in em:duration-300`}
          >
            {/* Icon Section */}
            <div
              className={`em:p-4 em:flex em:items-center em:justify-center em:text-white ${bgColor}`}
            >
              <Icon className="em:w-6 em:h-6" />
            </div>

            {/* Message Section */}
            <div className="em:flex-1 em:p-4">
              <p className="em:text-sm em:font-medium em:text-gray-900">{toast.message}</p>

              {/* Progress bar for auto-dismiss */}
              {toast.duration && toast.duration > 0 && (
                <div className="em:mt-2 em:h-1 em:bg-gray-200 em:rounded-full em:overflow-hidden">
                  <div
                    className={`em:h-full ${bgColor}`}
                    style={{
                      animation: `shrink ${toast.duration}ms linear forwards`,
                      width: '100%',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="em:p-4 em:text-gray-400 hover:em:text-gray-600 em:transition-colors"
              aria-label="Dismiss notification"
              type="button"
            >
              <X className="em:w-5 em:h-5" />
            </button>
          </div>
        );
      })}

      {/* Keyframes for progress bar animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
