import * as React from "react";

import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-blue-700/10 dark:bg-[#2A2067]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-l from-fuchsia-700 to-blue-700 rounded-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-2 w-2 rounded-full bg-transparent transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
