"use client";

import { forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RFHRatingProps {
  name: string;
  label?: string;
  description?: string; // label description
  helperText?: string;
  tooltipText?: any; // optional tooltip content
  max?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  starsClassName?: string;
}

export const RFHRating = forwardRef<HTMLDivElement, RFHRatingProps>(
  (
    {
      name,
      label,
      description,
      helperText,
      tooltipText,
      max = 5,
      disabled = false,
      required = false,
      className,
      labelClassName,
      starsClassName,
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

          return (
            <div ref={ref} className={cn("flex flex-col gap-2", className)}>
              {(label || description) && (
                <div className="flex items-center justify-between">
                  <div>
                    {label && (
                      <Label
                        htmlFor={name}
                        className={cn(
                          hasError && "text-red-500",
                          labelClassName
                        )}
                      >
                        {label}
                        {required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </Label>
                    )}
                    {description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>

                  {tooltipText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}

              {/* Stars */}
              <div className={cn("flex gap-1", starsClassName)}>
                {Array.from({ length: max }, (_, i) => {
                  const ratingValue = i + 1;
                  const isActive = ratingValue <= (field.value || 0);

                  return (
                    <button
                      key={ratingValue}
                      type="button"
                      disabled={disabled}
                      onClick={() => field.onChange(ratingValue)}
                      onMouseEnter={() => field.onBlur()}
                      className={cn(
                        "focus:outline-none transition-colors",
                        disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          isActive
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {(error?.message || helperText) && (
                <p
                  className={cn(
                    "text-sm",
                    error?.message ? "text-red-500" : "text-gray-500"
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

RFHRating.displayName = "RFHRating";
