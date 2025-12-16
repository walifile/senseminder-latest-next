
import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full rounded-md px-3 py-2 text-base md:text-sm",
      "border border-[#2530F0]/20 bg-[#F4F1FF] text-slate-900 placeholder:text-slate-400",
      "dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:placeholder:text-slate-300",
      "focus-visible:outline-none focus-visible:border-[#5f4bf6]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "min-h-[150px] resize-none",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };
