import { useConfigStore } from '@/stores/useConfigStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function Modal() {
  const { isModalOpen, setModalOpen } = useConfigStore();

  // Prevent closing on outside click to avoid data loss
  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent
        showCloseButton={false}
        className="em:w-11/12 em:max-w-7xl em:h-5/6 em:max-h-[90vh] em:p-0 em:gap-0 em:flex em:flex-col"
        aria-describedby={undefined}
        onPointerDownOutside={handleInteractOutside}
        onInteractOutside={handleInteractOutside}
      >
        {/*
          DialogTitle for screen reader accessibility
          Note: Radix UI may still warn about missing DialogTitle in Shadow DOM
          This is a known issue: https://github.com/radix-ui/primitives/issues/3484
          The title IS present and accessible, but Radix's detection fails in Shadow DOM
        */}
        <DialogTitle className="em:sr-only">Error Mock Control Panel</DialogTitle>

        {/* Header */}
        <DialogHeader className="em:flex em:flex-row em:items-center em:justify-between em:px-6 em:py-4 em:border-b em:border-gray-200 em:bg-gradient-to-r em:from-blue-50 em:to-indigo-50 em:space-y-0">
          <div className="em:flex em:items-center em:gap-2">
            {/* Settings Icon */}
            <svg
              className="em:w-6 em:h-6 em:text-blue-600"
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
            <h2 className="em:text-xl em:font-bold em:text-gray-800" aria-hidden="true">
              Error Mock Control Panel
            </h2>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setModalOpen(false)}
            className="em:rounded-sm em:opacity-70 em:transition-opacity hover:em:opacity-100 focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:ring-offset-2"
            aria-label="Close modal"
            type="button"
          >
            <svg
              className="em:w-5 em:h-5 em:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </DialogHeader>

        {/* Body: Sidebar + Content */}
        <div className="em:flex em:flex-1 em:overflow-hidden">
          {/* Sidebar */}
          <div className="em:w-1/3 em:min-w-[320px] em:border-r em:border-gray-200 em:flex em:flex-col em:bg-white">
            {/* TODO Phase 2: API List component */}
            <div className="em:p-4 em:text-gray-500">
              <div className="em:text-sm em:font-medium em:mb-2">API List</div>
              <div className="em:text-xs em:text-gray-400">Placeholder - will be implemented in Phase 2</div>
            </div>
          </div>

          {/* Content */}
          <div className="em:w-2/3 em:flex em:flex-col em:bg-gray-50">
            {/* TODO Phase 2: Rule Editor component */}
            <div className="em:p-4 em:text-gray-500">
              <div className="em:text-sm em:font-medium em:mb-2">Rule Editor</div>
              <div className="em:text-xs em:text-gray-400">Placeholder - will be implemented in Phase 2</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
