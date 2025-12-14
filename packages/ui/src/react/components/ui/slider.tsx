import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "em:relative em:flex em:w-full em:touch-none em:select-none em:items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="em:relative em:h-2 em:w-full em:grow em:overflow-hidden em:rounded-full em:bg-muted"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="em:absolute em:h-full em:bg-primary"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="em:block em:size-4 em:rounded-full em:border em:border-primary/50 em:bg-background em:shadow-xs em:transition-[color,box-shadow] em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:ring-[3px] em:focus-visible:outline-none em:disabled:pointer-events-none em:disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
