

// src/components/ui/input-otp.tsx
import * as React from "react";

import { cn } from "@/lib/utils";

import { Dot } from "lucide-react";
import { OTPInput, OTPInputContext } from "input-otp";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    // Outer visible Figma-style box
    containerClassName={cn(
      "flex items-center justify-center has-[:disabled]:opacity-50",
      // Figma container size + shape
      "w-[420px] max-w-full h-[56px]",
      "rounded-[12px] border-[1.4px] border-[#8086F3]",
      "bg-[rgba(37,48,240,0.07)]",
      // clip inner cells so outer corners are curved
      "overflow-hidden",
      containerClassName
    )}
    // inner root – just takes full space; layout is done by Group
    className={cn(
      "w-full h-full disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 6 equal cells with separators between them
      "grid w-full h-full grid-cols-6 divide-x divide-[#8086F3]",
      className
    )}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        // each digit cell: equal width via grid, centered content
        "relative flex items-center justify-center h-full",
        // text styling
        "text-[15.7px] leading-[24px] font-medium",
        "text-[#454545] dark:text-white",
        "transition-colors",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPSlot, InputOTPGroup, InputOTPSeparator };
