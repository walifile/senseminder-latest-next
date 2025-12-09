import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
        "border border-[#2530F0]/20 bg-[#F4F1FF] text-slate-900 placeholder:text-slate-400",
        "dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:placeholder:text-slate-300",
        "focus-visible:outline-none focus-visible:border-[#5f4bf6]",
        "disabled:cursor-not-allowed disabled:opacity-50",

        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };