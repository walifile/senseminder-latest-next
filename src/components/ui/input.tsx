import * as React from "react";

import { cn } from "@/lib/utils";

type UiInputSize = "sm" | "md" | "lg" | "form";
type InputIntent = "default" | "error";
type InputVariant = "default" | "auth" | "glowing";

export interface InputProps extends React.ComponentProps<"input"> {
  uiSize?: UiInputSize;
  intent?: InputIntent;
  variant?: InputVariant;
  wrapperClassName?: string;
}

const uiSizeClasses: Record<UiInputSize, string> = {
  sm: "h-9 rounded-md text-sm",
  md: "h-10 rounded-md text-base file:text-sm md:text-sm",
  lg: "min-h-[60px] rounded-[10px] text-base md:text-base",
  form: "h-[52px] rounded-[10px] text-[16px] md:text-[16px]",
};

const intentClasses: Record<InputIntent, string> = {
  default: "focus-visible:border-input-focus",
  error:
    "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
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
            "bg-input-surface dark:bg-input-surface-dark",
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
                "before:bg-input-glow",
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
              "text-slate-900 placeholder:text-input-placeholder",
              "dark:text-white dark:placeholder:text-input-placeholder-dark",
              isError &&
                "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-0",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    const shouldApplySize = variant !== "auth";

    const variantClasses =
      variant === "auth"
        ? cn(
            "min-h-[54px] rounded-[8px] px-[20px] py-[15px]",
            "bg-input-surface text-slate-900 placeholder:text-input-placeholder",
            "dark:bg-input-surface-dark dark:text-white dark:placeholder:text-input-placeholder-dark",
            "border border-transparent focus-visible:outline-none"
          )
        : cn(
            "border border-input-border-brand/20 bg-input-surface text-slate-900 placeholder:text-slate-400",
            "dark:border-input-border-dark dark:bg-input-bg-dark dark:text-white dark:placeholder:text-slate-300",
            "focus-visible:outline-none"
          );

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          baseInputClasses,
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
