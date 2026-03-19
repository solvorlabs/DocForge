import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  )
}

const DialogContent = ({ className, children, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "relative z-50 w-full max-w-lg mx-4 rounded-2xl border border-border bg-card shadow-2xl",
      "animate-fade-in-up",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: React.ComponentProps<"h2">) => (
  <h2 className={cn("text-xl font-semibold text-foreground", className)} {...props} />
)

const DialogDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex justify-end gap-3 p-6 pt-4", className)} {...props} />
)

interface DialogCloseProps extends React.ComponentProps<"button"> {
  onClose?: () => void
}
const DialogClose = ({ className, onClose, ...props }: DialogCloseProps) => (
  <button
    className={cn(
      "absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
      className
    )}
    onClick={onClose}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose }
