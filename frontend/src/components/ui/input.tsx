import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200",
        "placeholder:text-gray-400",
        "hover:border-gray-400",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60",
        "aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        "dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-500",
        "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
        "dark:aria-invalid:border-red-400 dark:aria-invalid:ring-red-400/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
