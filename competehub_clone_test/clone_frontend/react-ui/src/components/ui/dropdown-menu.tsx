import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownContextType {
  open: boolean
  setOpen: (v: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType>({ open: false, setOpen: () => {} })

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
        {open && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownMenuTrigger = ({ children, asChild: _asChild, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) => {
  const { setOpen, open } = React.useContext(DropdownContext)
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
      {...props}
    >
      {children}
    </button>
  )
}

const DropdownMenuContent = ({ className, align = "end", children, ...props }: React.ComponentProps<"div"> & { align?: "start" | "end" | "center" }) => {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg",
        "animate-fade-in-up",
        align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ className, ...props }: React.ComponentProps<"button">) => {
  const { setOpen } = React.useContext(DropdownContext)
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground",
        "cursor-pointer transition-colors hover:bg-muted hover:text-foreground",
        "focus:bg-muted focus:outline-none",
        className
      )}
      onClick={(e) => { props.onClick?.(e); setOpen(false) }}
      {...props}
    />
  )
}

const DropdownMenuSeparator = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("my-1 h-px bg-border", className)} {...props} />
)

const DropdownMenuLabel = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />
)

export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel
}
