import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("em:flex em:flex-col em:gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "em:bg-muted em:text-muted-foreground em:inline-flex em:h-9 em:w-fit em:items-center em:justify-center em:rounded-lg em:p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "em:data-[state=active]:bg-background em:dark:data-[state=active]:text-foreground em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:outline-ring em:dark:data-[state=active]:border-input em:dark:data-[state=active]:bg-input/30 em:text-foreground em:dark:text-muted-foreground em:inline-flex em:h-[calc(100%-1px)] em:flex-1 em:items-center em:justify-center em:gap-1.5 em:rounded-md em:border em:border-transparent em:px-2 em:py-1 em:text-sm em:font-medium em:whitespace-nowrap em:transition-[color,box-shadow] em:focus-visible:ring-[3px] em:focus-visible:outline-1 em:disabled:pointer-events-none em:disabled:opacity-50 em:data-[state=active]:shadow-sm em:[&_svg]:pointer-events-none em:[&_svg]:shrink-0 em:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("em:flex-1 em:outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
