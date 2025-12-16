

import * as React from "react";

import { cn } from "@/lib/utils";

type UiInputSize = "sm" | "md" | "lg" | "form";
type InputIntent = "default" | "error";

/**
 * default: existing app input
 * auth: auth flows (forgot password / reset password) from Figma nodes:
 *  - dark: 51389:14109
 *  - light: 51389:52857
 *
 * glowing: gradient border only (wrapper + mask) from Figma border colors:
 *  - #8086F3 → #4C55F8 → #D971FF
 */
type InputVariant = "default" | "auth" | "glowing";

export interface InputProps extends React.ComponentProps<"input"> {
  uiSize?: UiInputSize; // ✅ no conflict with native HTML `size`
  intent?: InputIntent;
  variant?: InputVariant;

  /** Only used for variants that render a wrapper (currently: glowing) */
  wrapperClassName?: string;
}

const uiSizeClasses: Record<UiInputSize, string> = {
  sm: "h-9 rounded-md text-sm",
  md: "h-10 rounded-md text-base file:text-sm md:text-sm",
  lg: "min-h-[60px] rounded-[10px] text-base md:text-base",
  form: "h-[52px] rounded-[10px] text-[16px] md:text-[16px]",
};

const intentClasses: Record<InputIntent, string> = {
  default: "focus-visible:border-[#5f4bf6]",
  error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
};

const baseInputClasses = cn(
  "flex w-full",
  "file:border-0 file:bg-transparent file:font-medium file:text-foreground",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:outline-none"
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      type,
      uiSize = "md",
      intent = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    if (variant === "glowing") {
      const isError = intent === "error";

      return (
        <div
          className={cn(
            "relative w-full rounded-[8px]",
            "bg-[#F4F1FF] dark:bg-[#2A2067]",
            isError && "border border-red-500",
            wrapperClassName
          )}
        >
          {!isError && (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-[8px]",
                "before:content-[''] before:absolute before:inset-0",
                "before:p-px before:rounded-[8px]",
                "before:[background:linear-gradient(135deg,#8086F3,#4C55F8,#D971FF)]",
                "before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
                "before:[-webkit-mask-composite:xor]",
                "before:[mask-composite:exclude]"
              )}
            />
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              baseInputClasses,
              "relative z-[2] border-none bg-transparent",
              "min-h-[54px] rounded-[8px] px-[20px] py-[15px]",
              "text-slate-900 placeholder:text-[#454545]",
              "dark:text-white dark:placeholder:text-[#B9C2D5]",
              isError &&
                "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-0",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    const shouldApplySize = variant !== "auth"; // auth defines its own size/padding

    const variantClasses =
      variant === "auth"
        ? cn(
            "min-h-[54px] rounded-[8px] px-[20px] py-[15px]",
            "bg-[#F4F1FF] text-slate-900 placeholder:text-[#454545]",
            "dark:bg-[#2A2067] dark:text-white dark:placeholder:text-[#B9C2D5]",
            "border border-transparent focus-visible:outline-none"
          )
        : cn(
            "border border-[#2530F0]/20 bg-[#F4F1FF] text-slate-900 placeholder:text-slate-400",
            "dark:border-[#ffffff1a] dark:bg-[#ffffff0f] dark:text-white dark:placeholder:text-slate-300",
            "focus-visible:outline-none"
          );

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          baseInputClasses,
          // default spacing baseline (auth overrides with px/py)
          "px-3 py-2",
          shouldApplySize && uiSizeClasses[uiSize],
          variantClasses,
          intentClasses[intent],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
