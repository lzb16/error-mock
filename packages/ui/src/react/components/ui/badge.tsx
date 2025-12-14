import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "em:inline-flex em:items-center em:rounded-md em:border em:px-2 em:py-0.5 em:text-xs em:font-medium em:transition-colors em:focus:outline-none em:focus:ring-2 em:focus:ring-ring em:focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "em:border-transparent em:bg-primary em:text-primary-foreground em:shadow-xs",
        secondary:
          "em:border-transparent em:bg-secondary em:text-secondary-foreground",
        outline: "em:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

