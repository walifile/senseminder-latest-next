// src/components/ui/checkbox.tsx
import * as React from "react";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

import { Check } from "lucide-react";

type CheckboxVariant = "default" | "billing";
type CheckboxSize = "sm" | "md"; // optional but future-proof

type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  variant?: CheckboxVariant;
  size?: CheckboxSize;
};

const ROOT_BASE =
  "peer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

const INDICATOR_BASE = "flex items-center justify-center text-current";

const VARIANT_ROOT: Record<CheckboxVariant, string> = {
  default: cn(
    "h-4 w-4 rounded-[3px]",
    "border border-[#9CA3AF] bg-transparent",
    "dark:border-white",
    "data-[state=checked]:bg-[#2530F0] data-[state=checked]:border-[#2530F0] dark:data-[state=checked]:border-[#2530F0] data-[state=checked]:text-white",
    "focus-visible:ring-[#2530F0]"
  ),
  billing: cn(
    "h-4 w-4 rounded-[3px]",
    "bg-transparent",
    "border-2 border-[#020816]/40 dark:border-white/60",
    "data-[state=checked]:bg-transparent data-[state=checked]:border-[#020816] dark:data-[state=checked]:border-white",
    "text-[#020816] dark:text-white",
    "focus-visible:ring-[#020816] dark:focus-visible:ring-white"
  ),
};

const SIZE_ROOT: Record<CheckboxSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5 rounded-[6px] p-[2px]",
};

const ICON_CLASS: Record<CheckboxSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
};

const ICON_STROKE: Record<CheckboxVariant, number> = {
  default: 3,
  billing: 4,
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = "default", size = "sm", ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        ROOT_BASE,
        VARIANT_ROOT[variant],
        size === "md" && SIZE_ROOT.md,
        size === "sm" && SIZE_ROOT.sm,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={INDICATOR_BASE}>
        <Check
          className={ICON_CLASS[size]}
          strokeWidth={ICON_STROKE[variant]}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
