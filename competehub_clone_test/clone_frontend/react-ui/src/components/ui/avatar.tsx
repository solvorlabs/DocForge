import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-2xl",
  xl: "h-20 w-20 text-3xl",
}

const Avatar = ({ className, size = "md", ...props }: AvatarProps) => (
  <div
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full",
      sizeClasses[size],
      className
    )}
    {...props}
  />
)

const AvatarImage = ({ className, ...props }: React.ComponentProps<"img">) => (
  <img
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
)

interface AvatarFallbackProps extends React.ComponentProps<"div"> {
  emoji?: string
}

const AvatarFallback = ({ className, emoji, children, ...props }: AvatarFallbackProps) => (
  <div
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600",
      className
    )}
    {...props}
  >
    {emoji || children}
  </div>
)

export { Avatar, AvatarImage, AvatarFallback }
