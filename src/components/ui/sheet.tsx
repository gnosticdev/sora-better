import * as SheetPrimitive from '@kobalte/core/dialog'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Component, ComponentProps, JSX, ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '~/lib/utils'

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.CloseButton

const portalVariants = cva('fixed inset-0 z-50 grid', {
  variants: {
    position: {
      top: 'grid grid-rows-[auto_1fr] pb-12',
      bottom: 'grid grid-rows-[1fr_auto] pt-12',
      left: 'flex justify-start',
      right: 'flex justify-end',
    },
  },
  defaultVariants: { position: 'right' },
})

type PortalProps = SheetPrimitive.DialogPortalProps & VariantProps<typeof portalVariants>

const SheetPortal: Component<PortalProps> = (props) => {
  const [local, others] = splitProps(props, ['position', 'children'])
  return (
    <SheetPrimitive.Portal {...others}>
      <div class={portalVariants({ position: local.position })}>{local.children}</div>
    </SheetPrimitive.Portal>
  )
}

type DialogOverlayProps<T extends ValidComponent = 'div'> = SheetPrimitive.DialogOverlayProps<T> & {
  class?: string | undefined
}

const SheetOverlay = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DialogOverlayProps<T>>,
) => {
  const [local, others] = splitProps(props as DialogOverlayProps, ['class'])
  return (
    <SheetPrimitive.Overlay
      class={cn(
        'fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-[expanded=]:animate-in data-[closed=]:animate-out data-[closed=]:fade-out-0 data-[expanded=]:fade-in-0',
        local.class,
      )}
      data-slot='sheet-backdrop'
      {...others}
    />
  )
}

const sheetVariants = cva(
  'relative flex max-h-full min-h-0 w-full min-w-0 flex-col bg-popover bg-clip-padding text-popover-foreground shadow-lg transition-[opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] data-[expanded=]:animate-in data-[closed=]:animate-out data-[closed=]:opacity-0 data-[expanded=]:opacity-0 max-sm:before:hidden dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
  {
    variants: {
      position: {
        top: 'border-b data-[closed=]:-translate-y-8 data-[expanded=]:-translate-y-8',
        bottom: 'border-t data-[closed=]:translate-y-8 data-[expanded=]:translate-y-8',
        left: 'w-[calc(100%-(--spacing(12)))] max-w-md border-e data-[closed=]:-translate-x-8 data-[expanded=]:-translate-x-8',
        right:
          'w-[calc(100%-(--spacing(12)))] max-w-md border-s data-[closed=]:translate-x-8 data-[expanded=]:translate-x-8',
      },
    },
    defaultVariants: {
      position: 'right',
    },
  },
)

type DialogContentProps<T extends ValidComponent = 'div'> = SheetPrimitive.DialogContentProps<T> &
  VariantProps<typeof sheetVariants> & { class?: string | undefined; children?: JSX.Element }

const SheetContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, DialogContentProps<T>>,
) => {
  const [local, others] = splitProps(props as DialogContentProps, ['position', 'class', 'children'])
  return (
    <SheetPortal position={local.position}>
      <SheetOverlay />
      <SheetPrimitive.Content
        class={cn(
          sheetVariants({ position: local.position }),
          local.position === 'right' ? 'col-start-2' : '',
          local.class,
        )}
        data-slot='sheet-popup'
        {...others}
      >
        {local.children}
        <SheetPrimitive.CloseButton
          aria-label='Close'
          class='absolute end-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
            class='size-4'
            aria-hidden='true'
          >
            <path d='M18 6l-12 12' />
            <path d='M6 6l12 12' />
          </svg>
          <span class='sr-only'>Close</span>
        </SheetPrimitive.CloseButton>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

const SheetHeader: Component<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <div
      class={cn(
        'flex flex-col gap-2 p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pb-3 max-sm:pb-4',
        local.class,
      )}
      data-slot='sheet-header'
      {...others}
    />
  )
}

const SheetFooter: Component<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <div
      class={cn(
        'flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end border-t bg-muted/50 py-4',
        local.class,
      )}
      data-slot='sheet-footer'
      {...others}
    />
  )
}

type DialogTitleProps<T extends ValidComponent = 'h2'> = SheetPrimitive.DialogTitleProps<T> & {
  class?: string | undefined
}

