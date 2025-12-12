import { useConfigStore } from '@/stores/useConfigStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ApiList } from './ApiList';
import { RuleEditor } from './RuleEditor';

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
            <DialogTitle className="em:text-xl em:font-bold em:text-gray-800">
              Error Mock Control Panel
            </DialogTitle>
          </div>

          {/* Close Button - Custom positioned in Header for perfect alignment */}
          <DialogClose asChild>
            <button
              className="em:rounded-sm em:opacity-70 em:transition-opacity hover:em:opacity-100 focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:ring-offset-2"
              aria-label="Close"
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
          </DialogClose>
        </DialogHeader>

        {/* Body: Sidebar + Content */}
        <div className="em:flex em:flex-1 em:overflow-hidden">
          {/* Sidebar */}
          <div className="em:w-1/3 em:min-w-[320px] em:flex em:flex-col">
            <ApiList />
          </div>

          {/* Content */}
          <div className="em:w-2/3 em:flex em:flex-col em:bg-gray-50">
            <RuleEditor />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
