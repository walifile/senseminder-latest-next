


import type { ElementType } from "react";

import React, { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Controller, useFormContext } from "react-hook-form";

import { Info } from "lucide-react";

// ✅ Reuse Input's prop types (no re-defining unions)
type UiInputSize = NonNullable<React.ComponentProps<typeof Input>["uiSize"]>;
type InputIntent = NonNullable<React.ComponentProps<typeof Input>["intent"]>;
type InputVariant = NonNullable<React.ComponentProps<typeof Input>["variant"]>;

export interface RHFTextProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  helperText?: string;
  tooltipText?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  icon?: ElementType;
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;

  className?: string;
  labelClassName?: string;
  inputClassName?: string;

  rows?: number;
  maxLength?: number;
  minLength?: number;
  onChange?: (value: string) => void;
  inputVariant?: InputVariant; // "default" | "auth" | "glowing"
  inputUiSize?: UiInputSize; // "sm" | "md" | "lg" | "form"
  inputIntent?: InputIntent; // "default" | "error"
  inputWrapperClassName?: string; // useful for variant="glowing"
  inputTestId?: string;

}

export const RHFText = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  RHFTextProps
>(
  (
    {
      name,
      label,
      description,
      placeholder,
      helperText,
      tooltipText,
      type = "text",
      icon: Icon,
      multiline = false,
      disabled = false,
      required = false,
      className,
      labelClassName,
      inputClassName,
      rows = 4,
      maxLength,
      minLength,
      onChange,

      inputVariant = "default",
      inputUiSize = "md",
      inputIntent,
      inputWrapperClassName,
      inputTestId,
    },
    ref
  ) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const hasError = !!error;

          const resolvedIntent: InputIntent =
            inputIntent ?? (hasError ? "error" : "default");

          const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            const value = e.target.value;
            if (onChange) onChange(value);
            else field.onChange(value);
          };

          // ✅ Only apply legacy RHF styles when using default input variant.
          // For auth/glowing, let the Input component own the look.
          const legacyInputClasses =
            inputVariant === "default"
              ? cn(
                  "h-11 border-0 outline outline-1 outline-offset-[-1px] outline-blue-700/10 dark:outline-white/20",
                  "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none ring-offset-background",
                  "bg-blue-700/5 dark:bg-white/5 rounded-[10px]"
                )
              : undefined;

          return (
            <div className={cn("flex flex-col gap-2", className)}>
              {(label || description) && (
                <div className="flex items-center justify-between">
                  <div>
                    {label && (
                      <Label
                        htmlFor={name}
                        className={cn(hasError && "text-red-500", labelClassName)}
                      >
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                      </Label>
                    )}

                    {description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>

                  {tooltipText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}

              <div className="relative">
                {Icon && (
                  <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}

                {multiline ? (
                  <Textarea
                    ref={ref as React.RefObject<HTMLTextAreaElement>}
                    id={name}
                    placeholder={placeholder}
                    value={field.value || ""}
                    onChange={handleChange}
                    disabled={disabled}
                    rows={rows}
                    maxLength={maxLength}
                    minLength={minLength}
                    data-testid={inputTestId}
                    className={cn(
                      // keep your existing textarea look for now
                      "border-0 outline outline-1 outline-offset-[-1px] outline-blue-700/10 dark:outline-white/20 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none ring-offset-background bg-blue-700/5 dark:bg-white/5 rounded-[10px]",
                      hasError && "border-red-500 focus:border-red-500",
                      Icon && "pl-10",
                      inputClassName
                    )}
                  />
                ) : (
                  <Input
                  ref={ref as React.RefObject<HTMLInputElement>}
                  id={name}
                  type={type}
                  placeholder={placeholder}
                  value={field.value || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  maxLength={maxLength}
                  minLength={minLength}
                  data-testid={inputTestId}
                  variant={inputVariant}
                  uiSize={inputUiSize}
                  intent={resolvedIntent}
                  wrapperClassName={inputWrapperClassName}
                  className={cn(Icon && "pl-10", legacyInputClasses, inputClassName)}
                />

                )}
              </div>

              {(error?.message || helperText) && (
                <p className={cn("text-sm", error?.message ? "text-red-500" : "text-gray-500")}>
                  {error?.message || helperText}
                </p>
              )}
            </div>
          );
        }}
      />
    );
  }
);

RHFText.displayName = "RHFText";