const SheetTitle = <T extends ValidComponent = 'h2'>(
  props: PolymorphicProps<T, DialogTitleProps<T>>,
) => {
  const [local, others] = splitProps(props as DialogTitleProps, ['class'])
  return (
    <SheetPrimitive.Title
      class={cn('font-heading text-xl leading-none', local.class)}
      data-slot='sheet-title'
      {...others}
    />
  )
}

type DialogDescriptionProps<T extends ValidComponent = 'p'> =
  SheetPrimitive.DialogDescriptionProps<T> & { class?: string | undefined }

const SheetDescription = <T extends ValidComponent = 'p'>(
  props: PolymorphicProps<T, DialogDescriptionProps<T>>,
) => {
  const [local, others] = splitProps(props as DialogDescriptionProps, ['class'])
  return (
    <SheetPrimitive.Description
      class={cn('text-muted-foreground text-sm', local.class)}
      data-slot='sheet-description'
      {...others}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

/**
 * "use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sheet = SheetPrimitive.Root;

const SheetPortal = SheetPrimitive.Portal;

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetBackdrop({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      data-slot="sheet-backdrop"
      {...props}
    />
  );
}

function SheetViewport({
  className,
  side,
  inset = false,
  ...props
}: SheetPrimitive.Viewport.Props & {
  side?: "right" | "left" | "top" | "bottom";
  inset?: boolean;
}) {
  return (
    <SheetPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50 grid",
        side === "bottom" && "grid grid-rows-[1fr_auto] pt-12",
        side === "top" && "grid grid-rows-[auto_1fr] pb-12",
        side === "left" && "flex justify-start",
        side === "right" && "flex justify-end",
        inset && "sm:p-4",
      )}
      data-slot="sheet-viewport"
      {...props}
    />
  );
}

function SheetPopup({
  className,
  children,
  showCloseButton = true,
  side = "right",
  inset = false,
  ...props
}: SheetPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  side?: "right" | "left" | "top" | "bottom";
  inset?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <SheetViewport inset={inset} side={side}>
        <SheetPrimitive.Popup
          className={cn(
            "relative flex max-h-full min-h-0 w-full min-w-0 flex-col bg-popover bg-clip-padding text-popover-foreground shadow-lg transition-[opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:opacity-0 data-starting-style:opacity-0 max-sm:before:hidden dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]",
            side === "bottom" &&
              "row-start-2 border-t data-ending-style:translate-y-8 data-starting-style:translate-y-8",
            side === "top" &&
              "data-ending-style:-translate-y-8 data-starting-style:-translate-y-8 border-b",
            side === "left" &&
              "data-ending-style:-translate-x-8 data-starting-style:-translate-x-8 w-[calc(100%-(--spacing(12)))] max-w-md border-e",
            side === "right" &&
              "col-start-2 w-[calc(100%-(--spacing(12)))] max-w-md border-s data-ending-style:translate-x-8 data-starting-style:translate-x-8",
            inset &&
              "before:hidden sm:rounded-2xl sm:border sm:before:rounded-[calc(var(--radius-2xl)-1px)] sm:**:data-[slot=sheet-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
            className,
          )}
          data-slot="sheet-popup"
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon" variant="ghost" />}
            >
              <XIcon />
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Popup>
      </SheetViewport>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pb-3 max-sm:pb-4",
        className,
      )}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetFooter({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "bare";
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end",
        variant === "default" && "border-t bg-muted/50 py-4",
        variant === "bare" &&
          "in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pt-3 pt-4 pb-6",
        className,
      )}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      className={cn("font-heading text-xl leading-none", className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

function SheetPanel({
  className,
  scrollFade = true,
  ...props
}: React.ComponentProps<"div"> & { scrollFade?: boolean }) {
  return (
    <ScrollArea scrollFade={scrollFade}>
      <div
        className={cn(
          "px-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-1 in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-header]))]:pt-6 in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-footer]))]:pb-6! in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-footer].border-t))]:pb-1 pb-6",
          className,
        )}
        data-slot="sheet-panel"
        {...props}
      />
    </ScrollArea>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetPortal,
  SheetClose,
  SheetBackdrop,
  SheetBackdrop as SheetOverlay,
  SheetPopup,
  SheetPopup as SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetPanel,
};

 */
