import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "em:relative em:w-full em:rounded-lg em:border em:px-4 em:py-3 em:text-sm em:[&>svg+div]:translate-y-[-3px] em:[&>svg]:absolute em:[&>svg]:left-4 em:[&>svg]:top-4 em:[&>svg]:text-foreground em:[&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "em:bg-background em:text-foreground",
        destructive:
          "em:border-destructive/50 em:text-destructive em:dark:border-destructive em:[&>svg]:text-destructive",
        warning:
          "em:border-yellow-200 em:bg-yellow-50 em:text-yellow-900 em:[&>svg]:text-yellow-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("em:mb-1 em:font-medium em:leading-none", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("em:text-sm em:[&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }

