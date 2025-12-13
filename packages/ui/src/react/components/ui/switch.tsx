import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "em:peer em:data-[state=checked]:bg-primary em:data-[state=unchecked]:bg-input em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:dark:data-[state=unchecked]:bg-input/80 em:inline-flex em:h-[1.15rem] em:w-8 em:shrink-0 em:items-center em:rounded-full em:border em:border-transparent em:shadow-xs em:transition-all em:outline-none em:focus-visible:ring-[3px] em:disabled:cursor-not-allowed em:disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "em:bg-background em:dark:data-[state=unchecked]:bg-foreground em:dark:data-[state=checked]:bg-primary-foreground em:pointer-events-none em:block em:size-4 em:rounded-full em:ring-0 em:transition-transform em:data-[state=checked]:translate-x-[calc(100%-2px)] em:data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
