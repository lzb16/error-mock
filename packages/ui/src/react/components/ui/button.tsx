import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "em:inline-flex em:items-center em:justify-center em:gap-2 em:whitespace-nowrap em:rounded-md em:text-sm em:font-medium em:transition-all em:disabled:pointer-events-none em:disabled:opacity-50 em:[&_svg]:pointer-events-none em:[&_svg:not([class*=size-])]:size-4 em:shrink-0 em:[&_svg]:shrink-0 em:outline-none em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:ring-[3px] em:aria-invalid:ring-destructive/20 em:dark:aria-invalid:ring-destructive/40 em:aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "em:bg-primary em:text-primary-foreground em:hover:bg-primary/90",
        destructive:
          "em:bg-destructive em:text-white em:hover:bg-destructive/90 em:focus-visible:ring-destructive/20 em:dark:focus-visible:ring-destructive/40 em:dark:bg-destructive/60",
        outline:
          "em:border em:bg-background em:shadow-xs em:hover:bg-accent em:hover:text-accent-foreground em:dark:bg-input/30 em:dark:border-input em:dark:hover:bg-input/50",
        secondary:
          "em:bg-secondary em:text-secondary-foreground em:hover:bg-secondary/80",
        ghost:
          "em:hover:bg-accent em:hover:text-accent-foreground em:dark:hover:bg-accent/50",
        link: "em:text-primary em:underline-offset-4 em:hover:underline",
      },
      size: {
        default: "em:h-9 em:px-4 em:py-2 em:has-[>svg]:px-3",
        sm: "em:h-8 em:rounded-md em:gap-1.5 em:px-3 em:has-[>svg]:px-2.5",
        lg: "em:h-10 em:rounded-md em:px-6 em:has-[>svg]:px-4",
        icon: "em:size-9",
        "icon-sm": "em:size-8",
        "icon-lg": "em:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
