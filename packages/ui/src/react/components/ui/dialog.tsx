import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePortalContainer } from "@/context/ShadowRootContext"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  container,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal> & {
  container?: HTMLElement | null
}) {
  const defaultContainer = usePortalContainer()
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      container={container ?? defaultContainer}
      {...props}
    />
  )
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "em:data-[state=open]:animate-in em:data-[state=closed]:animate-out em:data-[state=closed]:fade-out-0 em:data-[state=open]:fade-in-0 em:fixed em:inset-0 em:z-50 em:bg-black/30 em:backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "em:bg-background em:data-[state=open]:animate-in em:data-[state=closed]:animate-out em:data-[state=closed]:fade-out-0 em:data-[state=open]:fade-in-0 em:data-[state=closed]:zoom-out-95 em:data-[state=open]:zoom-in-95 em:fixed em:top-[50%] em:left-[50%] em:z-50 em:grid em:w-full em:max-w-[calc(100%-2rem)] em:translate-x-[-50%] em:translate-y-[-50%] em:gap-4 em:rounded-lg em:border em:p-6 em:shadow-lg em:duration-200 em:sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="em:ring-offset-background em:focus:ring-ring em:data-[state=open]:bg-accent em:data-[state=open]:text-muted-foreground em:absolute em:top-4 em:right-4 em:rounded-xs em:opacity-70 em:transition-opacity em:hover:opacity-100 em:focus:ring-2 em:focus:ring-offset-2 em:focus:outline-hidden em:disabled:pointer-events-none em:[&_svg]:pointer-events-none em:[&_svg]:shrink-0 em:[&_svg:not([class*=size-])]:size-4"
          >
            <XIcon />
            <span className="em:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("em:flex em:flex-col em:gap-2 em:text-center em:sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "em:flex em:flex-col-reverse em:gap-2 em:sm:flex-row em:sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("em:text-lg em:leading-none em:font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("em:text-muted-foreground em:text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
