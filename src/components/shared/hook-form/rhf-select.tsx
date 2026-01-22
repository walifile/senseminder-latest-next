

// src/components/shared/hook-form/rhf-select.tsx

import type { ElementType } from "react";

import Image from "next/image";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

import { Controller, useFormContext } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

type RHFSelectVariant = "default" | "form" | "glowingSelector";

export interface RHFSelectProps {
  name: string;
  label?: string;
  description?: string; // label description
  placeholder?: string;
  helperText?: string;
  tooltipText?: string; // optional tooltip content
  options: SelectOption[] | string[];
  icon?: ElementType; // icon component, e.g. MonitorPlay
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;

  // ✅ NEW (optional): only affects selects where you pass it
  selectVariant?: RHFSelectVariant;

  // ✅ NEW (optional): lets you tune dropdown without touching global select.tsx
  contentClassName?: string;

  onValueChange?: (value: string) => void;
  triggerTestId?: string;
}

export const RHFSelect = forwardRef<HTMLButtonElement, RHFSelectProps>(
  (
    {
      name,
      label,
      description,
      placeholder = "Select an option",
      helperText,
      tooltipText,
      options = [],
      icon: Icon,
      disabled = false,
      required = false,
      className,
      labelClassName,
      triggerClassName,
      contentClassName,
      selectVariant = "default",
      onValueChange,
      triggerTestId,
    },
    ref
  ) => {
    const { control } = useFormContext();

    const normalizedOptions: SelectOption[] = options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option
    );

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const hasError = !!error;

          return (
            <div className={cn("flex flex-col gap-4", className)}>
              {(label || description) && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {label && (
                      <Label
                        htmlFor={name}
                        className={cn(
                          "text-base font-semibold",
                          hasError && "text-red-500",
                          labelClassName
                        )}
                      >
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                      </Label>
                    )}
                    {description && (
                      <p className="text-sm text-paragraph">{description}</p>
                    )}
                  </div>

                  {tooltipText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            src="/assets/svg/info.svg"
                            alt="info"
                            width={24}
                            height={24}
                            unoptimized
                            className="cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}

              <Select
                value={field.value || ""}
                onValueChange={(val) => {
                  if (onValueChange) onValueChange(val);
                  else field.onChange(val);
                }}
                disabled={disabled}
              >
                <SelectTrigger
                  ref={ref}
                  id={name}
                  variant={selectVariant}
                  data-testid={triggerTestId}
                  className={cn(
                    // keep existing error behavior
                    hasError && "border-red-500 focus:border-red-500",
                    // if using glowingSelector, hide glow overlay on error (only affects new variant)
                    hasError && selectVariant === "glowingSelector" && "before:opacity-0",
                    triggerClassName
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent
                  variant={selectVariant}
                  className={contentClassName}
                >
                  {normalizedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="size-6" />}
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-paragraph block">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(error?.message || helperText) && (
                <p
                  className={cn(
                    "text-sm",
                    error?.message ? "text-red-500" : "text-paragraph"
                  )}
                >
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

RHFSelect.displayName = "RHFSelect";
