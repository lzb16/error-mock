import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "em:flex em:h-9 em:w-full em:rounded-md em:border em:border-input em:bg-transparent em:px-3 em:py-1 em:text-sm em:shadow-xs em:transition-[color,box-shadow] em:file:border-0 em:file:bg-transparent em:file:text-sm em:file:font-medium em:placeholder:text-muted-foreground em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:ring-[3px] em:focus-visible:outline-none em:disabled:cursor-not-allowed em:disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }

