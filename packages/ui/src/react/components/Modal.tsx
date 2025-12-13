import { useConfigStore } from '@/stores/useConfigStore';
import { WandSparkles } from 'lucide-react';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApiList } from './ApiList';
import { RuleEditor } from './RuleEditor';
import { NetworkProfileSelect } from './modal/NetworkProfileSelect';

export function Modal() {
  const { isModalOpen, setModalOpen } = useConfigStore();

  // Lock page scroll while modal is open (Shadow DOM-safe; avoids react-remove-scroll wheel issues)
  useEffect(() => {
    if (!isModalOpen) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isModalOpen]);

  // Prevent closing on outside click to avoid data loss
  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent
        className="em:w-11/12 em:max-w-7xl em:h-5/6 em:max-h-[90vh] em:p-0 em:gap-0 em:flex em:flex-col em:overflow-hidden em:min-h-0"
        aria-describedby={undefined}
        onPointerDownOutside={handleInteractOutside}
        onInteractOutside={handleInteractOutside}
      >
        {/* Header with integrated close button */}
        <DialogHeader
          showCloseButton
          className="em:px-6 em:py-4 em:border-b em:border-gray-200 em:bg-gradient-to-r em:from-blue-50 em:to-indigo-50 em:space-y-0"
        >
          <div className="em:flex em:items-center em:justify-between em:gap-4">
            <div className="em:flex em:items-center em:gap-2">
              <WandSparkles className="em:w-6 em:h-6 em:text-blue-600" />
              <DialogTitle className="em:text-xl em:font-bold em:text-gray-800">
                Error Mock Control Panel
              </DialogTitle>
            </div>
            <NetworkProfileSelect />
          </div>
        </DialogHeader>

        {/* Body: Sidebar + Content */}
        <div className="em:flex em:flex-1 em:overflow-hidden em:min-h-0">
          {/* Sidebar */}
          <div className="em:w-1/3 em:min-w-[320px] em:flex em:flex-col">
            <ApiList />
          </div>

          {/* Content */}
          <div className="em:w-2/3 em:flex em:flex-col em:bg-gray-50 em:min-h-0">
            <RuleEditor />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
