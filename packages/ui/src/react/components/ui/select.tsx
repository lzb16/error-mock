import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePortalContainer } from "@/context/ShadowRootContext"

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "em:flex em:h-9 em:w-full em:items-center em:justify-between em:rounded-md em:border em:border-input em:bg-transparent em:px-3 em:py-2 em:text-sm em:shadow-xs em:transition-[color,box-shadow] em:placeholder:text-muted-foreground em:focus-visible:border-ring em:focus-visible:ring-ring/50 em:focus-visible:ring-[3px] em:focus-visible:outline-none em:disabled:cursor-not-allowed em:disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="em:size-4 em:opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "em:flex em:cursor-default em:items-center em:justify-center em:py-1",
        className
      )}
      {...props}
    >
      <ChevronUp className="em:size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "em:flex em:cursor-default em:items-center em:justify-center em:py-1",
        className
      )}
      {...props}
    >
      <ChevronDown className="em:size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

function SelectContent({
  className,
  children,
  container,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  container?: HTMLElement | null
}) {
  const defaultContainer = usePortalContainer()

  return (
    <SelectPrimitive.Portal container={container ?? defaultContainer}>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "em:bg-popover em:text-popover-foreground em:relative em:z-50 em:max-h-96 em:min-w-[8rem] em:overflow-hidden em:rounded-md em:border em:shadow-md em:data-[state=open]:animate-in em:data-[state=closed]:animate-out em:data-[state=closed]:fade-out-0 em:data-[state=open]:fade-in-0 em:data-[state=closed]:zoom-out-95 em:data-[state=open]:zoom-in-95 em:data-[side=bottom]:slide-in-from-top-2 em:data-[side=left]:slide-in-from-right-2 em:data-[side=right]:slide-in-from-left-2 em:data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "em:data-[side=bottom]:translate-y-1 em:data-[side=left]:-translate-x-1 em:data-[side=right]:translate-x-1 em:data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-slot="select-viewport"
          className={cn(
            "em:p-1",
            position === "popper" &&
              "em:h-[var(--radix-select-trigger-height)] em:w-full em:min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("em:px-2 em:py-1.5 em:text-xs em:font-semibold", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "em:relative em:flex em:w-full em:cursor-default em:select-none em:items-center em:rounded-sm em:py-1.5 em:pl-2 em:pr-8 em:text-sm em:outline-none em:focus:bg-accent em:focus:text-accent-foreground em:data-[disabled]:pointer-events-none em:data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="em:absolute em:right-2 em:flex em:size-3.5 em:items-center em:justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="em:size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("em:-mx-1 em:my-1 em:h-px em:bg-muted", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
