import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePortalContainer } from "@/context/ShadowRootContext"
import { useI18n } from "@/i18n"

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
  style,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    /**
     * Avoid Radix `DialogPrimitive.Overlay` because it wraps `react-remove-scroll`.
     *
     * In Shadow DOM, `react-remove-scroll` relies on `event.target` containment checks
     * against `shards`. Because `event.target` is retargeted to the shadow host at the
     * document listener, wheel scrolling inside the dialog can be incorrectly blocked.
     *
     * We implement the backdrop as a plain element and lock scroll manually.
     */
    <div
      data-slot="dialog-overlay"
      data-state="open"
      className={cn(
        "em:fixed em:inset-0 em:z-50 em:bg-black/30 em:backdrop-blur-sm em:animate-in em:fade-in-0",
        className
      )}
      style={{ ...style, pointerEvents: "auto" }}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = false, // Change default to false, let DialogHeader handle it
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const { t } = useI18n()

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "em:bg-background em:data-[state=open]:animate-in em:data-[state=closed]:animate-out em:data-[state=closed]:fade-out-0 em:data-[state=open]:fade-in-0 em:data-[state=closed]:zoom-out-95 em:data-[state=open]:zoom-in-95 em:fixed em:top-[50%] em:left-[50%] em:z-50 em:grid em:w-full em:translate-x-[-50%] em:translate-y-[-50%] em:gap-4 em:rounded-lg em:border em:p-6 em:shadow-lg em:duration-200",
          className
        )}
        {...props}
      >
        {children}
        {/* Only show absolute-positioned close button if explicitly enabled */}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="em:ring-offset-background em:focus:ring-ring em:data-[state=open]:bg-accent em:data-[state=open]:text-muted-foreground em:absolute em:top-4 em:right-4 em:rounded-xs em:opacity-70 em:transition-opacity em:hover:opacity-100 em:focus:ring-2 em:focus:ring-offset-2 em:focus:outline-hidden em:disabled:pointer-events-none em:[&_svg]:pointer-events-none em:[&_svg]:shrink-0 em:[&_svg:not([class*=size-])]:size-4"
          >
            <X />
            <span className="em:sr-only">{t('common.close')}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const { t } = useI18n()

  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "em:flex em:gap-2",
        showCloseButton ? "em:flex-row em:items-center em:justify-between" : "em:flex-col em:text-center em:sm:text-left",
        className
      )}
      {...props}
    >
      {props.children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <button
            className="em:rounded-sm em:opacity-70 em:transition-opacity hover:em:opacity-100 focus:em:outline-none focus:em:ring-2 focus:em:ring-blue-500 focus:em:ring-offset-2"
            aria-label={t('common.close')}
            type="button"
          >
            <X className="em:w-5 em:h-5 em:text-gray-600" />
          </button>
        </DialogPrimitive.Close>
      )}
    </div>
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
