import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "em:flex em:min-h-[80px] em:w-full em:rounded-md em:border em:border-input em:bg-transparent em:px-3 em:py-2 em:text-sm em:shadow-xs em:transition-[color,box-shadow] em:placeholder:text-muted-foreground em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:ring-[3px] em:focus-visible:outline-none em:disabled:cursor-not-allowed em:disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

