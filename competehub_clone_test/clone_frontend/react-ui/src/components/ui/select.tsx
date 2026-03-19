import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

const Select = ({ value, onValueChange, children, placeholder, className }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [label, setLabel] = React.useState<string>('')

  // Find label from children
  React.useEffect(() => {
    const items = React.Children.toArray(children)
    for (const item of items) {
      if (React.isValidElement(item) && (item as React.ReactElement<SelectContentProps>).type === SelectContent) {
        const content = (item as React.ReactElement<SelectContentProps>).props.children
        const allItems = React.Children.toArray(content as React.ReactNode)
        for (const i of allItems) {
          if (React.isValidElement(i) && (i as React.ReactElement<SelectItemProps>).props.value === value) {
            setLabel(String((i as React.ReactElement<SelectItemProps>).props.children))
          }
        }
      }
    }
  }, [value, children])

  return (
    <div className={cn("relative", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        if ((child as React.ReactElement<SelectTriggerProps>).type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<SelectTriggerProps>, {
            onClick: () => setOpen(!open),
            displayValue: label || value || placeholder,
          })
        }
        if ((child as React.ReactElement<SelectContentProps>).type === SelectContent) {
          return React.cloneElement(child as React.ReactElement<SelectContentProps>, {
            open,
            onSelect: (v: string, l: string) => {
              onValueChange?.(v)
              setLabel(l)
              setOpen(false)
            },
          })
        }
        return child
      })}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}

interface SelectTriggerProps extends React.ComponentProps<"button"> {
  displayValue?: string
}

const SelectTrigger = ({ className, displayValue, children, onClick, ...props }: SelectTriggerProps) => (
  <button
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-input px-3 py-2 text-sm",
      "text-foreground placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200",
      className
    )}
    onClick={onClick}
    {...props}
  >
    <span className={displayValue ? "text-foreground" : "text-muted-foreground"}>
      {displayValue || (children as React.ReactNode)}
    </span>
    <ChevronDown className="h-4 w-4 text-muted-foreground" />
  </button>
)

interface SelectContentProps {
  open?: boolean
  onSelect?: (value: string, label: string) => void
  children?: React.ReactNode
  className?: string
}

const SelectContent = ({ open, onSelect, children, className }: SelectContentProps) => {
  if (!open) return null
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg",
        "animate-fade-in-up",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-60 overflow-auto p-1">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child
          return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
            onSelect,
          })
        })}
      </div>
    </div>
  )
}

interface SelectItemProps {
  value: string
  children?: React.ReactNode
  onSelect?: (value: string, label: string) => void
  className?: string
}

const SelectItem = ({ value, children, onSelect, className }: SelectItemProps) => (
  <button
    type="button"
    className={cn(
      "flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground",
      "cursor-pointer transition-colors hover:bg-muted",
      "focus:bg-muted focus:outline-none",
      className
    )}
    onClick={() => onSelect?.(value, String(children))}
  >
    {children}
  </button>
)

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground">{placeholder}</span>
)

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
