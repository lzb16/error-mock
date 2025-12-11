import { useState, useEffect } from 'react';
import type { ApiMeta } from '@error-mock/core';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { FloatButton } from '@/components/FloatButton';
import { useRulesStore } from '@/stores/useRulesStore';

export interface AppProps {
  metas: ApiMeta[];
}

export function App({ metas }: AppProps) {
  const [count, setCount] = useState(0);
  const { setApiMetas, loadRules } = useRulesStore();

  // Initialize stores on mount
  useEffect(() => {
    setApiMetas(metas);
    loadRules();
  }, [metas, setApiMetas, loadRules]);

  return (
    <>
      <FloatButton />
      <div className="em:p-4 em:space-y-4 em:font-sans">
      <div className="em:text-lg em:font-bold em:text-foreground">
        React + Shadow DOM + Tailwind v4 Smoke Test
      </div>

      <div className="em:text-sm em:text-muted-foreground">
        Metas loaded: {metas.length}
      </div>

      <div className="em:flex em:gap-4 em:items-center em:flex-wrap">
        <Button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </Button>

        <Button variant="outline">Outline Button</Button>

        <Button variant="secondary">Secondary</Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shadow DOM Dialog Test</DialogTitle>
              <DialogDescription>
                This dialog renders inside the Shadow Root via portal, isolated from host styles.
              </DialogDescription>
            </DialogHeader>
            <div className="em:py-4">
              <p className="em:text-sm em:text-muted-foreground">
                If you can see this content properly styled with Tailwind v4 + OKLCH colors,
                the Shadow DOM portal is working correctly.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="em:mt-4 em:p-4 em:bg-muted em:rounded-lg">
        <div className="em:text-sm em:font-medium em:text-foreground">Style Isolation Test</div>
        <p className="em:text-xs em:text-muted-foreground em:mt-2">
          This box should have proper colors and spacing regardless of host page styles.
        </p>
      </div>
      </div>
    </>
  );
}
