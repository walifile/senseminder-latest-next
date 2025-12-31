import * as React from "react";

import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

// Root classes (Radix root wrapper). We keep cva for consistency with shadcn style.
const sliderRoot = cva("relative flex w-full touch-none select-none items-center", {
  variants: {
    variant: {
      default: "",
      blue: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type SliderVariant = NonNullable<VariantProps<typeof sliderRoot>["variant"]>;

// Track/Range/Thumb classes per variant
const sliderParts: Record<
  SliderVariant,
  { track: string; range: string; thumb: string }
> = {
  default: {
    track:
      "relative h-2 w-full grow overflow-hidden rounded-full bg-blue-700/10 dark:bg-[#2A2067]",
    range:
      "absolute h-full rounded-full bg-gradient-to-l from-fuchsia-700 to-blue-700",
    thumb:
      "block h-2 w-2 rounded-full bg-transparent transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50",
  },
  blue: {
    track:
      "relative h-2 w-full grow overflow-hidden rounded-full bg-blue-600/20 dark:bg-blue-500/20",
    range: "absolute h-full rounded-full bg-blue-600",
    thumb:
      "block h-5 w-5 rounded-full bg-blue-600 transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50",
  },
};

// IMPORTANT: Define our own props so `variant` is NOT `null`.
type SliderProps = Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "variant"
> & {
  variant?: SliderVariant;
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => {
  const parts = sliderParts[variant];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(sliderRoot({ variant }), className)}
      {...props}
    >
      <SliderPrimitive.Track className={parts.track}>
        <SliderPrimitive.Range className={parts.range} />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb className={parts.thumb} />
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
