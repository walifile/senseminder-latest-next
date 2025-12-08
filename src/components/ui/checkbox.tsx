
// src/components/ui/checkbox.tsx
import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

import { Check } from "lucide-react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-[3px]",
      "border border-[#9CA3AF] bg-transparent",
      "dark:border-[#FFFFFF99] dark:bg-transparent",
      "data-[state=checked]:bg-[#2530F0] data-[state=checked]:border-[#2530F0] data-[state=checked]:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2530F0] focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
