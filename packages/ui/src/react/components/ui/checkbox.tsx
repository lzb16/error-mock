import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "em:peer em:size-4 em:shrink-0 em:rounded-sm em:border em:border-input em:bg-background em:shadow-xs em:transition-[color,box-shadow] em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:ring-[3px] em:focus-visible:outline-none em:disabled:cursor-not-allowed em:disabled:opacity-50 em:data-[state=checked]:border-primary em:data-[state=checked]:bg-primary em:data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="em:flex em:items-center em:justify-center"
      >
        <Check className="em:size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

